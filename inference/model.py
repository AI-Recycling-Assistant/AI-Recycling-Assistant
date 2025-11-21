# inference/model.py

from fastapi import UploadFile
from typing import Dict, Any
import os
import uuid
import json

from google import genai
from google.genai import types

# 사용할 Gemini 모델 이름 (플래시 모델: 빠르고 저렴)
GEMINI_MODEL = "gemini-2.0-flash"  # 필요하면 2.5나 다른 버전으로 변경 가능

# 클라이언트 생성 (GEMINI_API_KEY 환경변수 사용)
client = genai.Client()  #  [oai_citation:2‡googleapis.github.io](https://googleapis.github.io/python-genai/?utm_source=chatgpt.com)


SYSTEM_PROMPT = """
당신은 한국의 분리배출 규정을 잘 아는 환경 전문가입니다.
사용자가 올린 사진을 바탕으로 '이 물건을 어떻게 버려야 하는지'를 알려주세요.

반드시 아래 JSON 형식으로만 응답하세요. 설명 문장이나 다른 말은 절대 쓰지 마세요.

{
  "item_name": "사진 속 주요 물건 이름 (예: 생수병, 캔, 종이컵 등)",
  "category": "재질/분류 (예: 플라스틱, 캔, 종이, 유리, 일반쓰레기, 음식물 등)",
  "disposal_steps": [
    "단계별 분리배출 방법을 한국어 문장으로",
    "예: 내용물을 비우고 라벨을 제거한 뒤 플라스틱류로 배출합니다."
  ],
  "warnings": [
    "주의사항이나 예외가 있으면 작성, 없으면 빈 배열 []"
  ],
  "short_summary": "사용자에게 한 줄로 보여줄 짧은 요약 설명"
}
"""


async def analyze_image(image: UploadFile) -> Dict[str, Any]:
    """
    업로드된 이미지를 Gemini에게 보내서
    분리배출 정보를 JSON으로 받아오는 함수.
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
    #    - image bytes를 Part.from_bytes로 감싸서 contents에 넣습니다.  [oai_citation:3‡Google AI for Developers](https://ai.google.dev/gemini-api/docs/image-understanding?utm_source=chatgpt.com)
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                # 이미지
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type,
                ),
                # 텍스트 프롬프트
                "위 시스템 지시를 따르세요. 이 사진 속 물건의 분리배출 방법을 "
                "지금 정의한 JSON 형식에 정확히 맞춰서 응답만 주세요.",
            ],
            # JSON으로 꼭 떨어지도록 설정 (structured output)  [oai_citation:4‡Google AI for Developers](https://ai.google.dev/gemini-api/docs/structured-output?utm_source=chatgpt.com)
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

    # 3) 응답 파싱 (response.text에 JSON 문자열이 들어옵니다)  [oai_citation:5‡Google AI for Developers](https://ai.google.dev/gemini-api/docs/migrate?utm_source=chatgpt.com)
    try:
        advice = json.loads(response.text)
    except Exception:
        # 혹시 모델이 JSON을 깨먹었을 때 대비
        advice = {"raw_response": response.text}

    # 4) FastAPI가 반환할 최종 JSON
    result: Dict[str, Any] = {
    "gemini_advice": advice,
    "temp_path": temp_path,   # ← 여기 수정됨
    "model": GEMINI_MODEL,
    }

    return result