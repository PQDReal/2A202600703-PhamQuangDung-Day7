# Báo Cáo Lab 7: Embedding & Vector Store

**Họ tên:** Phạm Quang Dũng
**Nhóm:** 024
**Ngày:** 05/06/2026

---

## 1. Warm-up (5 điểm)

### Cosine Similarity (Ex 1.1)

**High cosine similarity nghĩa là gì?**
> Hai text chunks có high cosine similarity khi vector embedding của chúng chỉ gần cùng một hướng trong không gian vector, tức là chúng biểu diễn ý nghĩa/ngữ cảnh tương tự nhau. Điểm càng gần 1 thì hai đoạn càng có khả năng nói về cùng chủ đề hoặc cùng intent.

**Ví dụ HIGH similarity:**
- Sentence A: "Python is a programming language used for data analysis."
- Sentence B: "Python is commonly used to analyze data and build software."
- Tại sao tương đồng: Cả hai đều nói về Python, lập trình, và ứng dụng trong phân tích dữ liệu/phần mềm.

**Ví dụ LOW similarity:**
- Sentence A: "Vector databases store embeddings for similarity search."
- Sentence B: "The weather forecast says it will rain tomorrow."
- Tại sao khác: Một câu nói về vector store/retrieval, câu còn lại nói về thời tiết; intent và domain không liên quan.

**Tại sao cosine similarity được ưu tiên hơn Euclidean distance cho text embeddings?**
> Cosine similarity tập trung vào hướng của vector, nên phù hợp để so sánh ý nghĩa hơn là độ lớn tuyệt đối của embedding. Với text embeddings, hai đoạn có độ dài hoặc magnitude khác nhau vẫn có thể gần nghĩa nếu vector của chúng cùng hướng.

### Chunking Math (Ex 1.2)

**Document 10,000 ký tự, chunk_size=500, overlap=50. Bao nhiêu chunks?**
> Công thức: `ceil((doc_length - overlap) / (chunk_size - overlap))`
> `ceil((10000 - 50) / (500 - 50)) = ceil(9950 / 450) = ceil(22.11) = 23`
> Đáp án: khoảng 23 chunks.

**Nếu overlap tăng lên 100, chunk count thay đổi thế nào? Tại sao muốn overlap nhiều hơn?**
> Khi overlap = 100: `ceil((10000 - 100) / (500 - 100)) = ceil(9900 / 400) = 25`, nên số chunk tăng từ 23 lên 25. Overlap nhiều hơn giúp giữ ngữ cảnh ở ranh giới giữa hai chunk, giảm nguy cơ một ý quan trọng bị cắt đôi, đổi lại chi phí lưu trữ và retrieval tăng nhẹ.

---

## 2. Document Selection — Nhóm (10 điểm)

### Domain & Lý Do Chọn

**Domain:** Tiểu sử và hoạt động lịch sử của Hồ Chí Minh.

**Tại sao nhóm chọn domain này?**
> Nhóm chọn domain này vì bộ tài liệu có cấu trúc rõ theo giai đoạn lịch sử: tổng quan, gia đình, tuổi trẻ, hoạt động ở nước ngoài, hoạt động cách mạng, giai đoạn độc lập và lãnh đạo sau 1945. Domain này phù hợp để đánh giá retrieval vì câu hỏi benchmark có gold answer cụ thể, có thể kiểm chứng trực tiếp từ tài liệu. Metadata như `topic`, `period`, `person` cũng giúp thử nghiệm filter và so sánh strategy chunking.

### Data Inventory

| # | Tên tài liệu | Nguồn | Số ký tự | Metadata đã gán |
|---|--------------|-------|----------|-----------------|
| 1 | 01_overview_and_roles | `HoChiMinh_Wiki.pdf` | 2296 | `topic=overview`, `period=1890-1969`, `language=vi` |
| 2 | 02_family_background | `HoChiMinh_Wiki.pdf` | 1463 | `topic=family_background`, `period=1890-1906`, `language=vi` |
| 3 | 03_youth_and_education | `HoChiMinh_Wiki.pdf` | 1991 | `topic=youth_and_education`, `period=1906-1911`, `language=vi` |
| 4 | 04_overseas_activities_1911_1923 | `HoChiMinh_Wiki.pdf` | 2493 | `topic=overseas_activities`, `period=1911-1923`, `language=vi` |
| 5 | 05_revolutionary_activities_1924_1941 | `HoChiMinh_Wiki.pdf` | 2585 | `topic=revolutionary_activities`, `period=1924-1941`, `language=vi` |
| 6 | 06_return_to_vietnam_and_independence_1941_1945 | `HoChiMinh_Wiki.pdf` | 2744 | `topic=return_vietnam_independence`, `period=1941-1945`, `language=vi` |
| 7 | 07_leadership_and_war_1945_1969 | `HoChiMinh_Wiki.pdf` | 3110 | `topic=leadership_and_war`, `period=1945-1969`, `language=vi` |

