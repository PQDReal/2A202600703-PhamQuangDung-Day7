/* ============================================
   TEXTENGINE LAB — INTERACTIVE APP
   ============================================ */

// =============================================
// SAMPLE DATA (mirroring actual data/ folder)
// =============================================
const SAMPLES = {
  vector_store: `# Vector Store Notes

A vector store is a database or storage layer designed to keep embeddings and retrieve the most similar items to a query vector. In practical AI systems, a vector store is often used to support semantic search, recommendation, clustering workflows, and retrieval-augmented generation.

## Typical Workflow

A common vector search pipeline has four stages:

1. **Chunk documents** into smaller units that preserve meaning.
2. **Embed each chunk** into a dense numerical vector.
3. **Store the vector and metadata** so records can be searched and filtered.
4. **Embed the query** and rank stored vectors by similarity.

The quality of the retrieval system depends heavily on the quality of the chunks. If chunks are too small, they may lose context and produce incomplete matches. If chunks are too large, they may contain too many unrelated ideas and dilute semantic relevance.

## Metadata Matters

Metadata is often as important as the vector itself. Teams frequently store fields such as document source, language, author, product area, publication date, and access control level. When a user asks a question about a specific domain, metadata filters can narrow the search space and improve precision.

For example, a support assistant might restrict retrieval to only public troubleshooting guides, while an internal analyst tool might search engineering postmortems and incident documentation.

## Common Risks

Vector stores are powerful, but retrieval is not magically correct. Poor chunking, low-quality embeddings, missing metadata, and weak evaluation practices can all cause misleading results.`,

  rag_design: `# RAG System Design

Retrieval-Augmented Generation (RAG) is an architecture pattern that improves the quality and reliability of language model outputs by retrieving relevant documents before generating a response.

## Core Components

A RAG system consists of four primary components working together:

**Ingestion pipeline**: Documents are loaded, chunked, embedded, and stored in a vector database. This step runs offline before any user queries arrive.

**Retrieval module**: When a query arrives, it is embedded and compared against stored document vectors. The top-k most similar chunks are selected as context.

**Prompt assembly**: Retrieved chunks are formatted into a prompt template. The template usually instructs the model to answer only from the provided context.

**Generation**: The assembled prompt is passed to a language model, which produces a grounded response. The model is guided to say when context is insufficient.

## Design Decisions

Chunking strategy matters greatly for retrieval precision. Small chunks may miss context; large chunks may dilute relevance scores. Overlapping windows help bridge boundary effects.

Embedding model choice determines semantic quality. Local models like all-MiniLM-L6-v2 offer good quality with no API cost. OpenAI embeddings provide higher semantic fidelity at a per-token cost.

## Failure Modes

RAG systems commonly fail due to poor chunking boundaries, mismatched embedding dimensions, outdated document collections, and vague queries that do not match stored terminology.`,

  vi_retrieval: `# Ghi Chú Retrieval Tiếng Việt

Hệ thống retrieval là nền tảng của kiến trúc RAG. Khi người dùng đặt câu hỏi, hệ thống cần tìm ra đoạn tài liệu phù hợp nhất để cung cấp ngữ cảnh cho mô hình ngôn ngữ.

## Tại Sao Retrieval Quan Trọng

Chất lượng của câu trả lời cuối cùng phụ thuộc trực tiếp vào chất lượng của retrieval. Nếu hệ thống lấy nhầm đoạn không liên quan, mô hình sẽ hoặc bịa ra câu trả lời sai, hoặc nói rằng nó không có đủ thông tin.

## Các Thách Thức Với Tiếng Việt

Tiếng Việt có một số đặc điểm khiến retrieval phức tạp hơn so với tiếng Anh. Ranh giới từ trong tiếng Việt không dùng khoảng trắng giống tiếng Anh, và các mô hình embedding được huấn luyện chủ yếu trên văn bản tiếng Anh có thể không nắm bắt tốt ngữ nghĩa của văn bản tiếng Việt.

## Chiến Lược Cải Thiện

Sử dụng mô hình embedding đa ngôn ngữ như multilingual-e5-large hoặc paraphrase-multilingual-MiniLM-L12-v2.
Thêm metadata ngôn ngữ để lọc trước khi tìm kiếm.
Cân nhắc dịch câu hỏi sang tiếng Anh nếu tài liệu chủ yếu bằng tiếng Anh.

## Kết Luận

Retrieval trong môi trường đa ngôn ngữ đòi hỏi cẩn thận trong lựa chọn embedding model, chiến lược chunking, và thiết kế metadata.`,

  chunking_report: `# Chunking Experiment Report

## Purpose

This report summarizes a small experiment comparing fixed-size chunking, sentence-based chunking, and recursive chunking on internal documentation. The objective was to understand how chunk boundaries affect retrieval quality, context preservation, and the usefulness of returned passages.

## Fixed-Size Chunking

Fixed-size chunking was simple to implement and produced predictable chunk counts. It worked reasonably well for long technical documents because every chunk stayed below a target size. However, some chunks split explanations in awkward places, especially when a procedure spanned multiple sentences. In those cases, search results sometimes returned a fragment that mentioned the right keyword but omitted the actual instruction.

## Sentence-Based Chunking

Sentence-based chunking improved readability because each chunk aligned with natural language boundaries. This made manual inspection easier and often produced more coherent retrieval results for short policy documents and FAQs. The downside was that chunk sizes became less consistent, and some dense sections still exceeded ideal embedding length when too many long sentences were grouped together.

## Recursive Chunking

Recursive chunking offered the best balance in the experiment. It first tried to split on larger structural boundaries such as paragraphs, then fell back to smaller separators only when needed. As a result, most chunks preserved context while still staying within the target size range.

## Conclusion

The experiment suggests that there is no universal best strategy, but recursive chunking is a strong default for mixed technical documentation. Teams should still validate this assumption with their own queries.`,

  python_intro: `# Introduction to Python

Python is a high-level, interpreted programming language known for its clear syntax and readability. It was created by Guido van Rossum and first released in 1991. Python emphasizes code readability and allows programmers to express concepts in fewer lines of code than languages like C++ or Java.

## Key Features

Python supports multiple programming paradigms, including procedural, object-oriented, and functional programming. Its dynamic typing and automatic memory management make it suitable for rapid development.

The language includes a comprehensive standard library covering areas such as file I/O, system calls, sockets, and even interfaces to graphical user interface toolkits. This has led to Python being called a batteries included language.

## Data Science Applications

Python has become the dominant language for data science and machine learning. Libraries such as NumPy provide efficient array operations, pandas enables data manipulation and analysis, and scikit-learn offers a wide range of machine learning algorithms.

Deep learning frameworks like TensorFlow and PyTorch are also primarily accessed through Python, making it the central language for modern AI research and applications.

## Getting Started

To start using Python for data analysis, install Anaconda, which bundles Python with common scientific packages. Then open a Jupyter notebook to write and execute code interactively.`,

  customer_support: `# Customer Support Playbook

## Refund Policy

Customers may request a full refund within 30 days of purchase if the product does not meet expectations. Refund requests must be submitted through the support portal. All refund requests require approval from a manager before processing.

Partial refunds may be issued for products returned after 30 days but within 90 days, subject to a 15 percent restocking fee. After 90 days, no refunds are available except for defective products covered under warranty.

## Escalation Process

First-level support agents should attempt to resolve all issues within one business day. If the issue cannot be resolved at first level, escalate to the second-level technical team using the internal ticket system.

Critical issues affecting multiple customers should be escalated immediately to the on-call engineer regardless of the time of day.

## Communication Standards

All customer communications must maintain a professional and empathetic tone. Agents should acknowledge the customer's frustration before explaining policy or next steps.

Response time targets: email within 4 hours, chat within 2 minutes, phone calls answered within 3 rings.`
};

