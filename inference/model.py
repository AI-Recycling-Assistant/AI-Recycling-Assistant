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
당신은 한국의 분리배출 규정을 잘 아는 환경 전문가입니다.
사용자가 올린 사진을 바탕으로 사진 속의 주요 물체들을 찾아,
각각에 대해 분리배출 방법을 안내하세요.

⚠️ 반드시 아래 조건을 지키세요:
1. JSON 배열만 출력 (문장, 설명 절대 금지)
2. 모든 설명(instruction)은 **반드시 100% 한국어로 작성**
3. object(물체 이름) 또한 **반드시 한국어로 작성**
4. label은 영어 소문자(plastic, paper 등)로 작성

출력 형식:

[
  {
    "object": "물체 이름 (예: 생수병, 플라스틱 컵, 종이컵 등 — 반드시 한국어)",
    "label": "plastic / paper / metal / glass / general_waste",
    "instruction": "한국 분리배출 규정에 따라 버리는 방법 (무조건 한국어)"
  }
]
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