### Metadata Schema

| Trường metadata | Kiểu | Ví dụ giá trị | Tại sao hữu ích cho retrieval? |
|----------------|------|---------------|-------------------------------|
| `source` | string | `HoChiMinh_Wiki.pdf` | Giúp truy vết tài liệu gốc khi cần kiểm chứng câu trả lời. |
| `language` | string | `vi` | Cho biết ngôn ngữ tài liệu, hữu ích nếu sau này có tài liệu song ngữ. |
| `category` | string | `biography` | Nhóm tài liệu theo loại nội dung, ví dụ tiểu sử, chính trị, văn hóa. |
| `person` | string | `Ho Chi Minh` | Giúp giới hạn retrieval vào đúng nhân vật khi bộ dữ liệu mở rộng. |
| `topic` | string | `family_background`, `overview` | Trường quan trọng nhất để filter theo chủ đề câu hỏi. |
| `period` | string | `1941-1945` | Hữu ích với câu hỏi có mốc thời gian hoặc giai đoạn lịch sử. |
| `summary` | string | `Pác Bó, Việt Minh...` | Tóm tắt nhanh nội dung file, giúp embedding/search có thêm tín hiệu ngữ nghĩa. |

---

## 3. Chunking Strategy — Cá nhân chọn, nhóm so sánh (15 điểm)

### Baseline Analysis

Chạy `ChunkingStrategyComparator().compare()` trên 2-3 tài liệu:

| Tài liệu | Strategy | Chunk Count | Avg Length | Preserves Context? |
|-----------|----------|-------------|------------|-------------------|
| 01_overview_and_roles | FixedSizeChunker (`fixed_size`) | 5 | 459.2 | Trung bình: số chunk ít và đều, nhưng có nguy cơ cắt ngang câu hoặc đoạn đang nói về vai trò chính trị. |
| 01_overview_and_roles | SentenceChunker (`by_sentences`) | 6 | 381.0 | Tốt: giữ nguyên ranh giới câu, phù hợp câu hỏi về tên khai sinh, năm sinh, vai trò và đóng góp văn hóa. |
| 01_overview_and_roles | RecursiveChunker (`recursive`) | 7 | 326.3 | Tốt: bám cấu trúc markdown/đoạn, chunk nhỏ hơn và dễ retrieve từng ý riêng biệt. |

### Strategy Của Tôi

**Loại:** SentenceChunker

**Mô tả cách hoạt động:**
> Tôi chọn hướng sentence-based chunking: trước hết tách văn bản theo ranh giới câu như `.`, `!`, `?`, sau đó gom tối đa 3 câu vào một chunk. Cách này ưu tiên giữ câu nguyên vẹn, tránh việc một câu bị cắt ngang như fixed-size chunking. Với tài liệu dạng tiểu sử, FAQ ngắn, hoặc ghi chú giải thích theo từng ý, mỗi chunk thường dễ đọc và dễ kiểm tra bằng mắt hơn.

**Tại sao tôi chọn strategy này cho domain nhóm?**
> Tôi chọn SentenceChunker vì các tài liệu nhóm có nhiều câu mô tả sự kiện, nhân vật, mốc thời gian và vai trò lịch sử. Nếu chunk giữ nguyên câu, agent dễ lấy được một ý hoàn chỉnh như tên khai sinh, ngày sinh, quê quán hoặc đóng góp văn hóa. Điểm cần chú ý là nếu câu trả lời nằm rải ở nhiều đoạn khác nhau, sentence chunking có thể tạo nhiều chunk nhỏ và khiến thông tin bị tách ra.

**Code snippet (nếu custom):**
```python
# Không dùng custom chunker.
# Strategy cá nhân dùng class có sẵn:
SentenceChunker(max_sentences_per_chunk=3)
```