// =============================================
// BENCHMARK QUERIES (Use Cases)
// =============================================
const BENCHMARK_QUERIES = [
  {
    id: 1,
    query: "What are the four stages of a vector search pipeline?",
    domain: "Vector Store",
    topic: "retrieval",
    goldAnswer: "The four stages are: (1) Chunk documents into smaller units that preserve meaning, (2) Embed each chunk into a dense numerical vector, (3) Store the vector and metadata so records can be searched and filtered, (4) Embed the query and rank stored vectors by similarity.",
    chunks: [
      { rank: 1, source: "vector_store_notes.md", score: 0.847, text: "A common vector search pipeline has four stages: 1. Chunk documents into smaller units that preserve meaning. 2. Embed each chunk into a dense numerical vector. 3. Store the vector and metadata so records can be searched and filtered. 4. Embed the query and rank stored vectors by similarity." },
      { rank: 2, source: "rag_system_design.md", score: 0.623, text: "Ingestion pipeline: Documents are loaded, chunked, embedded, and stored in a vector database. This step runs offline before any user queries arrive. Retrieval module: When a query arrives, it is embedded and compared against stored document vectors." },
      { rank: 3, source: "chunking_experiment_report.md", score: 0.412, text: "The objective was to understand how chunk boundaries affect retrieval quality, context preservation, and the usefulness of returned passages." }
    ]
  },
  {
    id: 2,
    query: "Why does metadata matter in retrieval?",
    domain: "Metadata Filtering",
    topic: "retrieval",
    goldAnswer: "Metadata narrows the search space by fields like source, language, department, topic, or date, improving precision and traceability. It prevents the application from surfacing text from the wrong department or outdated material.",
    chunks: [
      { rank: 1, source: "vector_store_notes.md", score: 0.912, text: "Metadata is often as important as the vector itself. Teams frequently store fields such as document source, language, author, product area, publication date, and access control level. When a user asks a question about a specific domain, metadata filters can narrow the search space and improve precision." },
      { rank: 2, source: "rag_system_design.md", score: 0.734, text: "A RAG system consists of four primary components working together. When a query arrives, it is embedded and compared against stored document vectors. The top-k most similar chunks are selected as context." },
      { rank: 3, source: "vi_retrieval_notes.md", score: 0.589, text: "Thêm metadata ngôn ngữ để lọc trước khi tìm kiếm. Cân nhắc dịch câu hỏi sang tiếng Anh nếu tài liệu chủ yếu bằng tiếng Anh." }
    ]
  },
  {
    id: 3,
    query: "Why should a RAG assistant answer from retrieved context?",
    domain: "RAG Design",
    topic: "rag",
    goldAnswer: "Retrieved context grounds the answer in trusted documents and reduces hallucination. The agent is instructed to answer only from retrieved context and to say clearly when context is insufficient.",
    chunks: [
      { rank: 1, source: "rag_system_design.md", score: 0.891, text: "The assembled prompt is passed to a language model, which produces a grounded response. The model is guided to say when context is insufficient. The template usually instructs the model to answer only from the provided context." },
      { rank: 2, source: "vi_retrieval_notes.md", score: 0.712, text: "Nếu hệ thống lấy nhầm đoạn không liên quan, mô hình sẽ hoặc bịa ra câu trả lời sai, hoặc nói rằng nó không có đủ thông tin." },
      { rank: 3, source: "chunking_experiment_report.md", score: 0.534, text: "Most chunks preserved context while still staying within the target size range. For the tested data, recursive chunking produced the most consistently useful passages for downstream question answering." }
    ]
  },
  {
    id: 4,
    query: "What can make retrieval fail?",
    domain: "Failure Analysis",
    topic: "retrieval",
    goldAnswer: "Retrieval can fail due to: poor chunking boundaries, low-quality embeddings, missing metadata, outdated documents, vague queries that don't match stored terminology, or multilingual mismatch between query and documents.",
    chunks: [
      { rank: 1, source: "rag_system_design.md", score: 0.876, text: "RAG systems commonly fail due to poor chunking boundaries, mismatched embedding dimensions, outdated document collections, and vague queries that do not match stored terminology." },
      { rank: 2, source: "vector_store_notes.md", score: 0.798, text: "Poor chunking, low-quality embeddings, missing metadata, and weak evaluation practices can all cause misleading results. A system may retrieve passages that are semantically adjacent but not actually useful for the user's task." },
      { rank: 3, source: "chunking_experiment_report.md", score: 0.654, text: "Fixed-size chunking was simple to implement but some chunks split explanations in awkward places. Search results sometimes returned a fragment that mentioned the right keyword but omitted the actual instruction." }
    ]
  },
  {
    id: 5,
    query: "Which chunking strategy was strongest in the sample experiment?",
    domain: "Strategy Comparison",
    topic: "chunking",
    goldAnswer: "Recursive chunking was strongest, because it balances context preservation with manageable chunk size. It first tried to split on paragraph boundaries, then fell back to smaller separators only when needed.",
    chunks: [
      { rank: 1, source: "chunking_experiment_report.md", score: 0.934, text: "Recursive chunking offered the best balance in the experiment. It first tried to split on larger structural boundaries such as paragraphs, then fell back to smaller separators only when needed. As a result, most chunks preserved context while still staying within the target size range." },
      { rank: 2, source: "vector_store_notes.md", score: 0.712, text: "The quality of the retrieval system depends heavily on the quality of the chunks. If chunks are too small, they may lose context. If chunks are too large, they may dilute semantic relevance." },
      { rank: 3, source: "rag_system_design.md", score: 0.623, text: "Chunking strategy matters greatly for retrieval precision. Small chunks may miss context; large chunks may dilute relevance scores. Overlapping windows help bridge boundary effects." }
    ]
  }
];

