import anthropic
from google import genai
from google.genai import types


class AIClient:
    def __init__(self, provider: str, model: str, api_key: str):
        self.provider = provider
        self.model = model
        self.api_key = api_key

    def review(self, system: str, user: str) -> str:
        if self.provider == "claude":
            return self._call_claude(system, user)
        elif self.provider == "gemini":
            return self._call_gemini(system, user)
        else:
            raise ValueError(f"Bilinmeyen AI sağlayıcı: {self.provider}")

    def _call_claude(self, system: str, user: str) -> str:
        client = anthropic.Anthropic(api_key=self.api_key)
        message = client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return message.content[0].text

    def _call_gemini(self, system: str, user: str) -> str:
        client = genai.Client(api_key=self.api_key)
        response = client.models.generate_content(
            model=self.model,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system,
            ),
        )
        return response.text