### So Sánh: Strategy của tôi vs Baseline

| Tài liệu | Strategy | Chunk Count | Avg Length | Retrieval Quality? |
|-----------|----------|-------------|------------|--------------------|
| 01_overview_and_roles | RecursiveChunker baseline | 7 | 326.3 | Bám cấu trúc markdown/đoạn tốt, chunk nhỏ và dễ retrieve từng ý. |
| 01_overview_and_roles | **SentenceChunker của tôi** | 6 | 381.0 | Giữ nguyên câu nên dễ đọc; phù hợp các câu hỏi cụ thể về tên, năm sinh, vai trò hoặc đóng góp văn hóa. |
| 5 benchmark queries | RecursiveChunker baseline | 48 chunks toàn bộ 7 docs | - | Đạt 6/10, tốt hơn SentenceChunker vì giữ nhiều ngữ cảnh theo đoạn. |
| 5 benchmark queries | **SentenceChunker của tôi** | 50 chunks toàn bộ 7 docs | - | Đạt 4/10; tốt ở câu 1 và 5 nhưng yếu khi answer cần thông tin từ nhiều đoạn. |

### So Sánh Với Thành Viên Khác

| Thành viên | Strategy | Retrieval Score (/10) | Điểm mạnh | Điểm yếu |
|-----------|----------|----------------------|-----------|----------|
| Tôi | SentenceChunker | 4/10 | Giữ nguyên ranh giới câu, chunk dễ đọc, phù hợp câu hỏi hỏi một sự kiện hoặc một thông tin cụ thể. | Có thể tách rời các ý liên quan nếu câu trả lời cần thông tin từ nhiều đoạn khác nhau |
| Trần Văn Hoàng | FixedSize | 8/10 | Đơn giản, dễ kiểm soát độ dài. | Có thể cắt đứt ý ở giữa câu. |
| Đặng Trần Đạt | RecursiveChunker + Filter | 9/10 | Precision cao nhờ filter | Cần query phải biết đúng topic |

**Strategy nào tốt nhất cho domain này? Tại sao?**
> Dựa trên bảng so sánh nhóm, strategy tốt nhất hiện tại là `RecursiveChunker + Filter` của Đặng Trần Đạt với 9/10. Lý do là domain lịch sử có metadata `topic` và `period` rất rõ, nên filter giúp giảm nhiễu trước khi similarity search. SentenceChunker của tôi dễ đọc và giữ câu tốt, nhưng khi câu trả lời cần gom nhiều thông tin như quê quán + cha mẹ hoặc vai trò năm 1945, các ý bị tách ra khiến retrieval khó xếp đúng chunk vào top-3.

---

## 4. My Approach — Cá nhân (10 điểm)

Giải thích cách tiếp cận của bạn khi implement các phần chính trong package `src`.

### Chunking Functions

**`SentenceChunker.chunk`** — approach:
> Tôi dùng regex `(?<=[.!?])(?:\s+|\n+)` để tách câu tại khoảng trắng hoặc xuống dòng sau `.`, `!`, `?`, sau đó strip whitespace và bỏ câu rỗng. Các câu được gom theo `max_sentences_per_chunk`, tối thiểu là 1 để tránh tham số không hợp lệ. Nếu input rỗng thì trả `[]`, còn text không tách được câu rõ ràng thì giữ thành một chunk đã strip.

**`RecursiveChunker.chunk` / `_split`** — approach:
> Base case là text đã ngắn hơn hoặc bằng `chunk_size`, khi đó trả về nguyên đoạn. Nếu đoạn quá dài, `_split` thử separator theo thứ tự ưu tiên; các mảnh nhỏ được ghép lại cho tới khi gần chạm `chunk_size`, còn mảnh vẫn quá lớn sẽ recurse với separator tiếp theo. Khi không còn separator hoặc separator là chuỗi rỗng, code fallback sang `FixedSizeChunker` để luôn trả được kết quả.

### EmbeddingStore

**`add_documents` + `search`** — approach:
> Tôi dùng in-memory list làm nguồn dữ liệu chính để lab chạy ổn với mock embedder và không phụ thuộc ChromaDB. Mỗi `Document` được chuẩn hóa thành record gồm `id`, `doc_id`, `content`, `metadata`, và `embedding`; `search` embed query rồi xếp hạng record bằng dot product. Vì mock embeddings đã normalize vector, dot product tương đương cosine-style ranking trong bài lab.

