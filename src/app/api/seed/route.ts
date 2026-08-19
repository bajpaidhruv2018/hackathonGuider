import { NextResponse } from "next/server";
import { createSession, updateSessionState } from "@/lib/session";
import { Concept, ScopeCritique, Roadmap, PitchOutline, Blocker } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed — Creates a fully-populated demo session with concept,
 * scope, roadmap, blockers, and pitch so you can immediately test all
 * dashboard features without going through the chat flow.
 */
export async function POST() {
  try {
    const now = Date.now();

    const concept: Concept = {
      raw_text:
        "Build an AI-powered study buddy app that uses spaced repetition and GPT-4 to generate personalized flashcards from lecture notes. Target demo: upload a PDF, get smart flashcards, quiz mode with adaptive difficulty.",
      metadata: {
        hackathon_name: "NeuroFlash — AI Study Buddy",
        time_remaining: "12 Hours",
        start_time: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
        team_size: 3,
        team_members: [
          {
            name: "Maya",
            role: "FRONTEND",
            work: ["Quiz UI", "Flashcard viewer", "Upload flow", "Progress dashboard"],
            status: "ON_TRACK" as const,
            last_active_at: new Date(now - 30 * 60 * 1000).toISOString(), // 30 min ago
          },
          {
            name: "Ravi",
            role: "ML/AI",
            work: ["PDF parser", "GPT-4 prompt chain", "Spaced repetition algo", "Difficulty scorer"],
            status: "ON_TRACK" as const,
            last_active_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3h ago → should go AT_RISK
          },
          {
            name: "Elena",
            role: "BACKEND",
            work: ["API endpoints", "Supabase schema", "Auth flow", "File storage"],
            status: "ON_TRACK" as const,
            last_active_at: new Date(now - 15 * 60 * 1000).toISOString(), // 15 min ago
          },
        ],
        tech_stack: "Next.js, Supabase, GPT-4, LangChain, Tailwind CSS",
        judging_criteria:
          "Innovation in EdTech, Use of AI/ML, Demo Quality, User Experience",
      } as any,
    };

    const scopeCritique: ScopeCritique = {
      keep: [
        { feature: "PDF upload → flashcard generation", rationale: "Core demo flow — the 'wow moment' for judges" },
        { feature: "Quiz mode with adaptive difficulty", rationale: "Shows intelligent personalization" },
        { feature: "Progress dashboard", rationale: "Tangible proof of learning improvement" },
      ],
      cut: [
        { feature: "Social leaderboard", rationale: "Nice to have but zero demo impact in 12h" },
        { feature: "Multi-language support", rationale: "Too much scope for the time window" },
      ],
      defer: [
        { feature: "Voice-to-flashcard via Whisper", rationale: "Cool but risky — mention as roadmap item in pitch" },
      ],
      missing_pieces: [
        "Error handling for malformed PDFs",
        "Fallback when GPT-4 rate limits hit",
        "Loading states for long PDF processing",
      ],
    };

    const roadmap: Roadmap = {
      phases: [
        {
          name: "Foundation",
          time_box: "3 hours",
          milestones: [
            {
              id: "m1",
              task: "Set up Supabase schema (users, decks, cards)",
              assigned_to: "Elena",
              done_condition: "Tables created with RLS policies",
              status: "done",
            },
            {
              id: "m2",
              task: "Build PDF upload component with drag-and-drop",
              assigned_to: "Maya",
              done_condition: "File lands in Supabase Storage, returns URL",
              status: "done",
            },
          ],
        },
        {
          name: "Core Build",
          time_box: "5 hours",
          milestones: [
            {
              id: "m3",
              task: "PDF → text extraction pipeline",
              assigned_to: "Ravi",
              done_condition: "Extracts clean text from a 10-page PDF in <5s",
              status: "in_progress",
            },
            {
              id: "m4",
              task: "GPT-4 prompt chain for flashcard generation",
              assigned_to: "Ravi",
              done_condition: "Generates 10+ quality Q&A pairs from extracted text",
              status: "not_started",
            },
            {
              id: "m5",
              task: "Flashcard viewer with flip animation",
              assigned_to: "Maya",
              done_condition: "Cards flip on click, swipe to navigate",
              status: "in_progress",
            },
            {
              id: "m6",
              task: "Quiz API endpoint with scoring",
              assigned_to: "Elena",
              done_condition: "POST /api/quiz returns scored results",
              status: "in_progress",
            },
          ],
        },
        {
          name: "Polish & Demo",
          time_box: "4 hours",
          milestones: [
            {
              id: "m7",
              task: "Adaptive difficulty algorithm",
              assigned_to: "Ravi",
              done_condition: "Weak topics resurface more often",
              status: "not_started",
            },
            {
              id: "m8",
              task: "Progress dashboard with charts",
              assigned_to: "Maya",
              done_condition: "Shows mastery % per topic",
              status: "not_started",
            },
            {
              id: "m9",
              task: "Demo script rehearsal",
              assigned_to: "Elena",
              done_condition: "3-minute demo runs end-to-end without hiccups",
              status: "not_started",
            },
          ],
        },
      ],
    };

    const blockers: Blocker[] = [
      {
        id: "b1",
        description: "GPT-4 API latency averaging 8s per call — may need to batch or cache flashcard generation",
        severity: "critical",
        reported_at: new Date(now - 90 * 60 * 1000).toISOString(),
        resolved: false,
      },
      {
        id: "b2",
        description: "PDF.js WASM bundle is 4MB — first load is slow on mobile",
        severity: "medium",
        reported_at: new Date(now - 45 * 60 * 1000).toISOString(),
        resolved: false,
      },
      {
        id: "b3",
        description: "Supabase free tier row limit approaching — need to clean test data",
        severity: "low",
        reported_at: new Date(now - 20 * 60 * 1000).toISOString(),
        resolved: false,
      },
    ];

    const pitchOutline: PitchOutline = {
      sections: [
        {
          heading: "The Problem",
          content: "Students spend 3x more time making study materials than actually studying. Lecture notes pile up, key concepts get buried, and exam prep is a last-minute panic.",
        },
        {
          heading: "Our Solution",
          content: "NeuroFlash: Upload any lecture PDF and get AI-generated flashcards in seconds. Our spaced repetition engine adapts to your weak spots so you study smarter, not harder.",
        },
        {
          heading: "Live Demo",
          content: "Watch us upload a 10-page biology lecture → instantly generate 15 smart flashcards → take a quiz that adapts in real-time to what you got wrong.",
        },
        {
          heading: "How It Works",
          content: "PDF → text extraction → GPT-4 prompt chain generates Q&A pairs → spaced repetition algorithm prioritizes weak topics → progress dashboard shows mastery over time.",
        },
        {
          heading: "Impact",
          content: "In testing, students using NeuroFlash retained 40% more material vs traditional note review. We're targeting 10K university students in the first semester.",
        },
      ],
      stale: false,
    };

    // Step 1: Create an empty session with the concept pre-loaded
    const session = await createSession(concept);

    // Step 2: Populate all the remaining state
    await updateSessionState(session.id, {
      scope_critique: scopeCritique,
      roadmap,
      pitch_outline: pitchOutline,
      blockers,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      redirectUrl: `/project/${session.id}`,
      message: "Demo session 'NeuroFlash — AI Study Buddy' created with full state.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Failed to seed demo session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
