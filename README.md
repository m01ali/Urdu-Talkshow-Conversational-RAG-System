# Urdu Talkshow — Conversational RAG System

Chat with Pakistani Urdu talk shows after they've aired. This project takes talk-show audio,
transcribes and diarizes it in Urdu, and serves it through a conversational Retrieval-Augmented
Generation (RAG) pipeline — so you can ask questions about an episode and get grounded, in-language
answers instead of re-watching the whole thing.

The system is a full production-style stack: a Django REST API orchestrating a LangChain RAG chain
over a Chroma vector store, backed by Groq-hosted LLMs, with a React/Vite chat frontend on top.

## Highlights

- **Urdu-native conversational RAG** — both the query-rewriting step and the answer-generation step
  are explicitly prompted to operate entirely in Urdu, keeping the whole retrieval-and-answer loop
  in one language rather than bouncing through English.
- **Speech-to-text pipeline for Urdu talk shows** — audio pulled straight from YouTube
  (`pipelines/YouTube.py`) is transcribed and speaker-diarized with WhisperX + pyannote
  (`pipelines/transcription.py`), then automatically proofread by a Groq-hosted Llama 3.3 70B model
  for spelling/grammar cleanup — producing three progressively refined transcripts (raw, LLM-corrected,
  and speaker-name-mapped) for full auditability.
- **Multi-tenant chatbots** — every chatbot gets its own isolated Chroma collection, its own set of
  source documents, and is scoped to the user who created it, with ownership checks enforced on every
  mutating API call.
- **History-aware retrieval** — multi-turn conversations are handled with LangChain's
  `create_history_aware_retriever`, so follow-up questions are reformulated against the chat history
  before hitting the vector store, rather than being retrieved in isolation.
- **Document management built in** — chatbots support uploading, listing, and deleting PDF source
  documents, each independently chunked, embedded, and indexed via `RecursiveCharacterTextSplitter`
  and `OpenAIEmbeddings` into per-chatbot Chroma collections.
- **Modern, decoupled frontend** — a React 18 + Vite SPA (Tailwind, shadcn/radix UI) talks to the
  Django API over a CORS-enabled, token/session-authenticated REST interface.
- **Full auth stack** — signup/login/logout, DRF token authentication, Django session authentication,
  and CSRF-protected requests out of the box.

## Architecture

```
                              ┌────────────────────────────────────────┐
                              │            Offline Pipeline             │
                              │                                        │
   YouTube video  ──────────▶ │  YouTube.py → Downloaded-audios/*.mp4  │
                              │           │                            │
                              │           ▼                            │
                              │  transcription.py                      │
                              │   • WhisperX (large) — transcription   │
                              │   • pyannote — speaker diarization     │
                              │   • Groq Llama 3.3 70B — proofreading  │
                              │           │                            │
                              │           ▼                            │
                              │  transcripts/*.txt (raw / corrected /  │
                              │              speaker-mapped)           │
                              └────────────────────────────────────────┘

                              ┌────────────────────────────────────────┐
                              │              Web Application            │
                              │                                        │
  React (Vite) SPA  ───HTTP──▶│  Django REST API  (main/views/*)       │
   • auth pages                │   • authentication_views              │
   • chatbot browse/create     │   • chatbot_views                     │
   • document upload           │   • document_views                    │
   • chat UI                   │   • chat_views                        │
                              │           │                            │
                              │           ▼                            │
                              │  SaveEmbeddingsPipeline                │
                              │   (pipelines/SimpleRag.py)             │
                              │           │                            │
                              │  ┌────────┴─────────┐                  │
                              │  ▼                   ▼                 │
                              │ Chroma vector store   Groq LLM         │
                              │ (per-chatbot          (llama3-70b-8192)│
                              │  collection)                           │
                              │                                        │
                              │  RAG chain: history-aware retriever    │
                              │  → stuff-documents chain → Urdu answer │
                              └────────────────────────────────────────┘
```

**Data model:** each `Chatbots` row (owned by a Django `User`) maps 1:1 to a Chroma collection named
after the chatbot. Each `Documents` row (a PDF) belongs to a chatbot, has its extracted text stored in
SQLite, and is chunked + embedded into that chatbot's collection. Chat sessions are keyed by
`session_id + chatbot_name` and hold their own conversational memory for the LangChain history-aware
retrieval chain.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django 3.2 + Django REST Framework |
| RAG orchestration | LangChain (`langchain`, `langchain-community`, `langchain-groq`, `langchain-openai`) |
| Chat LLM | Groq — `llama3-70b-8192` |
| Transcript cleanup LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | OpenAI `OpenAIEmbeddings` |
| Vector database | ChromaDB (standalone HTTP server) |
| Speech-to-text & diarization | WhisperX + pyannote.audio |
| PDF parsing | pypdfium2 |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/radix UI |
| Auth | DRF Token Authentication + Django Session Authentication |
| Relational database | SQLite |

## Project Structure

```
TalkShow/            Django project settings, URLs, WSGI/ASGI entrypoints
main/                 Django app: models, serializers, views, auth backend
  views/              authentication_views, chatbot_views, chat_views, document_views
pipelines/            YouTube ingestion, WhisperX transcription, RAG pipeline (SimpleRag.py)
utils/                Chroma connection helper, PDF text extraction, model/embedding config
frontend/             React + Vite single-page application
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- [ffmpeg](https://ffmpeg.org/) (required by the audio/transcription pipeline)
- A running ChromaDB server
- API keys: `GROQ_API_KEY`, `OPENAI_API_KEY`, `HUGGING_FACE_KEY` (the last one for pyannote diarization
  models)

### 1. Clone and set up a virtual environment

```bash
git clone https://github.com/m01ali/Urdu-Talkshow-Conversational-RAG-System.git
cd Urdu-Talkshow-Conversational-RAG-System

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
HUGGING_FACE_KEY=your-huggingface-token
```

### 4. Start ChromaDB

```bash
chroma run --path "<path-to-chroma-data-dir>" --port 8001
```

### 5. Run database migrations and start the Django server

```bash
python manage.py migrate
python manage.py runserver
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, talking to the Django API at
`http://127.0.0.1:8000`.

### Optional: run the offline transcription pipeline

To turn a YouTube talk show into a searchable transcript:

```bash
python pipelines/YouTube.py          # downloads audio into Downloaded-audios/
python pipelines/transcription.py    # transcribes, diarizes, and proofreads it into transcripts/
```