**`search_with_filter` + `delete_document`** — approach:
> `search_with_filter` lọc metadata trước rồi mới chạy similarity search trên tập candidate nhỏ hơn, giúp kết quả bám đúng scope như department/language/source. `delete_document` xóa tất cả record có `metadata["doc_id"]` hoặc field `doc_id` trùng document cần xóa, sau đó trả `True/False` dựa trên việc collection size có giảm không.

### KnowledgeBaseAgent

**`answer`** — approach:
> Agent thực hiện RAG theo 3 bước: retrieve top-k chunk từ store, ghép các chunk thành context có đánh số, rồi đưa context và question vào prompt. Prompt yêu cầu LLM chỉ trả lời dựa trên context và nói rõ khi context không đủ thông tin, nhằm giảm hallucination và giữ grounding.

### Test Results

```
42 tests collected
42 passed in 0.08s

SentenceChunker benchmark:
7 documents loaded
50 sentence chunks created
Retrieval score: 4/10
Top-3 relevant chunks: 2/5 queries
```

**Số tests pass:** 42 / 42

---

## 5. Similarity Predictions — Cá nhân (5 điểm)

| Pair | Sentence A | Sentence B | Dự đoán | Actual Score | Đúng? |
|------|-----------|-----------|---------|--------------|-------|
| 1 | Python is a programming language. | Python is used to write software. | high | 0.2520 | Đúng tương đối |
| 2 | Vector databases store embeddings. | Embeddings are saved in vector stores for similarity search. | high | 0.2750 | Đúng tương đối |
| 3 | Customer refunds require manager approval. | Refund requests need approval from a manager. | high | 0.1818 | Đúng tương đối |
| 4 | The weather is rainy today. | Neural networks learn from data. | low | 0.2697 | Sai một phần |
| 5 | Bananas are yellow fruits. | SQL joins combine database tables. | low | 0.0000 | Đúng |

**Kết quả nào bất ngờ nhất? Điều này nói gì về cách embeddings biểu diễn nghĩa?**
> Bất ngờ nhất là cặp thời tiết và neural networks vẫn có score 0.2697 dù khác nghĩa. Sau khi cải thiện `_mock_embed` thành hashed lexical embedding, các cặp có trùng từ/cụm từ thường tốt hơn bản hash ngẫu nhiên ban đầu, nhưng vẫn có nhiễu do collision và vì đây chưa phải semantic embedding thật. Khi đánh giá retrieval nghiêm túc, nên dùng local embedder như `all-MiniLM-L6-v2` hoặc OpenAI embedding thay vì mock backend.

---

## 6. Results — Cá nhân (10 điểm)

Chạy 5 benchmark queries của nhóm trên implementation cá nhân của bạn trong package `src`. **5 queries phải trùng với các thành viên cùng nhóm.**

### Benchmark Queries & Gold Answers (nhóm thống nhất)

| # | Query | Gold Answer |
|---|-------|-------------|
| 1 | Hồ Chí Minh tên khai sinh là gì và sinh năm nào? | Nguyễn Sinh Cung, sinh ngày 19/5/1890. |
| 2 | Quê quán và gia đình của Hồ Chí Minh có những thông tin chính nào? | Quê ở Kim Liên/Nam Đàn/Nghệ An; cha là Nguyễn Sinh Sắc, mẹ là Hoàng Thị Loan. |
| 3 | Vì sao Nguyễn Tất Thành rời Việt Nam năm 1911? | Ông muốn ra nước ngoài học hỏi tinh hoa, tiến bộ từ phương Tây và tìm con đường cứu nước. |
| 4 | Hồ Chí Minh có vai trò gì trong Cách mạng Tháng Tám và sự ra đời nước Việt Nam Dân chủ Cộng hòa? | Ông lãnh đạo Việt Minh, đứng đầu Chính phủ lâm thời và đọc Tuyên ngôn Độc lập ngày 2/9/1945. |
| 5 | Ngoài hoạt động chính trị, Hồ Chí Minh còn có đóng góp gì về văn hóa? | Ông còn là nhà văn, nhà thơ, nhà báo với nhiều tác phẩm bằng tiếng Việt, chữ Hán và tiếng Pháp. |

### Kết Quả Của Tôi

