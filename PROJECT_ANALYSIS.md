# Urdu-Talkshow — Project Analysis Report

Generated: 2026-07-14

## 1. Project Overview

Urdu-Talkshow is a full-stack application that lets users "chat" with Pakistani Urdu talk-show episodes after they've aired. The pipeline is:

1. **Ingest** — download a talk-show's audio from YouTube (`pipelines/YouTube.py`).
2. **Transcribe & diarize** — run WhisperX (large model) to transcribe Urdu speech, align timestamps, and diarize speakers, then pass the raw transcript through a Groq-hosted Llama-3.3-70B model to fix spelling/grammar (`pipelines/transcription.py`).
3. **Index** — chunk the resulting text (or uploaded PDFs) and embed it into a Chroma vector store (`pipelines/SimpleRag.py`).
4. **Serve** — a Django REST API (`main/`) exposes chatbot CRUD, document upload, and a chat endpoint that runs a LangChain conversational RAG chain against Chroma + Groq's `llama3-70b-8192`.
5. **UI** — a React (Vite) frontend (`frontend/`) provides signup/login, chatbot creation/browsing, document upload, and a chat interface.


### Tech stack
| Layer | Technology |
|---|---|
| Backend framework | Django 3.2 + Django REST Framework |
| RAG orchestration | LangChain 0.3.x, `langchain-community`, `langchain-groq`, `langchain-openai` |
| LLM (chat) | Groq-hosted `llama3-70b-8192` |
| LLM (transcript cleanup) | Groq-hosted `llama-3.3-70b-versatile` |
| Embeddings | OpenAI `OpenAIEmbeddings` (default model, i.e. `text-embedding-ada-002`) |
| Vector DB | ChromaDB, run as a standalone HTTP server (`chroma run --port 8001`) |
| Speech-to-text | WhisperX (`large` model) + pyannote diarization pipeline |
| PDF parsing | `pypdfium2` |
| Frontend | React 18 + Vite, Tailwind, shadcn/radix UI components |
| Auth | Django session auth + DRF Token auth (custom `UserProfileBackend`) |
| Relational DB | SQLite (`db.sqlite3`) |

---

## 2. Architecture

```
YouTube.py ──▶ Downloaded-audios/*.mp4
                     │
                     ▼
transcription.py (WhisperX + pyannote diarization + Groq cleanup)
                     │
                     ▼
         transcripts/*.txt  (not yet wired into the RAG pipeline — see §4.3)

Frontend (React) ──HTTP──▶ Django REST API (main/views/*)
                                   │
                     ┌─────────────┼──────────────────┐
                     ▼             ▼                   ▼
             auth views     chatbot/document views    chat view
                                   │                    │
                                   ▼                    ▼
                        SaveEmbeddingsPipeline (pipelines/SimpleRag.py)
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                            ▼
              Chroma HTTP client            Groq LLM (llama3-70b-8192)
           (localhost:8001, per-chatbot
              collection = chatbot name)
```

Each `Chatbots` row owns a Chroma **collection** named after the chatbot; each uploaded `Documents` row is a PDF whose extracted text is both stored in SQLite (`page_content`) and chunked/embedded into that collection. Chat history is kept in an **in-process Python dict** (`settings.SIMPLE_STORE`), keyed by `f"{session_id}_{chatbot_name}"`.

---

## 3. RAG Pipeline — Deep Dive (`pipelines/SimpleRag.py`)

This is the heart of the project, so it gets the most scrutiny.

