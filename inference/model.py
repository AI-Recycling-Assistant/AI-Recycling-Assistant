# inference/model.py

import os
import uuid
import json
from typing import Dict, Any, List

from fastapi import UploadFile

from google import genai
from google.genai import types

# 사용할 Gemini 모델 이름 (플래시 모델: 빠르고 저렴)
GEMINI_MODEL = "gemini-2.0-flash"

# 클라이언트 생성 (환경변수 GEMINI_API_KEY 사용)
client = genai.Client()

# --------------------------------------------------
# 1. Gemini에게 보낼 시스템 프롬프트
# --------------------------------------------------
SYSTEM_PROMPT = """
당신은 한국의 분리배출 규정을 잘 아는 환경 전문가입니다.
사용자가 올린 사진을 바탕으로, 사진 속에서 보이는 주요 물체들을 찾아
각각에 대해 분리배출 방법을 안내하세요.

반드시 아래 형식의 **JSON 배열**로만 응답하세요. 다른 문장은 쓰지 마세요.

[
  {
    "object": "물체 이름 (예: 생수병, 플라스틱 컵, 종이컵, 빨대 등)",
    "label": "재질 또는 분류 (예: plastic, paper, metal, glass, general_waste 등)",
    "instruction": "해당 물체를 한국 분리배출 규정에 따라 어떻게 버려야 하는지 한 문장으로 설명"
  }
]

- 배열 원소는 1개 이상이어야 합니다.
- 배열 안의 각 객체는 반드시 object, label, instruction 세 필드를 모두 포함해야 합니다.
- label은 영어 소문자로 통일해도 괜찮습니다.
- instruction은 한국어로 작성하세요.
"""


# --------------------------------------------------
# 2. FastAPI에서 호출할 함수
# --------------------------------------------------
async def analyze_image(image: UploadFile) -> Dict[str, Any]:
    """
    업로드된 이미지를 Gemini에게 보내서
    [ { object, label, instruction }, ... ] 형태의 JSON 배열을 받아오는 함수.
    """

    # 1) 이미지 파일을 temp 디렉토리에 저장 (디버깅/로그용)
    temp_dir = "temp_images"
    os.makedirs(temp_dir, exist_ok=True)

    temp_id = uuid.uuid4().hex

    # 확장자 대충 맞추기 (없으면 기본 jpeg)
    ext = ".jpeg"
    if image.filename and "." in image.filename:
        ext = "." + image.filename.rsplit(".", 1)[-1]

    temp_path = os.path.join(temp_dir, f"{temp_id}{ext}")

    file_bytes = await image.read()

    with open(temp_path, "wb") as f:
        f.write(file_bytes)

    # MIME 타입 (없으면 jpeg로)
    mime_type = image.content_type or "image/jpeg"

    # 2) Gemini에 이미지 + 프롬프트 보내기
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                # 시스템 역할: JSON 형식을 정의
                SYSTEM_PROMPT,
                # 이미지
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type,
                ),
                # 사용자 요청 역할
                "위에서 정의한 JSON 배열 형식에 정확히 맞춰서만 응답하세요.",
            ],
            # JSON으로 떨어지도록 설정
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
    except Exception as e:
        # Gemini 호출 실패 시, 서버가 죽지 않도록 예외 처리
        return {
            "error": "Gemini API 호출 중 오류가 발생했습니다.",
            "detail": str(e),
            "temp_path": temp_path,
        }

    # 3) 응답 파싱
    try:
        advice = json.loads(response.text)
    except Exception:
        # 혹시 모델이 JSON을 깨먹었을 때 대비
        advice = {"raw_response": response.text}

    # 혹시 객체 하나만 줄 수도 있으니, 단일 객체면 리스트로 감싸기
    if isinstance(advice, dict):
        advice = [advice]

    # 4) FastAPI가 반환할 최종 JSON (Spring DTO랑 구조 맞춤)
    result: Dict[str, Any] = {
        "gemini_advice": advice,   # List[ {object, label, instruction} ]
        "temp_path": temp_path,
        "model": GEMINI_MODEL,
    }

    return result