// =============================================
// MOCK EMBEDDER (mirrors Python implementation)
// =============================================
function md5(str) {
  // Simple deterministic hash (not real MD5, but consistent)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(4);
}

function mockEmbed(text, dim = 64) {
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }
  const vector = [];
  for (let i = 0; i < dim; i++) {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    vector.push((seed / 0xFFFFFFFF) * 2 - 1);
  }
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map(v => v / norm);
}

function semanticEmbed(text, dim = 64) {
  // Improved semantic-aware mock using term frequency
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const vector = new Array(dim).fill(0);
  words.forEach((word, wi) => {
    let h = 0;
    for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) % dim;
    vector[Math.abs(h)] += 1 / Math.log(wi + 2);
    vector[Math.abs((h + 17) % dim)] += 0.5 / Math.log(wi + 2);
  });
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map(v => v / norm);
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function cosineSimilarity(a, b) {
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

// =============================================
// CHUNKING (mirrors Python implementation)
// =============================================
function fixedSizeChunk(text, chunkSize, overlap) {
  if (!text) return [];
  if (text.length <= chunkSize) return [text];
  const step = chunkSize - overlap;
  const chunks = [];
  for (let start = 0; start < text.length; start += step) {
    chunks.push(text.slice(start, start + chunkSize));
    if (start + chunkSize >= text.length) break;
  }
  return chunks;
}

function sentenceChunk(text, maxSentences = 3) {
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?])[\s\n]+/).map(s => s.trim()).filter(s => s);
  if (!sentences.length) return [text.trim()];
  const chunks = [];
  for (let i = 0; i < sentences.length; i += maxSentences) {
    const group = sentences.slice(i, i + maxSentences);
    chunks.push(group.join(' ').trim());
  }
  return chunks;
}