### 3.1 Ingestion & Chunking (`chuking`, `save_embeddings`)
- Input is a PDF (Django `UploadedFile`) opened directly with `pypdfium2`; there is **no path for indexing the WhisperX transcripts** even though the README's stated purpose is "chat with a talk show" (see §4.3 — this is the single biggest gap between the stated goal and the implemented pipeline).
- Splitting uses `RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100, separators=["\n\n","\n"," ",""])`.
  - `length_function=len` counts **Python string characters**, not tokens. For Urdu (and generally non-Latin scripts) this is a reasonable proxy but doesn't map cleanly to LLM token budgets — Urdu/Arabic-script text tends to tokenize less efficiently in most tokenizers than English, so an 800-char chunk can be a disproportionately large number of tokens.
  - The separators (`\n\n`, `\n`, space, "") are Latin-typography defaults. Urdu is written right-to-left and PDF text extraction from RTL documents frequently interleaves punctuation/ordering artifacts; there's no normalization step (no Unicode NFC normalization, no removal of extracted-PDF artifacts like stray control characters or reversed number runs) before chunking.
  - Metadata per chunk is just `{"page": n, "documentname": name}` — no chatbot/collection id embedded in metadata (fine since collection = chatbot, but means cross-collection queries aren't possible even if desired later), and no chunk-level id/hash, which makes idempotent re-indexing or dedup impossible.
- `document.name` is used directly as metadata and as the SQL `documentname` — the same PDF re-uploaded under a different chatbot, or a filename collision, is only guarded by a DB `unique_together` constraint, not something content-addressed.

### 3.2 Embeddings (`get_vector_store`)
- Actively used: `OpenAIEmbeddings()` (LangChain default → `text-embedding-ada-002`), instantiated **fresh on every call**, reading `OPENAI_API_KEY` from the environment implicitly.
- Dead/commented-out code: an `AzureOpenAIEmbeddings` block referencing `config_embeddings["text-embedding-3-large"]`, and unused imports for `SentenceTransformerEmbeddings` — signs of an abandoned migration between embedding providers.
- **Inconsistency**: the LLM (`ChatGroq`) is Llama-3-based and free/cheap via Groq, but embeddings still depend on a paid OpenAI key. If `OPENAI_API_KEY` isn't set, `adddocument` will fail with an opaque error (caught generically and reported as "Error in saving embeddings").
- No embedding-model versioning/metadata is stored alongside vectors. If the embedding model is ever swapped, old and new vectors would silently coexist in the same Chroma collection with incompatible vector spaces — there's no re-index/migration mechanism.
- `utils/config.py`'s `config_embeddings` dict lists a `Sentence-Transformer` (`BAAI/bge-base-en-v1.5`) option — notably an **English** sentence embedding model, which would be a poor fit for Urdu semantic search if it were ever wired in. There is no Urdu-specific or multilingual embedding model (e.g. `text-embedding-3-large`, `LaBSE`, `intfloat/multilingual-e5`) configured anywhere, despite the entire corpus being Urdu conversational text. This is a real quality risk for retrieval accuracy on Urdu queries.

### 3.3 Retrieval (`get_retriever`)
- `vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 5})` — plain top-k cosine/L2 similarity, no MMR (diversity), no score threshold, no reranking, no hybrid (BM25 + vector) search. For talk-show transcripts where many chunks may be topically similar (repeated phrases, filler, cross-talk), pure similarity top-5 risks retrieving redundant or near-duplicate chunks instead of diverse coverage.
- `k=5` is hardcoded — not configurable per chatbot/document size, and not exposed as a tuning knob.
- No metadata filtering is applied at query time (e.g., to a specific document within a chatbot's multi-document collection) — a user chatting with a chatbot that has 5 PDFs always searches all of them together.

### 3.4 Conversational RAG Chain (`generate_history_chat_response`)
- Correctly uses LangChain's `create_history_aware_retriever` + `create_stuff_documents_chain` + `create_retrieval_chain` pattern — this is the standard/idiomatic LangChain approach (v0.2+), not a hand-rolled one, which is good.
- **Query rewriting prompt** explicitly instructs the LLM to reformulate the standalone question "in URDU," and the **answer prompt** instructs the LLM to answer only in Urdu, grounded in "a conversation between two people in Urdu." This is a nice, deliberate design choice for the domain (keeps the whole chain in one language rather than the more common English rewrite / Urdu retrieval mismatch).
- **"Stuff" documents chain** (`create_stuff_documents_chain`) concatenates all 5 retrieved chunks directly into the prompt with no token-budget guard. There's no check against Groq's model context window or the 800-char × 5 chunk worst case combined with growing chat history — for a long conversation this chain has no summarization/truncation strategy and will eventually hit context-length errors with no graceful handling (the calling view just catches `Exception` broadly and returns a generic "Something Went Wrong").
- **Session/history store**: `RunnableWithMessageHistory` is backed by `settings.SIMPLE_STORE`, a plain Python dict living in Django settings, keyed by `session_id_chatbotname`.
  - This is **process-local, in-memory, and unbounded** — it will leak memory over the life of the server process (no eviction/TTL), won't work across multiple worker processes/machines (each Gunicorn/uWSGI worker would have its own divergent history), and is wiped on every restart. For anything beyond a single-process dev server this is a correctness bug, not just a scaling concern.
  - Session key relies on `request.session.session_key`, created lazily in the `chat` view. The `chat` endpoint is `@permission_classes([AllowAny])`, i.e. **anonymous users get a full RAG chat session** — reasonable for a public demo but means chat history/session data has no user association at all (no link between `SIMPLE_STORE` entries and `Chatbots.user`), so there's no way to audit or rate-limit per user.
- No streaming — `conversational_rag_chain.invoke(...)` blocks until the full answer is generated; the frontend (`Chat.jsx`) does a single `fetch` + `await response.json()` with a `loading` boolean, so users see nothing until the entire Groq completion finishes. For a 70B model this can be a multi-second wait with no perceived progress (LangChain/Groq both support streaming, so this is a straightforward improvement, not a rearchitecture).

### 3.5 Deletion / lifecycle
- `delete_embeddings` deletes by `where={"documentname": documentname}` metadata filter directly on the Chroma collection — reasonable, but not transactional with the SQLite delete in the view (`document_views.py`): if `pipeline.delete_embeddings` succeeds but the subsequent `document.delete()` throws, embeddings are gone but the SQL row remains (or vice versa depending on exception timing), leaving the two stores inconsistent. Same risk pattern exists in `deletechatbot` (Chroma collection drop + SQL cascade delete aren't atomic).
- `delete_collection`/`get_vector_store` reset the shared `Connection` client on *any* exception (`Connection.reset_connection()`), including transient/unrelated errors — a broad recovery strategy that could mask real bugs but is defensible as a "self-healing" pattern for a flaky local Chroma HTTP connection.

### 3.6 Connection management (`utils/connection.py`, `main/globals.py`)
- `Connection` is a classmethod-based singleton wrapping a `chromadb.HttpClient` pointed at `localhost:8001` — hardcoded host/port, not environment-configurable. Any deployment off `localhost` requires a code change.
- The singleton is stored in `main/globals.py` as a **module-level global**, which under Django's multi-process WSGI workers means each worker process gets its own Chroma client instance (fine, since Chroma is itself a separate server) but the pattern doesn't leverage Django's `AppConfig.ready()` or any connection pool — minor style point, functionally acceptable given Chroma is accessed over HTTP anyway.

### 3.7 Summary of RAG-specific risks (ranked)

| # | Issue | Severity | Why it matters |
|---|---|---|---|
| 1 | Transcribed talk-show text is never fed into the RAG pipeline — only manually uploaded PDFs are indexed | High | The core product pitch ("chat with a talk show") isn't actually wired end-to-end; `transcription.py` output (`transcripts/*.txt`) has no ingestion path into `SaveEmbeddingsPipeline` |
| 2 | English-oriented embedding model for Urdu content, no multilingual/Urdu-tuned embedding option in active use | High | Directly impacts retrieval quality — semantic search on Urdu queries against `ada-002` embeddings is a known weak spot |
| 3 | In-memory, per-process, unbounded chat history store | High | Breaks under multi-worker deployment, memory leak, lost history across restarts |
| 4 | No token-budget-aware truncation in the "stuff" chain | Medium | Long conversations / large k will eventually overflow the model context with no graceful degradation |
| 5 | Plain top-k similarity retrieval, no MMR/reranking/hybrid search, no per-document filtering | Medium | Redundant chunk retrieval likely on repetitive talk-show transcripts; users can't scope a query to one of several uploaded documents |
| 6 | Chunking is character-based with Latin-default separators, no Urdu-specific normalization | Medium | Chunk boundaries may split Urdu sentences/words awkwardly; no ligature/diacritic normalization before embedding |
| 7 | Non-transactional writes across SQLite + Chroma on delete paths | Medium | Can leave orphaned vectors or orphaned DB rows on partial failure |
| 8 | Fresh embeddings/LLM client instantiated per request, no caching/pooling, no streaming | Low–Medium | Latency/cost overhead; blocking UX during generation |
| 9 | Hardcoded `localhost:8001` Chroma endpoint | Low | Blocks non-local deployment without code edits |

---

## 4. Backend (Django) Analysis

### 4.1 Models (`main/models.py`)
Simple two-table schema: `Chatbots` (owned by a `User`) and `Documents` (FK to `Chatbots`, stores extracted `page_content` in full in SQLite in addition to the vector store — i.e., the raw text is duplicated between SQLite and Chroma's own document store, which Chroma already persists internally). Storing `page_content` in SQL seems to exist only to render it in `DocumentSerializer`/`DocCard.jsx` in the frontend, not for any RAG purpose.

### 4.2 Views
- Cleanly split into `authentication_views.py`, `chatbot_views.py`, `chat_views.py`, `document_views.py`, aggregated via `main/views/__init__.py` wildcard imports. `main/views.py` is an empty stub file left over from before the split — harmless but worth deleting.
- Consistent DRF `@api_view`/`@permission_classes` usage; ownership checks (`chatbot.user != request.user`) are present on mutating endpoints — good, prevents one user from deleting/modifying another's chatbot or documents.
- Broad `except Exception` blocks throughout swallow the real error and return generic 500s (e.g. `document_views.py:140` bare `except:`), which will make production debugging hard and occasionally mask the specific field (`e.args[0]` will `IndexError` if an exception has no args — e.g. some DRF/Django exceptions raise with no positional args, which would itself throw and produce an unhandled 500).
- **Dead code / drift**: `ChatAdvanced.jsx` in the frontend calls `POST /{chatbotname}/advance_chat/`, but no such URL exists in `main/urls.py` (only `.../chat/` is registered) and there's no `advance_chat` view anywhere in `main/views/`. This page is currently broken if navigated to. `TalkShow/settings.py` also defines an unused `ADVANCE_STORE = {}` dict that mirrors `SIMPLE_STORE`, suggesting an "advanced" RAG mode (perhaps multi-step/agentic) was planned but never implemented.
- `main/tests.py` is the default Django stub — **no tests exist anywhere in the repo** (backend or frontend).

### 4.3 Ingestion gap (transcription ↔ RAG)
`pipelines/transcription.py` writes cleaned transcripts to `transcripts/{name}_generated_transcription.txt`, but nothing in `main/views` or `pipelines/SimpleRag.py` reads from that folder or that file format. The only ingestion entrypoint is `adddocument` (PDF upload via `main/views/document_views.py`), which calls `chuking()` — a method that hardcodes `pdfium.PdfDocument(document)`, i.e. it **cannot accept a `.txt` transcript at all** without a code change. This is the most consequential finding in the report: the transcription pipeline and the RAG/chat pipeline are two disconnected halves of the product.

### 4.4 Security / configuration concerns
- `SECRET_KEY` is a hardcoded, committed value (`TalkShow/settings.py:23`) — must be moved to an environment variable before any real deployment.
- `DEBUG = True` and `ALLOWED_HOSTS = ["*"]` committed — fine for local dev, dangerous if deployed as-is (verbose tracebacks exposed to any host).
- `CORS_ORIGIN_ALLOW_ALL = True` **and** `CORS_ALLOW_ALL_ORIGINS = True` **and** `CORS_ALLOW_CREDENTIALS = True` together — allowing all origins while also allowing credentials is a classic CORS misconfiguration; combined with `SESSION_COOKIE_SAMESITE = "None"`, this is a CSRF/session-hijack-friendly configuration if ever exposed beyond localhost.
- `SESSION_COOKIE_SECURE = True` is set with a misleading inline comment (`# Session cookies are not restricted to HTTPS`) that says the opposite of what the setting does — will actively break session cookies over plain HTTP in local dev (comment/code mismatch, worth fixing either the code or the comment).
- API keys (`GROQ_API_KEY`, `HUGGING_FACE_KEY`, `OPENAI_API_KEY`) are read via `os.environ`/`dotenv` — good practice — but there's no `.env.example`/documented list of required env vars anywhere in the repo, so a new developer has to grep the source to discover what's needed.
- `db.sqlite3` and `chroma.sqlite3`/`chroma.log` are present as tracked-looking files in the working tree root (though `.gitignore` does exclude `*.sqlite3` and `*.log` — worth double-checking with `git status`/`git ls-files` that they were never committed historically, since `.gitignore` only prevents *future* accidental commits).

### 4.5 Dependencies
`requirements.txt` is a full `pip freeze`-style lock (228 packages) mixing heavy, somewhat unrelated stacks: WhisperX/pyannote/torch/lightning (transcription), LangChain + three LLM/embedding providers (OpenAI, Groq, Google Generative AI — though Google/Gemini isn't used anywhere in the code I found), Gradio (not used anywhere in the app code), Pinecone (not used — Chroma is the actual vector store), MySQL client (`mysqlclient`, unused — SQLite is configured). This suggests the requirements file was never pruned after experimentation; it inflates install time/footprint substantially and obscures the actual runtime dependency set. A `pyproject.toml`/split `requirements-transcription.txt` vs `requirements-web.txt` would clarify what's actually needed to run the Django app vs. the offline transcription pipeline.

---

## 5. Frontend Analysis

- Standard Vite + React setup, Tailwind + shadcn/radix components (`components/ui/*`), React Router pages (`Home`, `Login`, `Signup`, `Admin`, `BrowseAll`, `Chatbot`, `Chat`, `ChatAdvanced`, `Test`, `NotFound`).
- `API_BASE_URL` is a hardcoded `http://127.0.0.1:8000` constant (`frontend/src/config.js`) — no `.env`/`import.meta.env` usage, so pointing the frontend at any other backend requires editing source.
- CSRF handling exists via `CsrfTokenContext.jsx`, consistent with Django's CSRF cookie flow.
- `Chat.jsx` (basic chat) is wired to a real backend route (`/chat/`); `ChatAdvanced.jsx` is wired to a **non-existent** route (`/advance_chat/`, see §4.2) — this page will always fail when used.
- No visible loading skeleton/streaming token rendering — chat UX is "spinner until whole answer arrives," consistent with the backend's non-streaming `invoke()` call noted in §3.4.
- `PdfInput.jsx`/`AudioInput.jsx` exist under `components/pdfinput/` — `AudioInput.jsx` suggests an intent to let users upload audio directly from the UI (which would need to trigger `transcription.py` server-side), but there is no backend endpoint for audio upload/transcription in `main/urls.py` — another symptom of the ingestion gap in §4.3.

---

## 6. Offline Pipelines (`pipelines/`)

- **`YouTube.py`**: standalone script (not invoked by Django), hardcodes a specific YouTube URL as the module-level `url` variable and prompts interactively (`input(...)`) for an output filename — this can only be run manually from a terminal, not imported/called as a function from the web app. Uses `pytubefix` with OAuth to dodge YouTube bot detection.
- **`transcription.py`**: solid, well-structured for an offline batch script — clear class separation (`AudioTranscription`, `GroqAPI`, `SpeakerNameMapper`, `process_audio`), writes three progressively-refined transcript files (raw WhisperX, Groq-corrected, speaker-name-mapped) which is a genuinely nice auditability feature (you can diff what the LLM "corrected"). `SpeakerNameMapper` relies on literal substring matches for `"speaker1"/"speaker2"/"speaker3"` in the transcribed text itself, which is a fragile heuristic (depends on speakers literally saying those exact placeholder tokens) — likely a debugging/dev stand-in rather than a finished feature.
- `__main__` block hardcodes a path (`/content/Downloaded-audios/sama-talkshow.mp4`, a Google-Colab-style path), confirming this script was developed/run in Colab rather than the Django app's own environment — again reinforcing that transcription is currently a disconnected, manually-run offline step.

---

## 7. Cross-Cutting Observations

- **No automated tests** anywhere (backend or frontend) — no `pytest`/DRF `APITestCase` usage despite `main/tests.py` existing as a stub, no frontend test runner configured in `package.json`.
- **No CI configuration** (no `.github/workflows`, etc.).
- **`improvements-to-consider.txt`** (author's own notes) already flags: replacing the Llama decoder, adding an Urdu-specific embedding encoder instead of OpenAI, improving speaker assignment, and evaluating Meta's SeamlessM4T model — i.e., the author is independently aware of the same embedding-language mismatch (§3.2 finding #2) and the ingestion/ownership gaps noted above. This report's §3.2 and §4.3 findings corroborate and add detail to those self-identified TODOs.
- **`.gitmodules`** tracks `whisperX` as a submodule pointing at the upstream `m-bain/whisperX` repo, but `requirements.txt` also pins `whisperx @ file:///D:/talkshow/whisperX` — a hardcoded **Windows absolute path**, meaning `pip install -r requirements.txt` will fail verbatim on any other machine/OS until that line is replaced with a relative path or PyPI/git reference.

---

## 8. Recommendations (Priority Order)

1. **Close the ingestion loop**: add a code path (new view + `SimpleRag` method) that ingests `transcripts/*.txt` (or transcribes on upload) into the same `save_embeddings`/chunking flow used for PDFs, so the app can actually do what the README promises.
2. **Swap to a multilingual/Urdu-aware embedding model** (e.g. OpenAI `text-embedding-3-large`, or an open multilingual model like `intfloat/multilingual-e5-large`) and remove the dead Azure/SentenceTransformer scaffolding in `SimpleRag.get_vector_store` once a decision is made.
3. **Replace `settings.SIMPLE_STORE`** with a persistent, shared store (Redis, or a `ChatMessages` DB table) so history survives restarts and works across multiple worker processes.
4. **Add token-budget-aware context assembly** (or switch from "stuff" to a compression/rerank retriever) to avoid context-overflow failures as conversations grow.
5. **Wire up or remove `ChatAdvanced.jsx`** and its dead `/advance_chat/` reference; delete the empty `main/views.py` stub.
6. **Externalize configuration**: move `SECRET_KEY`, Chroma host/port, and `API_BASE_URL` to environment variables; add a `.env.example`.
7. **Prune `requirements.txt`** and split web-app deps from transcription/ML deps; fix the hardcoded Windows `whisperx` path.
8. **Add tests**, at minimum DRF `APITestCase` coverage for the chat/document endpoints and a smoke test for the RAG chain with a fixture Chroma collection.

---

*This report was generated by static analysis of the repository contents; no external services (Chroma, Groq, OpenAI) were called, and the app was not run.*
