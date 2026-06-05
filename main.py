from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

from src.agent import KnowledgeBaseAgent
from src.embeddings import (
    EMBEDDING_PROVIDER_ENV,
    LOCAL_EMBEDDING_MODEL,
    OPENAI_EMBEDDING_MODEL,
    LocalEmbedder,
    OpenAIEmbedder,
    _mock_embed,
)
from src.models import Document
from src.store import EmbeddingStore
from src.chunking import RecursiveChunker

DATA_DIR = Path("data")
ALLOWED_EXTENSIONS = {".md", ".txt"}
SAMPLE_FILES = [
    "data/python_intro.txt",
    "data/vector_store_notes.md",
    "data/rag_system_design.md",
    "data/customer_support_playbook.txt",
    "data/chunking_experiment_report.md",
    "data/vi_retrieval_notes.md",
]


def discover_data_files(data_dir: Path = DATA_DIR) -> list[str]:
    """Return all supported documents in data_dir for the manual demo."""
    if not data_dir.exists() or not data_dir.is_dir():
        return []
    return [
        str(path)
        for path in sorted(data_dir.iterdir())
        if path.is_file() and path.suffix.lower() in ALLOWED_EXTENSIONS
    ]


def parse_markdown_front_matter(content: str) -> tuple[dict[str, str], str]:
    """Parse simple key-value markdown front matter without requiring PyYAML."""
    lines = content.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, content

    metadata: dict[str, str] = {}
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            body = "\n".join(lines[index + 1 :]).strip()
            return metadata, body

        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if key:
            metadata[key] = value

    return {}, content


def clean_document_body(content: str) -> str:
    """Remove benchmark/helper notes that should not be indexed as source facts."""
    meta_section_pattern = r"\n## Ý nghĩa đối với hệ thống hỏi đáp[\s\S]*$"
    return re.sub(meta_section_pattern, "", content).strip()


def load_documents_from_files(file_paths: list[str]) -> list[Document]:
    """Load documents from file paths for the manual demo."""
    documents: list[Document] = []

    for raw_path in file_paths:
        path = Path(raw_path)

        if path.suffix.lower() not in ALLOWED_EXTENSIONS:
            print(f"Skipping unsupported file type: {path} (allowed: .md, .txt)")
            continue

        if not path.exists() or not path.is_file():
            print(f"Skipping missing file: {path}")
            continue

        content = path.read_text(encoding="utf-8")
        front_matter, body = parse_markdown_front_matter(content)
        body = clean_document_body(body)
        metadata = {
            "file_path": str(path),
            "filename": path.name,
            "extension": path.suffix.lower(),
        }
        metadata.update(front_matter)
        metadata.setdefault("source", str(path))

        documents.append(
            Document(
                id=path.stem,
                content=body,
                metadata=metadata,
            )
        )

    return documents


def chunk_documents(docs: list[Document], chunk_size: int = 500) -> list[Document]:
    """Split loaded documents into chunk documents while preserving source metadata."""
    chunker = RecursiveChunker(chunk_size=chunk_size)
    chunked_docs: list[Document] = []

    for doc in docs:
        chunks = chunker.chunk(doc.content)
        for index, chunk in enumerate(chunks, start=1):
            metadata = dict(doc.metadata)
            metadata.update(
                {
                    "doc_id": doc.id,
                    "chunk_index": index,
                    "chunk_count": len(chunks),
                }
            )
            chunked_docs.append(
                Document(
                    id=f"{doc.id}_chunk_{index}",
                    content=chunk,
                    metadata=metadata,
                )
            )

    return chunked_docs


def demo_llm(prompt: str) -> str:
    """A simple mock LLM for manual RAG testing."""
    preview = prompt[:400].replace("\n", " ")
    return f"[DEMO LLM] Generated answer from prompt preview: {preview}..."


def run_manual_demo(question: str | None = None, sample_files: list[str] | None = None) -> int:
    files = sample_files or discover_data_files() or SAMPLE_FILES
    query = question or "Summarize the key information from the loaded files."

    print("=== Manual File Test ===")
    print("Accepted file types: .md, .txt")
    print("Input file list:")
    for file_path in files:
        print(f"  - {file_path}")

    docs = load_documents_from_files(files)
    if not docs:
        print("\nNo valid input files were loaded.")
        print("Create files matching the sample paths above, then rerun:")
        print("  python3 main.py")
        return 1

    print(f"\nLoaded {len(docs)} documents")
    for doc in docs:
        print(f"  - {doc.id}: {doc.metadata.get('file_path')} source={doc.metadata.get('source')}")

    chunked_docs = chunk_documents(docs, chunk_size=500)
    print(f"\nCreated {len(chunked_docs)} chunks with RecursiveChunker(chunk_size=500)")
    for doc in docs:
        doc_chunks = [chunk for chunk in chunked_docs if chunk.metadata.get("doc_id") == doc.id]
        print(f"  - {doc.id}: {len(doc_chunks)} chunks")

    load_dotenv(override=False)
    provider = os.getenv(EMBEDDING_PROVIDER_ENV, "mock").strip().lower()
    if provider == "local":
        try:
            embedder = LocalEmbedder(model_name=os.getenv("LOCAL_EMBEDDING_MODEL", LOCAL_EMBEDDING_MODEL))
        except Exception:
            embedder = _mock_embed
    elif provider == "openai":
        try:
            embedder = OpenAIEmbedder(model_name=os.getenv("OPENAI_EMBEDDING_MODEL", OPENAI_EMBEDDING_MODEL))
        except Exception:
            embedder = _mock_embed
    else:
        embedder = _mock_embed

    print(f"\nEmbedding backend: {getattr(embedder, '_backend_name', embedder.__class__.__name__)}")

    store = EmbeddingStore(collection_name="manual_test_store", embedding_fn=embedder)
    store.add_documents(chunked_docs)

    print(f"\nStored {store.get_collection_size()} chunks in EmbeddingStore")
    print("\n=== EmbeddingStore Search Test ===")
    print(f"Query: {query}")
    search_results = store.search(query, top_k=3)
    for index, result in enumerate(search_results, start=1):
        print(
            f"{index}. score={result['score']:.3f} "
            f"source={result['metadata'].get('source')} "
            f"file={result['metadata'].get('file_path')}"
        )
        print(f"   content preview: {result['content'][:120].replace(chr(10), ' ')}...")

    print("\n=== KnowledgeBaseAgent Test ===")
    agent = KnowledgeBaseAgent(store=store, llm_fn=demo_llm)
    print(f"Question: {query}")
    print("Agent answer:")
    print(agent.answer(query, top_k=3))
    return 0


def main() -> int:
    question = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else None
    return run_manual_demo(question=question)


if __name__ == "__main__":
    raise SystemExit(main())
