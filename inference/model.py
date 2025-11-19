# inference/model.py
from ultralytics import YOLO
from paddleocr import PaddleOCR

from fastapi import UploadFile
from typing import List, Dict, Any
import os
import uuid

# ==============================
# 1) YOLOv8 / PaddleOCR 로드
# ==============================

# 학습된 가중치 파일 경로
YOLO_WEIGHTS_PATH = "yolov8n.pt"  # 필요하면 custom weight 로 교체

print("[MODEL] Loading YOLOv8 model...")
yolo_model = YOLO(YOLO_WEIGHTS_PATH)

print("[MODEL] Loading PaddleOCR model...")
# lang 값은 프로젝트에 맞게 조정 (예: 'korean', 'en', 'korean+en' 등)
ocr_model = PaddleOCR(use_angle_cls=True, lang="korean")

print("[MODEL] Models loaded successfully.")


# ==============================
# 2) YOLO / OCR 개별 함수
# ==============================

def run_yolo(image_path: str) -> List[Dict[str, Any]]:
    """
    YOLOv8으로 객체 탐지 수행
    반환: [{label, confidence, box[x1,y1,x2,y2]}, ...]
    """
    results = yolo_model(image_path)[0]

    detections: List[Dict[str, Any]] = []
    for box in results.boxes:
        cls_id = int(box.cls[0].item())
        label = results.names[cls_id]
        conf = float(box.conf[0].item())
        x1, y1, x2, y2 = box.xyxy[0].tolist()

        detections.append(
            {
                "label": label,
                "confidence": conf,
                "box": [x1, y1, x2, y2],
            }
        )

    return detections


def run_ocr(image_path: str) -> List[Dict[str, Any]]:
    """
    PaddleOCR로 텍스트 인식
    반환: [{text, confidence, box}, ...]
    - PaddleOCR 버전에 따라 result 포맷이 달라도 최대한 빈 리스트만 반환하도록 방어적으로 처리
    """
    texts: List[Dict[str, Any]] = []

    try:
        result = ocr_model.ocr(image_path)
        print("[OCR RAW RESULT]", result)
    except Exception as e:
        print("[OCR ERROR] ocr_model.ocr() failed:", e)
        return []

    # ---- 1) 옛날 스타일: [[ [box, (text, conf)], ... ], ... ] ----
    try:
        for line in result:
            for box, (text, conf) in line:
                texts.append(
                    {
                        "text": text,
                        "confidence": float(conf),
                        "box": box,  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                    }
                )
        return texts
    except Exception as e:
        print("[OCR PARSE WARNING] old-style parse failed:", e)

    # ---- 2) 새 스타일(딕셔너리 리스트) 가정: [{dt_polys, rec_text, rec_score}, ...] ----
    try:
        for item in result:
            if isinstance(item, dict):
                polys = item.get("dt_polys", [])
                rec_texts = item.get("rec_text", [])
                rec_scores = item.get("rec_score", [])
                for poly, text, conf in zip(polys, rec_texts, rec_scores):
                    texts.append(
                        {
                            "text": text,
                            "confidence": float(conf),
                            "box": poly,
                        }
                    )
        return texts
    except Exception as e:
        print("[OCR PARSE ERROR] dict-style parse failed:", e)
        return []


# ==============================
# 3) 최종 라벨 결정 로직
# ==============================

def decide_final_label(
    yolo_detections: List[Dict[str, Any]],
    ocr_results: List[Dict[str, Any]],
) -> str:
    """
    YOLO + OCR 결과를 바탕으로 최종 분리 라벨을 결정.
    - 일단은 가장 confidence 높은 YOLO 라벨을 그대로 사용.
    - 나중에 필요하면 여기서 라벨 매핑 / OCR 기반 보정 로직만 수정하면 됨.
    """
    if not yolo_detections:
        return "unknown"

    # 신뢰도가 가장 높은 박스 하나 선택
    best = sorted(
        yolo_detections, key=lambda d: d.get("confidence", 0.0), reverse=True
    )[0]
    return best["label"]


# ==============================
# 4) FastAPI에서 직접 호출하는 엔트리 포인트
# ==============================

async def analyze_image(image: UploadFile) -> Dict[str, Any]:
    """
    FastAPI /analyze-image 엔드포인트에서 바로 사용하는 함수.

    1) UploadFile 을 temp_images 폴더에 저장
    2) YOLO 탐지
    3) OCR 인식
    4) 최종 라벨 결정
    5) 최종 결과 딕셔너리 반환
    """
    # 1) 임시 저장 경로 준비
    os.makedirs("temp_images", exist_ok=True)
    original_name = image.filename or ""
    ext = os.path.splitext(original_name)[1] or ".jpg"
    temp_filename = f"{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join("temp_images", temp_filename)

    # 2) 파일 저장
    data = await image.read()
    with open(temp_path, "wb") as f:
        f.write(data)

    print(f"[ANALYZE] Saved upload to: {temp_path}")

    # 3) YOLO / OCR 실행
    yolo_detections = run_yolo(temp_path)
    ocr_results = run_ocr(temp_path)

    # 4) 최종 라벨 결정
    final_label = decide_final_label(yolo_detections, ocr_results)

    # 5) 결과 반환 (FastAPI가 그대로 JSON으로 내려줌)
    return {
        "final_label": final_label,
        "yolo_detections": yolo_detections,
        "ocr_results": ocr_results,
        "temp_path": temp_path,  # 디버깅용(나중에 필요 없으면 삭제해도 됨)
    }
