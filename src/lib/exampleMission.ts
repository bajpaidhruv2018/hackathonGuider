import { SessionListItem } from "./types";

/**
 * Example mission data for onboarding — shows off the full UI
 * when a user has no real projects yet.
 */
export const EXAMPLE_MISSION: SessionListItem = {
  id: "example-delta-00000001",
  status: "active",
  updated_at: new Date().toISOString(),
  concept: {
    raw_text:
      "Build an AI-powered video editor that lets users describe edits in natural language. Target: 3-minute demo with live editing, timeline preview, and export.",
    metadata: {
      hackathon_name: "Project Delta — AI Video Editor",
      time_remaining: "8 hours",
      start_time: new Date(
        Date.now() - 16 * 60 * 60 * 1000
      ).toISOString(), // started 16h ago
      end_time: new Date(
        Date.now() + 8 * 60 * 60 * 1000
      ).toISOString(), // 8h remaining
      team_size: 4,
      team_members: [
        {
          name: "Alex Chen",
          role: "Frontend",
          work: ["Timeline UI", "Preview panel", "Export modal"],
          status: "ON_TRACK",
        },
        {
          name: "Sam Rivera",
          role: "ML/AI",
          work: [
            "NLP edit parser",
            "Video segmentation model",
            "Prompt-to-edit pipeline",
          ],
          status: "AT_RISK",
        },
        {
          name: "Jordan Lee",
          role: "Backend",
          work: ["API endpoints", "FFmpeg processing", "WebSocket sync"],
          status: "ON_TRACK",
        },
        {
          name: "Priya Patel",
          role: "Design",
          work: ["UI/UX mockups", "Demo slides", "Brand assets"],
          status: "ON_TRACK",
        },
      ],
      tech_stack: "Next.js, Python/FastAPI, FFmpeg, Whisper, GPT-4",
      judging_criteria:
        "Innovation (30%), Technical Complexity (25%), Demo Quality (25%), Feasibility (20%)",
    } as any,
  },
  scope_critique: {
    keep: [
      {
        feature: "Natural language edit commands",
        rationale: "Core differentiator — judges will love the live NLP demo",
      },
      {
        feature: "Timeline preview with scrubbing",
        rationale: "Essential for demonstrating real-time feedback loop",
      },
      {
        feature: "One-click export to MP4",
        rationale: "Clean demo ending — shows completeness",
      },
    ],
    cut: [
      {
        feature: "Multi-track audio mixing",
        rationale: "Too complex for remaining time, minimal demo impact",
      },
    ],
    defer: [
      {
        feature: "Collaborative editing",
        rationale: "Cool but not feasible in 8 hours — mention as future work",
      },
    ],
    missing_pieces: [
      "Error handling for malformed prompts",
      "Fallback UI when AI model is slow",
    ],
  },
  roadmap: {
    phases: [
      {
        name: "Foundation",
        time_box: "4 hours",
        milestones: [
          {
            id: "m1",
            task: "Set up FastAPI backend with FFmpeg bindings",
            assigned_to: "Jordan Lee",
            done_condition: "API accepts video upload and returns metadata",
            status: "done",
          },
          {
            id: "m2",
            task: "Build timeline component with drag handles",
            assigned_to: "Alex Chen",
            done_condition: "User can scrub through a sample video",
            status: "done",
          },
        ],
      },
      {
        name: "Build",
        time_box: "6 hours",
        milestones: [
          {
            id: "m3",
            task: "Integrate NLP edit parser with video pipeline",
            assigned_to: "Sam Rivera",
            done_condition:
              "Text command 'trim first 5 seconds' executes correctly",
            status: "in_progress",
          },
          {
            id: "m4",
            task: "WebSocket sync for real-time preview",
            assigned_to: "Jordan Lee",
            done_condition: "Edits reflect in preview within 2 seconds",
            status: "in_progress",
          },
          {
            id: "m5",
            task: "Export pipeline with progress indicator",
            assigned_to: "Alex Chen",
            done_condition: "User clicks export and gets downloadable MP4",
            status: "not_started",
          },
        ],
      },
      {
        name: "Polish",
        time_box: "2 hours",
        milestones: [
          {
            id: "m6",
            task: "Demo script rehearsal and slide deck",
            assigned_to: "Priya Patel",
            done_condition: "3-minute demo runs smoothly end-to-end",
            status: "not_started",
          },
          {
            id: "m7",
            task: "Edge case handling and loading states",
            assigned_to: "Alex Chen",
            done_condition: "No blank screens or unhandled errors in demo flow",
            status: "not_started",
          },
        ],
      },
    ],
  },
  blockers: [
    {
      id: "b1",
      description:
        "FFmpeg WASM compilation failing on large files (>50MB) — may need server-side fallback",
      severity: "medium",
      reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
  ],
};