function recursiveChunk(text, chunkSize, separators = ['\n\n', '\n', '. ', ' ', '']) {
  if (!text) return [];
  const results = _recursiveSplit(text.trim(), chunkSize, separators);
  return results.map(c => c.trim()).filter(c => c);
}

function _recursiveSplit(text, chunkSize, separators) {
  if (text.length <= chunkSize) return [text];
  if (!separators.length) return fixedSizeChunk(text, chunkSize, 0);

  const sep = separators[0];
  const rest = separators.slice(1);

  if (!sep) return fixedSizeChunk(text, chunkSize, 0);
  if (!text.includes(sep)) return _recursiveSplit(text, chunkSize, rest);

  const pieces = text.split(sep).map(p => p.trim()).filter(p => p);
  const chunks = [];
  let current = '';

  for (const piece of pieces) {
    const candidate = current ? `${current}${sep}${piece}` : piece;
    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      if (current) { chunks.push(current); current = ''; }
      if (piece.length <= chunkSize) {
        current = piece;
      } else {
        chunks.push(..._recursiveSplit(piece, chunkSize, rest));
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// =============================================
// STATE
// =============================================
let currentMode = 'type';
let currentText = '';
let currentStrategy = 'fixed';
let simHistory = [];
let analysisState = null;

// =============================================
// MODE SWITCHING
// =============================================
function switchMode(mode) {
  currentMode = mode;
  ['type', 'upload', 'sample'].forEach(m => {
    document.getElementById(`${m}Mode`).classList.add('hidden');
    document.getElementById(`${m}Tab`).classList.remove('active');
  });
  document.getElementById(`${mode}Mode`).classList.remove('hidden');
  document.getElementById(`${mode}Tab`).classList.add('active');
}

function loadSample(key) {
  currentText = SAMPLES[key];
  document.getElementById('textInput').value = currentText;
  document.getElementById('charCount').textContent = currentText.length;
  switchMode('type');
}

// =============================================
// ANALYSIS
// =============================================
function analyzeText() {
  const textEl = document.getElementById('textInput');
  const text = (currentMode === 'type' ? textEl.value : currentText).trim();

  if (!text) {
    alert('Vui lòng nhập văn bản trước khi phân tích!');
    return;
  }

  currentText = text;
  const chunkSize = parseInt(document.getElementById('chunkSize').value);
  const overlap = parseInt(document.getElementById('overlap').value);
  const embedder = document.getElementById('embedder').value;

  // Show processing
  document.getElementById('processingBadge').classList.remove('hidden');
  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('analysisResults').classList.add('hidden');

  setTimeout(() => {
    const fixedChunks = fixedSizeChunk(text, chunkSize, overlap);
    const sentenceChunks = sentenceChunk(text, 3);
    const recursiveChunks = recursiveChunk(text, chunkSize);

    analysisState = { text, chunkSize, overlap, embedder, fixedChunks, sentenceChunks, recursiveChunks };

    // Update metrics
    document.getElementById('metricChars').textContent = text.length;
    document.getElementById('metricWords').textContent = text.split(/\s+/).filter(w => w).length;

    // Show recursive by default (best strategy)
    currentStrategy = 'recursive';
    renderStrategy('recursive');

    // Embedding viz
    const embedFn = embedder === 'semantic' ? semanticEmbed : mockEmbed;
    const emb = embedFn(recursiveChunks[0] || text);
    renderEmbeddingViz(emb);

    document.getElementById('processingBadge').classList.add('hidden');
    document.getElementById('analysisResults').classList.remove('hidden');
    document.getElementById('analysisResults').classList.add('fade-in');

    // Update tabs
    document.querySelectorAll('.strat-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tabRecursive').classList.add('active');
  }, 600);
}

function renderStrategy(strategy) {
  if (!analysisState) return;
  const { fixedChunks, sentenceChunks, recursiveChunks } = analysisState;

  const chunks = strategy === 'fixed' ? fixedChunks :
                 strategy === 'sentence' ? sentenceChunks : recursiveChunks;

  const avg = chunks.length ? Math.round(chunks.reduce((s, c) => s + c.length, 0) / chunks.length) : 0;
  document.getElementById('metricChunks').textContent = chunks.length;
  document.getElementById('metricAvg').textContent = avg;

  const container = document.getElementById('chunksDisplay');
  container.innerHTML = '';

  chunks.forEach((chunk, i) => {
    const div = document.createElement('div');
    div.className = 'chunk-item';
    div.innerHTML = `
      <div class="chunk-header">
        <span class="chunk-num">Chunk ${i + 1}</span>
        <span class="chunk-len">${chunk.length} chars</span>
      </div>
      <div class="chunk-text">${escapeHtml(chunk)}</div>
    `;
    container.appendChild(div);
  });
}

function showStrategy(strategy) {
  currentStrategy = strategy;
  document.querySelectorAll('.strat-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab${strategy.charAt(0).toUpperCase() + strategy.slice(1)}`).classList.add('active');
  renderStrategy(strategy);

  // Update embedding viz
  if (analysisState) {
    const chunks = strategy === 'fixed' ? analysisState.fixedChunks :
                   strategy === 'sentence' ? analysisState.sentenceChunks : analysisState.recursiveChunks;
    const embedFn = analysisState.embedder === 'semantic' ? semanticEmbed : mockEmbed;
    const emb = embedFn(chunks[0] || analysisState.text);
    renderEmbeddingViz(emb);
  }
}

function renderEmbeddingViz(embedding) {
  const container = document.getElementById('embeddingViz');
  container.innerHTML = '';
  const maxVal = Math.max(...embedding.map(Math.abs));
  embedding.forEach(val => {
    const bar = document.createElement('div');
    bar.className = 'embed-bar';
    const pct = Math.abs(val) / maxVal;
    const h = Math.round(pct * 40) + 4;
    const hue = val >= 0 ? 258 : 10;
    bar.style.height = `${h}px`;
    bar.style.background = `hsl(${hue}, 80%, ${40 + pct * 30}%)`;
    bar.style.opacity = 0.4 + pct * 0.6;
    container.appendChild(bar);
  });
}

// =============================================
// SIMILARITY
// =============================================
function computeSimilarity() {
  const textA = document.getElementById('simTextA').value.trim();
  const textB = document.getElementById('simTextB').value.trim();
  if (!textA || !textB) { alert('Vui lòng nhập cả hai câu!'); return; }

  const embedFn = mockEmbed;
  const vecA = embedFn(textA);
  const vecB = embedFn(textB);
  const score = cosineSimilarity(vecA, vecB);
  const normA = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0)).toFixed(4);
  const normB = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0)).toFixed(4);
  const dot = dotProduct(vecA, vecB).toFixed(4);

  // Update display
  document.getElementById('simScoreVal').textContent = score.toFixed(4);
  document.getElementById('simNormA').textContent = normA;
  document.getElementById('simNormB').textContent = normB;
  document.getElementById('simDot').textContent = dot;

  // Circle arc
  const arc = document.getElementById('simProgressArc');
  const circumference = 314;
  const normalizedScore = (score + 1) / 2; // -1..1 → 0..1
  const offset = circumference * (1 - normalizedScore);
  arc.style.strokeDashoffset = offset;

  const scoreColor = score > 0.5 ? '#10b981' : score > 0.1 ? '#f59e0b' : '#6366f1';
  arc.style.stroke = scoreColor;

  // Interpretation
  const tag = document.getElementById('interpTag');
  const txt = document.getElementById('interpText');
  if (score > 0.6) {
    tag.className = 'interp-tag high';
    tag.textContent = '🟢 High Similarity';
    txt.textContent = 'Hai đoạn văn bản có vector gần nhau trong không gian embedding → khả năng cao chúng nói về cùng chủ đề hoặc concept.';
  } else if (score > 0.2) {
    tag.className = 'interp-tag medium';
    tag.textContent = '🟡 Medium Similarity';
    txt.textContent = 'Hai đoạn có một số điểm chung nhưng không hoàn toàn về cùng chủ đề. Retrieval có thể trả về nhưng không phải lựa chọn tốt nhất.';
  } else if (score > 0) {
    tag.className = 'interp-tag medium';
    tag.textContent = '🟠 Low-Medium Similarity';
    txt.textContent = 'Vector gần nhau nhẹ. Mock embedder có thể không phản ánh đúng ngữ nghĩa thật. Dùng semantic embedder cho kết quả chính xác hơn.';
  } else {
    tag.className = 'interp-tag low';
    tag.textContent = '🔴 Low / Negative Similarity';
    txt.textContent = 'Hai đoạn khác nhau hoàn toàn (hoặc mock embedder tạo ra vector không liên quan đến ngữ nghĩa). Thường xảy ra với mock backend.';
  }

  // History
  simHistory.unshift({ score, textA: textA.slice(0, 40), textB: textB.slice(0, 40) });
  if (simHistory.length > 5) simHistory.pop();
  renderSimHistory();

  document.getElementById('similarityResult').classList.remove('hidden');
  document.getElementById('similarityResult').classList.add('fade-in');
}