| # | Query | Top-1 Retrieved Chunk (tóm tắt) | Score | Relevant? | Agent Answer (tóm tắt) |
|---|-------|--------------------------------|-------|-----------|------------------------|
| 1 | Hồ Chí Minh tên khai sinh là gì và sinh năm nào? | `01_overview_and_roles`: chứa Nguyễn Sinh Cung và ngày 19/5/1890. | 0.3898 | Có | Trả đúng: Nguyễn Sinh Cung, sinh ngày 19/5/1890. |
| 2 | Quê quán và gia đình của Hồ Chí Minh có những thông tin chính nào? | `03_youth_and_education`: nói về rời Việt Nam năm 1911, không liên quan trực tiếp quê quán/gia đình. | 0.2888 | Không | Trả sai/ngữ cảnh lệch sang lý do ra đi năm 1911. |
| 3 | Vì sao Nguyễn Tất Thành rời Việt Nam năm 1911? | `02_family_background`: nói về gia đình và đổi tên thành Nguyễn Tất Thành, chưa nêu lý do ra đi. | 0.4111 | Không | Không tìm thấy đủ thông tin trong context. |
| 4 | Hồ Chí Minh có vai trò gì trong Cách mạng Tháng Tám và sự ra đời nước Việt Nam Dân chủ Cộng hòa? | `01_overview_and_roles`: nói chung về vai trò chính trị, chưa đủ ý Việt Minh/Chính phủ lâm thời/Tuyên ngôn Độc lập. | 0.4440 | Không | Không tìm thấy đủ thông tin trong context. |
| 5 | Ngoài hoạt động chính trị, Hồ Chí Minh còn có đóng góp gì về văn hóa? | `01_overview_and_roles`: chứa nhà văn, nhà thơ, nhà báo và tác phẩm bằng tiếng Việt, Hán, Pháp. | 0.4107 | Có | Trả đúng về đóng góp văn hóa. |

**Bao nhiêu queries trả về chunk relevant trong top-3?** 2 / 5

**Retrieval score cá nhân:** 4 / 10 theo rubric benchmark nhóm.

---

## 7. What I Learned (5 điểm — Demo)

**Điều hay nhất tôi học được từ thành viên khác trong nhóm:**
> Tôi học được rằng strategy đơn giản chưa chắc kém: FixedSize của Trần Văn Hoàng đạt 8/10 vì chunk đủ dài để giữ nhiều thông tin liên quan trong cùng một đoạn. Tôi cũng thấy rõ giá trị của metadata filtering qua strategy RecursiveChunker + Filter của Đặng Trần Đạt, đạt 9/10 nhờ giới hạn search theo `topic` trước khi xếp hạng similarity.

**Điều hay nhất tôi học được từ nhóm khác (qua demo):**
> Bài học quan trọng nhất là retrieval không chỉ phụ thuộc vào thuật toán search mà phụ thuộc rất nhiều vào cách chuẩn bị dữ liệu. Metadata tốt, chunk vừa đủ ngữ cảnh và benchmark query rõ ràng giúp phát hiện lỗi nhanh hơn. Khi một query fail, cần xem trực tiếp top-k chunks thay vì chỉ nhìn câu trả lời cuối của agent.

**Nếu làm lại, tôi sẽ thay đổi gì trong data strategy?**
> Tôi sẽ dùng metadata filter cho các câu hỏi có topic rõ, đặc biệt là câu về giai đoạn 1941-1945 hoặc Cách mạng Tháng Tám. Tôi cũng sẽ thử chunking theo heading markdown để giữ các đoạn cùng một mục ở gần nhau hơn. Nếu có thời gian, tôi sẽ dùng embedding thật thay vì `_mock_embed`, vì mock backend chỉ phù hợp kiểm thử pipeline chứ chưa hiểu ngữ nghĩa tiếng Việt thật tốt.

---

## Tự Đánh Giá

| Tiêu chí | Loại | Điểm tự đánh giá |
|----------|------|-------------------|
| Warm-up | Cá nhân | 5 / 5 |
| Document selection | Nhóm | 10 / 10 |
| Chunking strategy | Nhóm | 13 / 15 |
| My approach | Cá nhân | 7 / 10 |
| Similarity predictions | Cá nhân | 3 / 5 |
| Results | Cá nhân | 4 / 10 |
| Core implementation (tests) | Cá nhân | 30 / 30 |
| Demo | Nhóm | 5 / 5 |
| **Tổng** | | **77 / 100** |
