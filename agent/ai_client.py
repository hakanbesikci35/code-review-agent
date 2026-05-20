import anthropic
from google import genai


class AIClient:
    def __init__(self, provider: str, model: str, api_key: str):
        self.provider = provider
        self.model = model
        self.api_key = api_key

    def review(self, prompt: str) -> str:
        if self.provider == "claude":
            return self._call_claude(prompt)
        elif self.provider == "gemini":
            return self._call_gemini(prompt)
        else:
            raise ValueError(f"Bilinmeyen AI sağlayıcı: {self.provider}")

    def _call_claude(self, prompt: str) -> str:
        client = anthropic.Anthropic(api_key=self.api_key)
        message = client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text

    def _call_gemini(self, prompt: str) -> str:
        client = genai.Client(api_key=self.api_key)
        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
        )
        return response.text