function renderSimHistory() {
  const list = document.getElementById('simHistoryList');
  list.innerHTML = simHistory.map(item => `
    <div class="history-item">
      <span class="history-score" style="color: ${item.score > 0.3 ? '#10b981' : item.score > 0 ? '#f59e0b' : '#ef4444'}">
        ${item.score.toFixed(4)}
      </span>
      <div class="history-pair">
        <span>"${escapeHtml(item.textA)}..."</span>
        <span style="color:#475569"> vs </span>
        <span>"${escapeHtml(item.textB)}..."</span>
      </div>
    </div>
  `).join('');
}

function loadPreset(type) {
  const presets = {
    high: { a: 'Python is a programming language used for data analysis.', b: 'Python is commonly used to analyze data and build software.' },
    low: { a: 'The weather is rainy today.', b: 'Neural networks learn from data.' },
    vector: { a: 'Vector databases store embeddings for similarity search.', b: 'A vector store keeps numerical representations of text for retrieval.' },
    customer: { a: 'Customer refunds require manager approval.', b: 'Refund requests need approval from a manager before processing.' }
  };
  const p = presets[type];
  document.getElementById('simTextA').value = p.a;
  document.getElementById('simTextB').value = p.b;
  computeSimilarity();
}

// =============================================
// USE CASES
// =============================================
function renderUseCases() {
  const list = document.getElementById('queryList');
  list.innerHTML = BENCHMARK_QUERIES.map(q => `
    <button class="query-btn" onclick="showUseCase(${q.id})" id="qbtn${q.id}">
      <div class="query-num">Query #${q.id} · ${q.domain}</div>
      <div class="query-text">${escapeHtml(q.query)}</div>
      <div class="query-meta">Topic: ${q.topic}</div>
    </button>
  `).join('');
}

