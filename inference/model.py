# inference/model.py

import os
import uuid
import json
from typing import Dict, Any, List

from fastapi import UploadFile
from google import genai
from google.genai import types

GEMINI_MODEL = "gemini-2.0-flash"
client = genai.Client()

SYSTEM_PROMPT = """
당신은 환경 전문가입니다.
사용자가 올린 사진을 분석하여 분리배출 정보만 JSON 배열로 반환하십시오.

반드시 아래와 같은 JSON 배열 하나만 출력하세요:

[
  {
    "object": "물체 이름",
    "label": "plastic | paper | metal | glass | general_waste",
    "instruction": "한국 분리배출 규정에 따른 처리 방법"
  }
]

절대로 JSON 외의 문장은 출력하지 마십시오.
"""

async def analyze_image(image: UploadFile) -> Dict[str, Any]:

    temp_dir = "temp_images"
    os.makedirs(temp_dir, exist_ok=True)

    temp_id = uuid.uuid4().hex
    ext = ".jpeg"
    if image.filename and "." in image.filename:
        ext = "." + image.filename.rsplit(".", 1)[-1]

    temp_path = os.path.join(temp_dir, f"{temp_id}{ext}")
    file_bytes = await image.read()
    with open(temp_path, "wb") as f:
        f.write(file_bytes)

    mime_type = image.content_type or "image/jpeg"

    # 🔥 Gemini 호출부 — 완전히 안정화된 버전
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                SYSTEM_PROMPT,
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                max_output_tokens=2048,
                temperature=0,
            ),
        )

        raw = response.text

    except Exception as e:
        return {"error": "Gemini API 오류", "detail": str(e)}

    # JSON 파싱
    advice = None

    try:
        advice = json.loads(raw)
    except:
        try:
            fixed = raw.replace("\n", "").replace("\r", "")
            fixed = fixed.replace("}{", "},{")

            if not fixed.startswith("["):
                fixed = "[" + fixed
            if not fixed.endswith("]"):
                fixed = fixed + "]"

            advice = json.loads(fixed)
        except:
            advice = [{"raw_response": raw}]

    if isinstance(advice, dict):
        advice = [advice]

    return {
        "gemini_advice": advice,
        "temp_path": temp_path,
        "model": GEMINI_MODEL,
    }