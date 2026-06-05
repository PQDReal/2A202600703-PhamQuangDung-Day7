from __future__ import annotations

import hashlib
import math
import re

LOCAL_EMBEDDING_MODEL = "all-MiniLM-L6-v2"
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_PROVIDER_ENV = "EMBEDDING_PROVIDER"


class MockEmbedder:
    """Deterministic embedding backend used by tests and default classroom runs."""

    def __init__(self, dim: int = 64) -> None:
        self.dim = dim
        self._backend_name = "mock hashed lexical embeddings fallback"

    def __call__(self, text: str) -> list[float]:
        tokens = self._tokenize(text)
        features = tokens + [f"{left}_{right}" for left, right in zip(tokens, tokens[1:])]
        vector = [0.0] * self.dim

        for feature in features:
            digest = hashlib.md5(feature.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % self.dim
            sign = 1.0 if int(digest[8:10], 16) % 2 == 0 else -1.0
            vector[index] += sign

        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    def _tokenize(self, text: str) -> list[str]:
        stopwords = {
            "ai",
            "anh",
            "bà",
            "bị",
            "các",
            "có",
            "của",
            "đã",
            "để",
            "được",
            "gì",
            "hồ",
            "là",
            "minh",
            "một",
            "nào",
            "những",
            "ông",
            "the",
            "thì",
            "tin",
            "và",
            "vào",
            "về",
            "vì",
        }
        return [
            token
            for token in re.findall(r"\w+", text.lower(), flags=re.UNICODE)
            if token not in stopwords and len(token) > 1
        ]


class LocalEmbedder:
    """Sentence Transformers-backed local embedder."""

    def __init__(self, model_name: str = LOCAL_EMBEDDING_MODEL) -> None:
        from sentence_transformers import SentenceTransformer

        self.model_name = model_name
        self._backend_name = model_name
        self.model = SentenceTransformer(model_name)

    def __call__(self, text: str) -> list[float]:
        embedding = self.model.encode(text, normalize_embeddings=True)
        if hasattr(embedding, "tolist"):
            return embedding.tolist()
        return [float(value) for value in embedding]


class OpenAIEmbedder:
    """OpenAI embeddings API-backed embedder."""

    def __init__(self, model_name: str = OPENAI_EMBEDDING_MODEL) -> None:
        from openai import OpenAI

        self.model_name = model_name
        self._backend_name = model_name
        self.client = OpenAI()

    def __call__(self, text: str) -> list[float]:
        response = self.client.embeddings.create(model=self.model_name, input=text)
        return [float(value) for value in response.data[0].embedding]


_mock_embed = MockEmbedder()