function showUseCase(id) {
  document.querySelectorAll('.query-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`qbtn${id}`).classList.add('active');

  const q = BENCHMARK_QUERIES.find(x => x.id === id);
  const panel = document.getElementById('usecaseResult');

  const chunksHtml = q.chunks.map(c => `
    <div class="uc-chunk">
      <div class="uc-chunk-header">
        <div class="uc-rank">${c.rank}</div>
        <span class="uc-source">📄 ${c.source}</span>
        <span class="uc-score-badge">score: ${c.score.toFixed(3)}</span>
      </div>
      <div class="uc-chunk-text">${escapeHtml(c.text)}</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="uc-result-header fade-in">
      <h4>🔍 Query #${q.id} — ${q.domain}</h4>
      <div class="uc-query-box">${escapeHtml(q.query)}</div>
    </div>

    <h5 style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin:16px 0 10px">Top-3 Retrieved Chunks</h5>
    <div class="uc-chunks">${chunksHtml}</div>

    <div class="uc-answer">
      <div class="uc-answer-label">🤖 Gold Answer (Ground Truth)</div>
      <div class="uc-answer-text">${escapeHtml(q.goldAnswer)}</div>
    </div>
  `;
}

// =============================================
// FILE UPLOAD
// =============================================
function initFileUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('fileInput');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  input.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });
}

