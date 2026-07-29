# 🚀 Hackathon Coach

An AI coaching agent that helps hackathon teams turn a raw idea into a scoped build plan, milestone roadmap, pitch outline, and live blocker tracker.

Built with **Next.js** (App Router) + **React** + **TypeScript** + **Tailwind CSS** + **Supabase** + **Claude (Anthropic API)**.

---

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run this migration:

```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concept JSONB,
  scope_critique JSONB,
  roadmap JSONB,
  pitch_outline JSONB,
  blockers JSONB DEFAULT '[]'::jsonb,
  chat_history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (open for single-team use)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON sessions FOR ALL USING (true) WITH CHECK (true);
```

3. Copy your **Project URL** and **anon key** from **Settings → API**.

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
- `ANTHROPIC_API_KEY` — your Claude API key (from [console.anthropic.com](https://console.anthropic.com))

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧠 The Four Coaching Flows

### 1. Concept Intake & Scope Critique
Paste your hackathon idea — problem, target user, rough feature list — plus your constraints (time remaining, team size, tech stack, judging criteria). The coach asks only 2–4 truly blocking questions, then returns a **Keep / Cut / Defer** critique with rationale for every recommendation.

### 2. Roadmap Generation
Breaks your remaining time into phases (Build Core → Integrate → Polish/Demo Prep) with time-boxed milestones. Every milestone has a single, demoable "done" condition. The roadmap auto-regenerates when scope or time changes.

### 3. Pitch Outline
Generates a structured pitch: **Problem → Solution → Live Demo Beat-by-Beat → Impact/Differentiation → Ask**. Every section maps to something in your current scope. If scope changes, the pitch is flagged as stale with a one-click regenerate.

### 4. Check-ins & Nudges
Report status anytime ("stuck on X", "Y not started"). The coach logs blockers, updates milestone status, and returns **exactly one prioritized next action**. If a delay endangers demo-readiness, it warns and proposes a concrete de-scope option.

---

## 🎨 UI Overview

| Left Panel (55%) | Right Panel (45%) |
|---|---|
| Chat with the AI coach | Live Project State |
| Message history | Tabbed: Scope · Roadmap · Pitch · Blockers |
| Typing indicators | Real-time state updates |
| Markdown rendering | Alert badges for risks |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Claude API (server-side only)
│   │   └── session/route.ts   # Session CRUD
│   ├── globals.css             # Design system
│   ├── layout.tsx              # Root layout + SEO
│   └── page.tsx                # Main split-panel page
├── components/
│   ├── ChatPanel.tsx           # Chat interface
│   ├── ProjectStatePanel.tsx   # State panel container
│   ├── ScopeView.tsx           # Keep/Cut/Defer display
│   ├── RoadmapView.tsx         # Phase timeline
│   ├── PitchView.tsx           # Pitch outline
│   └── BlockerView.tsx         # Blocker list
└── lib/
    ├── session.ts              # Supabase session helpers
    ├── supabase.ts             # Supabase client
    ├── system-prompt.ts        # Claude system prompt
    └── types.ts                # TypeScript interfaces
```

---

## 📝 Design Principles

- **Cut-first coaching**: The agent's default instinct is to de-scope, not add. Overbuilding is the #1 hackathon failure mode.
- **Demo-readiness**: Everything is evaluated against "can this be shown live in the demo?" — not "is this technically complete?"
- **Low overhead**: Useful output from a single pasted idea. No long onboarding forms.
- **Always actionable**: Every coach response ends with exactly one clear next step.

---

## 📄 License

MIT
