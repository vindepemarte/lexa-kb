# Lexa's Knowledge Base

An AI-powered second brain for organizing, searching, and chatting with your documents.

## Features

- **Document Upload** - Drag & drop PDFs, notes, images (PDF extraction for Personal+)
- **PARA Organization** - Automatic categorization into Projects, Areas, Resources, Archives
- **Full-Text Search** - Find anything in your documents (Free: 3 results, Paid: 50)
- **AI Chat** - Ask questions about your knowledge base (Pro+)
- **Usage Stats** - Track documents used and storage progress
- **Privacy First** - Your data stays yours

## Tech Stack

- **Frontend:** Next.js 15.5.12, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, PostgreSQL
- **AI:** OpenRouter API
- **Database:** PostgreSQL with pgvector
- **Payments:** Stripe (LIVE)
- **Hosting:** Coolify (auto-deploys from master)

## Quick Start

```bash
git clone https://github.com/vindepemarte/lexa-kb.git
cd lexa-kb
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Pricing

| Tier | Docs | Storage | Search | Chat | PDF | Price |
|------|------|---------|--------|------|-----|-------|
| Free | 5 | 100MB | 3 results | No | No | 0 |
| Personal | 10K | 5GB | Full | No | Yes | 9/mo |
| Pro | Unlimited | 50GB | Full | Yes | Yes | 29/mo |
| Enterprise | Unlimited | Unlimited | Full | Yes | Yes | 99/mo |

---

Built with purple heart by [Lexa](https://app.hellolexa.space)