function handleFile(file) {
  if (!file.name.match(/\.(txt|md)$/i)) {
    alert('Chỉ hỗ trợ file .txt và .md');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    currentText = e.target.result;
    document.getElementById('textInput').value = currentText;
    document.getElementById('charCount').textContent = currentText.length;

    const info = document.getElementById('uploadedInfo');
    info.innerHTML = `✅ <strong>${file.name}</strong> — ${currentText.length} ký tự · ${file.size} bytes`;
    info.classList.remove('hidden');

    switchMode('type');
  };
  reader.readAsText(file, 'utf-8');
}

// =============================================
// PARTICLE CANVAS
// =============================================
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
    a: Math.random()
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${p.a * 0.6})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// =============================================
// STICKY NAV
// =============================================
function initNav() {
  const nav = document.getElementById('stickyNav');
  const hero = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      nav.classList.add('visible');
    } else {
      nav.classList.remove('visible');
    }

    // Active link highlighting
    const sections = ['playground', 'chunking', 'similarity', 'usecases', 'architecture', 'results'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 100) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}

// =============================================
// SLIDERS
// =============================================
function initSliders() {
  const chunkSize = document.getElementById('chunkSize');
  const overlap = document.getElementById('overlap');
  const csVal = document.getElementById('chunkSizeVal');
  const ovVal = document.getElementById('overlapVal');

  chunkSize.addEventListener('input', () => { csVal.textContent = chunkSize.value; });
  overlap.addEventListener('input', () => { ovVal.textContent = overlap.value; });
}

// =============================================
// TEXT INPUT COUNTER
// =============================================
function initTextCounter() {
  const ta = document.getElementById('textInput');
  const counter = document.getElementById('charCount');
  ta.addEventListener('input', () => {
    counter.textContent = ta.value.length;
    currentText = ta.value;
  });
}

// =============================================
// CLEAR BUTTON
// =============================================
function initClear() {
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('textInput').value = '';
    document.getElementById('charCount').textContent = '0';
    currentText = '';
    analysisState = null;
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('analysisResults').classList.add('hidden');
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.method-card, .backend-card, .learning-card, .result-big-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// =============================================
// UTILS
// =============================================
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNav();
  initSliders();
  initTextCounter();
  initClear();
  initFileUpload();
  initScrollReveal();
  renderUseCases();

  // Pre-load a sample
  loadSample('vector_store');
});
