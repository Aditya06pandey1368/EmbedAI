# EmbedAI — PDF AI Chatbot SaaS

> Turn your documents into a 24/7 AI support agent in minutes.

[![Live Demo](https://img.shields.io/badge/Live-Demo-cyan?style=for-the-badge)](https://embed-ai-nu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com)

---

## 🚀 What is EmbedAI?

EmbedAI is a production-ready B2B SaaS platform that allows businesses to:

1. **Upload** their PDF documents
2. **Train** an AI chatbot on their content
3. **Embed** the chatbot on their website via a single `<script>` tag

```html
<!-- All it takes to embed on any website -->
<script
  src="https://embed-ai-nu.vercel.app/widget.js"
  data-bot-id="YOUR_BOT_ID">
</script>
```

---

## ✨ Features

### For Businesses (Users)
- 📄 Upload PDF documents (up to 10MB)
- 🤖 Create and customize AI chatbots
- 🎨 Brand color customization
- 📊 Analytics dashboard with usage charts
- 💬 Full chat history viewer
- 🔗 One-line embed code generation
- ⚙️ Bot management (create, edit, delete)

### For Website Visitors
- 💬 Real-time AI chat widget
- ⚡ Streaming word-by-word responses
- 📱 Fully responsive design
- 🎨 Branded with company colors

### For Platform Admin
- 👥 View all users and manage plans
- 🤖 Monitor all bots across platform
- 📄 View all documents
- 📊 Platform-wide analytics
- 🛡️ Separate admin panel

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + ShadCN UI |
| **Animations** | Framer Motion |
| **Auth** | Clerk |
| **Database** | Supabase (PostgreSQL) |
| **Vector DB** | pgvector with HNSW indexing |
| **Embeddings** | HuggingFace (all-MiniLM-L6-v2) |
| **LLM** | Groq (llama-3.1-8b-instant) |
| **PDF Processing** | unpdf |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              EmbedAI Platform               │
├─────────────┬───────────────┬───────────────┤
│  Marketing  │   Dashboard   │  Admin Panel  │
│   Website   │  (Business)   │ (Super Admin) │
└─────────────┴───────────────┴───────────────┘
                      │
              ┌───────┴───────┐
              │   Next.js API  │
              │    Routes      │
              └───────┬───────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐  ┌─────▼────┐ ┌───▼────┐
    │Supabase│  │HuggingFace│ │  Groq  │
    │Postgres│  │Embeddings │ │  LLM   │
    │pgvector│  └──────────┘ └────────┘
    └────────┘
```

### RAG Pipeline

```
PDF Upload
    ↓
Text Extraction (unpdf)
    ↓
Chunk Splitting (500 chars, 50 overlap)
    ↓
Embedding Generation (HuggingFace, 384-dim)
    ↓
Vector Storage (Supabase pgvector + HNSW)
    ↓
Similarity Search on User Question
    ↓
Context + Groq LLM → Answer
```

---

## 📁 Project Structure

```
embedai/
├── app/
│   ├── (marketing)/          # Public landing pages
│   ├── (dashboard)/          # Business user dashboard
│   ├── (admin)/              # Super admin panel
│   └── api/                  # API routes
├── components/
│   ├── marketing/            # Landing page components
│   ├── dashboard/            # Dashboard components
│   ├── admin/                # Admin panel components
│   ├── widget/               # Chat widget component
│   └── shared/               # Shared components
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── gemini.ts             # AI services (Groq + HuggingFace)
├── services/
│   ├── document-processor.ts # PDF processing pipeline
│   ├── embeddings.ts         # Embedding generation
│   └── rag.ts                # RAG pipeline
└── middleware.ts              # Clerk auth protection
```

---

## 🗄️ Database Schema

```sql
users            -- Synced from Clerk via webhooks
bots             -- AI chatbots created by users
documents        -- Uploaded PDF files
document_chunks  -- Text chunks with vector embeddings (384-dim)
chat_sessions    -- Conversation sessions
chat_messages    -- Individual messages
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free)
- Clerk account (free)
- Groq API key (free)
- HuggingFace API key (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/embedai.git
cd embedai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
GROQ_API_KEY=
HUGGINGFACE_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run these in your Supabase SQL Editor:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables (see /database/schema.sql)

-- Enable HNSW index for fast similarity search
CREATE INDEX idx_chunks_embedding ON document_chunks
USING hnsw (embedding vector_cosine_ops);
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 User Roles

| Role | Access |
|---|---|
| **Website Visitor** | Chat with embedded widget, no account needed |
| **Business User** | Dashboard, create bots, upload docs, analytics |
| **Super Admin** | Full platform access, user management, all bots |



## 📡 API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/bots` | List / Create bots |
| `PATCH/DELETE` | `/api/bots?botId=` | Update / Delete bot |
| `GET` | `/api/bots/public?botId=` | Public bot config (CORS enabled) |
| `POST` | `/api/chat` | Send message to bot (CORS enabled) |
| `GET/POST` | `/api/documents` | List / Upload documents |
| `DELETE` | `/api/documents/[id]` | Delete document |
| `GET` | `/api/analytics?botId=` | Bot analytics |
| `GET` | `/api/user/me` | Current user info |
| `GET` | `/api/user/usage` | Plan usage stats |
| `GET` | `/api/overview` | Dashboard overview stats |
| `POST` | `/api/webhooks/clerk` | Clerk user sync webhook |
| `GET` | `/widget.js` | Embeddable widget script |

---

## 🌐 Embedding the Widget

After creating a bot and uploading documents, get your embed code:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Your Website</h1>

  <!-- Add this before </body> -->
  <script
    src="https://embed-ai-nu.vercel.app/widget.js"
    data-bot-id="YOUR_BOT_ID_HERE">
  </script>
</body>
</html>
```

The widget:
- ✅ Works on any website
- ✅ Zero dependencies
- ✅ CSS isolated from host website
- ✅ Fully responsive
- ✅ Branded with your colors

---

## 📊 Key Technical Highlights

- **RAG Pipeline** — Parallelized batch embedding with `Promise.all`, reducing processing time by 3x
- **Vector Search** — HNSW indexing in pgvector for sub-100ms semantic retrieval
- **Multi-tenancy** — Supabase Row Level Security ensures 100% data isolation
- **Rate Limiting** — HTTP 429 with automatic 30-day counter reset
- **Webhook Security** — Svix HMAC signature verification for Clerk webhooks
- **CORS** — Full CORS support for cross-origin widget embedding

---

## 🚢 Deployment

The project is deployed on **Vercel** with automatic CI/CD:

```bash
# Deploy to Vercel
git push origin main  # Auto-deploys via GitHub integration
```

### Post-deployment Setup
1. Add environment variables in Vercel dashboard
2. Add domain to Supabase allowed origins
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL

---

## 👨‍💻 Author

**Aditya Pandey**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/Aditya06pandey1368)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/adityapandey06)

---
