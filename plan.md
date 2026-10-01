# PLAN: ChamAI — Web Version (Vercel + PWA)

> **Goal:** Build a complete web application skeleton, deploy on Vercel to quickly validate the end-to-end UX flow. The scoring pipeline is a **placeholder** (returns mock/random results). PWA support enabled from the start for installability and basic offline caching.

---

## 1. Tech Stack

| Component | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Best-in-class Vercel integration, SSR/SSG flexibility |
| Language | **TypeScript** | Type safety, better DX, self-documenting models |
| Styling | **Tailwind CSS + shadcn/ui** | Rapid, beautiful, mobile-first UI |
| State Management | **Zustand** | Lightweight, zero boilerplate, simple API |
| Client Storage | **IndexedDB (via Dexie.js)** | Large client-side storage for images & exam data |
| Camera | **Web MediaDevices API** | Direct browser camera access |
| Excel Export | **ExcelJS** | Client-side .xlsx generation |
| Charts | **Recharts** | Lightweight, React-native charting |
| PWA | **next-pwa (Serwist)** | Service worker, caching, installability |
| Deployment | **Vercel** | Zero-config for Next.js, automatic HTTPS |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    VERCEL (Hosting)                    │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │           Next.js App (App Router)               │  │
│  │                                                  │  │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │  │
│  │  │  Pages    │  │Components │  │  Hooks       │  │  │
│  │  └─────┬────┘  └─────┬─────┘  └──────┬───────┘  │  │
│  │        │              │               │          │  │
│  │  ┌─────▼──────────────▼───────────────▼───────┐  │  │
│  │  │            Core Services Layer              │  │  │
│  │  │                                             │  │  │
│  │  │  ┌───────────┐  ┌────────────────────────┐  │  │  │
│  │  │  │  Zustand   │  │  Scoring Pipeline      │  │  │  │
│  │  │  │  Stores    │  │  (Placeholder/Mock)    │  │  │  │
│  │  │  └───────────┘  └────────────────────────┘  │  │  │
│  │  │  ┌───────────┐  ┌────────────────────────┐  │  │  │
│  │  │  │  Dexie.js  │  │  ExcelJS Export       │  │  │  │
│  │  │  │ (IndexedDB)│  │  (Client-side)        │  │  │  │
│  │  │  └───────────┘  └────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Service Worker (PWA)                        │  │  │
│  │  │  Cache: app shell, static assets, fonts      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
e:\ChamAI\
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (header, nav, theme, PWA meta)
│   │   ├── page.tsx                    # Home / Dashboard
│   │   ├── manifest.ts                # PWA Web App Manifest (dynamic)
│   │   ├── exams/
│   │   │   ├── page.tsx                # Exam list
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create new exam
│   │   │   └── [examId]/
│   │   │       ├── page.tsx            # Exam detail
│   │   │       ├── edit/
│   │   │       │   └── page.tsx        # Edit exam
│   │   │       ├── grade/
│   │   │       │   └── page.tsx        # Grading (camera/upload + slots)
│   │   │       ├── review/
│   │   │       │   └── page.tsx        # Flagged Review
│   │   │       └── results/
│   │   │           └── page.tsx        # Results + Export
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── InstallPrompt.tsx       # PWA install banner
│   │   ├── exam/
│   │   │   ├── ExamForm.tsx            # Create/edit exam form
│   │   │   ├── AnswerKeyInput.tsx      # Visual A/B/C/D answer grid
│   │   │   ├── AnswerKeyPaste.tsx      # Quick paste answer key from text
│   │   │   ├── ExamCard.tsx            # Exam card in list view
│   │   │   └── ExamTypeSelector.tsx    # Branch A / Branch B selector
│   │   ├── grading/
│   │   │   ├── CameraCapture.tsx       # Camera viewfinder + capture
│   │   │   ├── ImageUpload.tsx         # Drag & drop / file picker
│   │   │   ├── SlotManager.tsx         # Manage N slots per student
│   │   │   ├── SlotCard.tsx            # Single slot (thumbnail + status)
│   │   │   ├── GradingProgress.tsx     # Progress bar
│   │   │   └── StudentQueue.tsx        # Student navigation
│   │   ├── review/
│   │   │   ├── FlaggedItem.tsx         # Single flagged question
│   │   │   ├── ReviewBucket.tsx        # Flagged items list
│   │   │   ├── QuickReasonChips.tsx    # Quick reason selector
│   │   │   └── ScoreOverride.tsx       # One-tap score correction
│   │   └── results/
│   │       ├── ScoreTable.tsx          # Score summary table
│   │       ├── ScoreDistribution.tsx   # Score distribution chart
│   │       ├── QuestionAnalysis.tsx    # Per-question analysis
│   │       └── ExportButton.tsx        # Excel export button
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts              # Dexie schema definition
│   │   │   └── index.ts               # DB singleton instance
│   │   ├── pipeline/
│   │   │   ├── types.ts               # Pipeline I/O types
│   │   │   ├── placeholder.ts         # ⭐ Mock scoring pipeline
│   │   │   ├── gatekeeper.ts          # Placeholder: image validation
│   │   │   └── engine.ts              # Placeholder: logic engine
│   │   ├── export/
│   │   │   └── excel.ts               # Excel file generation
│   │   └── utils/
│   │       ├── image.ts               # Basic image helpers
│   │       └── helpers.ts             # General utilities
│   │
│   ├── hooks/
│   │   ├── useCamera.ts               # Camera access hook
│   │   ├── useExam.ts                 # Exam CRUD hook
│   │   └── useGrading.ts              # Grading session hook
│   │
│   ├── stores/
│   │   ├── examStore.ts               # Exam state
│   │   ├── gradingStore.ts            # Grading session state
│   │   └── reviewStore.ts             # Flagged review state
│   │
│   └── types/
│       ├── exam.ts                    # Exam, Question, AnswerKey
│       ├── grading.ts                 # GradingSession, Submission, Slot
│       └── result.ts                  # QuestionResult, FlaggedItem
│
├── public/
│   ├── icons/                         # PWA icons (192x192, 512x512)
│   └── screenshots/                   # PWA screenshots (optional)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Data Models

### 4.1. Exam

```typescript
type ExamType = 'branch_a' | 'branch_b';
type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer_number'
  | 'short_answer_english';

interface Exam {
  id: string;
  name: string;
  subject: string;
  examType: ExamType;
  totalPages: number;                  // Number of pages → number of slots
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  number: number;
  type: QuestionType;
  correctAnswer: string;               // 'A'|'B'|'C'|'D' or exact value
  alternativeAnswers?: string[];       // For English short answer
  points: number;
}
```

### 4.2. Grading Session

```typescript
type SlotStatus = 'empty' | 'captured' | 'processing' | 'done' | 'error';
type SubmissionStatus = 'pending' | 'grading' | 'review_needed' | 'completed';

interface GradingSession {
  id: string;
  examId: string;
  startedAt: Date;
  completedAt?: Date;
  submissions: StudentSubmission[];
}

interface StudentSubmission {
  id: string;
  studentIndex: number;
  studentName?: string;
  studentId?: string;
  slots: Slot[];
  status: SubmissionStatus;
  results?: QuestionResult[];
  totalScore?: number;
  maxScore?: number;
}

interface Slot {
  index: number;
  status: SlotStatus;
  imageBlob?: Blob;
  capturedAt?: Date;
}
```

### 4.3. Results

```typescript
type QuestionVerdict = 'VALID' | 'BLANK' | 'MULTI' | 'UNCERTAIN';
type MarkStatus = 'EMPTY' | 'MARKED' | 'CROSSED_OUT' | 'ERASED';

interface QuestionResult {
  questionNumber: number;
  verdict: QuestionVerdict;
  selectedAnswer?: string;
  isCorrect?: boolean;
  confidence: number;                  // 0–1
  needsReview: boolean;
  reviewReason?: string;
  optionDetails?: OptionDetail[];
}

interface OptionDetail {
  label: string;                       // A, B, C, D
  markStatus: MarkStatus;
  confidence: number;
}

interface FlaggedItem {
  submissionId: string;
  questionResult: QuestionResult;
  originalImage?: Blob;
  teacherOverride?: {
    correctedAnswer: string;
    reason: string;
    overriddenAt: Date;
  };
}
```

---

## 5. Pages & UX Flows

### 5.1. Dashboard (`/`)
- Overview: total exams, recent grading sessions, quick stats
- Quick actions: Create Exam, Continue Grading
- Mobile-first responsive layout

### 5.2. Create Exam (`/exams/new`)
```
┌──────────────────────────────────────┐
│  CREATE NEW EXAM                     │
│                                      │
│  Name:    [________________]         │
│  Subject: [Math           ▼]        │
│  Type:    ○ Standard Sheet (Branch A)│
│           ○ Classic Exam   (Branch B)│
│  Pages:   [1]                        │
│                                      │
│  ─── ANSWER KEY ───                  │
│   #  │  A  │  B  │  C  │  D  │ Pts  │
│   1  │ [●] │ [ ] │ [ ] │ [ ] │ 0.25 │
│   2  │ [ ] │ [ ] │ [●] │ [ ] │ 0.25 │
│   3  │ [ ] │ [●] │ [ ] │ [ ] │ 0.25 │
│  ...                                 │
│  [+ Add Question]                    │
│                                      │
│  Or: [📋 Paste Answers] [📄 Import]  │
│                                      │
│  [Save Exam]                         │
└──────────────────────────────────────┘
```

### 5.3. Grading (`/exams/[id]/grade`)
```
┌──────────────────────────────────────┐
│  GRADE — Exam: Math Midterm 2024     │
│  Student #3                          │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     📷 CAMERA PREVIEW          │  │
│  │                                │  │
│  │                                │  │
│  │        [ CAPTURE ]             │  │
│  └────────────────────────────────┘  │
│  or [📁 Upload Image]               │
│                                      │
│  ─── SLOTS (2 pages) ───            │
│  ┌──────┐  ┌──────┐                 │
│  │ ✅ 1 │  │ ⬜ 2 │   ← auto-next  │
│  │[thumb]│  │      │                 │
│  └──────┘  └──────┘                 │
│                                      │
│  [      🟢 GRADE NOW       ] ← lit when all slots filled │
│  [← Previous]          [Next →]      │
└──────────────────────────────────────┘
```

**Flow:**
1. Select exam → enter grading page
2. Camera preview shown (or choose upload)
3. Tap **CAPTURE** → image fills current slot → auto-advance to next slot
4. All N slots filled → **GRADE NOW** button lights up
5. Tap **GRADE** → pipeline runs (placeholder: 1.5s delay + mock results)
6. Quick result summary shown, flagged questions highlighted
7. Move to next student

### 5.4. Flagged Review (`/exams/[id]/review`)
```
┌──────────────────────────────────────┐
│  FLAGGED REVIEW — 5 items            │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Student #2 — Q15   ⚠️ MULTI  │  │
│  │  ┌─────────────────────┐      │  │
│  │  │  [Cropped image Q15] │      │  │
│  │  └─────────────────────┘      │  │
│  │  Pipeline read: A & C         │  │
│  │  Correct answer: B            │  │
│  │                               │  │
│  │  Override: [A] [B] [C] [D]    │  │
│  │            [✗ Mark Blank]     │  │
│  │  Reason:                      │  │
│  │  [Multi-mark] [Erased] [OCR Error] [Other] │
│  │                               │  │
│  │  [✓ Confirm]                  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Student #5 — Q3  ⚠️ UNCERTAIN│  │
│  │  ...                          │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 5.5. Results (`/exams/[id]/results`)
- Score summary table (student name/ID, score, correct/incorrect count)
- Score distribution bar chart (Recharts)
- Per-question analysis: which questions had the most errors, which wrong answers were popular
- **Export Excel** button (ExcelJS, fully client-side)

---

## 6. Placeholder Pipeline

> [!IMPORTANT]
> The real pipeline (YOLO, classifiers, OCR) will be integrated later. Currently using **mock results** to validate UX flows.

```typescript
// lib/pipeline/placeholder.ts

export async function runPlaceholderPipeline(
  slots: Slot[],
  answerKey: Question[]
): Promise<QuestionResult[]> {

  // Simulate processing time
  await delay(1500);

  return answerKey.map((q) => {
    const roll = Math.random();

    if (roll < 0.70) {
      // 70% — Valid answer
      const options = ['A', 'B', 'C', 'D'];
      const selected = options[Math.floor(Math.random() * 4)];
      return {
        questionNumber: q.number,
        verdict: 'VALID' as const,
        selectedAnswer: selected,
        isCorrect: selected === q.correctAnswer,
        confidence: 0.85 + Math.random() * 0.15,
        needsReview: false,
        optionDetails: generateMockOptionDetails(selected),
      };
    } else if (roll < 0.85) {
      // 15% — Blank
      return {
        questionNumber: q.number,
        verdict: 'BLANK' as const,
        confidence: 0.95,
        needsReview: false,
        optionDetails: generateMockOptionDetails(null),
      };
    } else if (roll < 0.93) {
      // 8% — Uncertain → flagged
      return {
        questionNumber: q.number,
        verdict: 'UNCERTAIN' as const,
        confidence: 0.35 + Math.random() * 0.2,
        needsReview: true,
        reviewReason: 'Low confidence',
        optionDetails: generateMockOptionDetails('A'),
      };
    } else {
      // 7% — Multiple marks → flagged
      return {
        questionNumber: q.number,
        verdict: 'MULTI' as const,
        selectedAnswer: 'A & C',
        confidence: 0.6,
        needsReview: true,
        reviewReason: 'Multiple answers marked',
        optionDetails: generateMockOptionDetails('A', 'C'),
      };
    }
  });
}
```

---

## 7. PWA Configuration

### 7.1. Web App Manifest

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChamAI — AI Exam Grading',
    short_name: 'ChamAI',
    description: 'Grade multiple-choice exams with your phone camera',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

### 7.2. Service Worker Strategy

| Resource | Strategy | Rationale |
|---|---|---|
| App shell (HTML, JS, CSS) | **Cache First** | Instant load after first visit |
| Static assets (icons, fonts) | **Cache First** | Rarely change |
| API routes (if any) | **Network First** | Fresh data preferred |
| Images (captured photos) | **Not cached by SW** | Stored in IndexedDB via Dexie |

### 7.3. PWA Features

- **Installable:** "Add to Home Screen" prompt on mobile browsers
- **Offline shell:** App UI loads without network after first visit (data in IndexedDB)
- **Camera access:** Works on installed PWA (requires HTTPS — Vercel provides this)
- **Install prompt component:** Custom `InstallPrompt.tsx` banner for first-time visitors

> [!NOTE]
> Full offline grading (with real AI pipeline) is a future goal for the native app. The PWA here provides **offline UI shell + cached data access**, not offline model inference.

---

## 8. Implementation Phases

### Phase 0 — Project Init ⏱️ ~1 session
- [ ] Init Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Configure ESLint, Prettier
- [ ] Set up Zustand stores (exam, grading, review)
- [ ] Set up Dexie.js (IndexedDB schema)
- [ ] Configure PWA (next-pwa / Serwist, manifest, icons)
- [ ] First deploy to Vercel (verify CI/CD pipeline)

### Phase 1 — Exam Management ⏱️ ~1–2 sessions
- [ ] Dashboard page (`/`)
- [ ] Exam list page (`/exams`)
- [ ] Create exam form + visual answer key input (`/exams/new`)
- [ ] Exam detail + edit/delete (`/exams/[id]`, `/exams/[id]/edit`)
- [ ] Persist exams to IndexedDB
- [ ] Quick-paste answer key from text

### Phase 2 — Capture & Slot UI ⏱️ ~2–3 sessions
- [ ] `CameraCapture` component (Web MediaDevices API)
- [ ] `ImageUpload` component (drag & drop / file picker)
- [ ] `SlotManager`: display N slots, auto-advance on capture
- [ ] Store captured images in IndexedDB
- [ ] `StudentQueue`: student navigation, progress tracking
- [ ] **GRADE NOW** button enabled when all slots filled

### Phase 3 — Placeholder Pipeline + Results ⏱️ ~1–2 sessions
- [ ] Placeholder pipeline (mock scoring with realistic distribution)
- [ ] Quick result display after grading
- [ ] Score summary table (`/exams/[id]/results`)
- [ ] Score distribution chart (Recharts bar chart)
- [ ] Per-question analysis view

### Phase 4 — Flagged Review ⏱️ ~1–2 sessions
- [ ] `ReviewBucket`: list of flagged questions
- [ ] `FlaggedItem`: display image crop + pipeline info
- [ ] `ScoreOverride`: one-tap answer correction
- [ ] `QuickReasonChips`: quick reason selector
- [ ] Update results after review confirmation

### Phase 5 — Export & Polish ⏱️ ~1 session
- [ ] Excel export (ExcelJS, client-side)
- [ ] Responsive testing (mobile / tablet / desktop)
- [ ] Empty states, loading skeletons, error boundaries
- [ ] PWA install prompt banner
- [ ] Performance audit (Lighthouse)

---

## 9. Key Considerations

> [!WARNING]
> - Web camera access requires **HTTPS** — Vercel provides this automatically.
> - Camera behavior varies across browsers (especially iOS Safari has quirks with `getUserMedia`).
> - The placeholder pipeline **does not reflect real accuracy** — it's purely for UX testing.

> [!TIP]
> - Always test on a **real phone** (Chrome mobile) since teachers will primarily use phones.
> - Use **Vercel Preview Deployments** on each PR to let teachers test early.
> - IndexedDB has generous storage limits (~50MB+ on most browsers) — plenty for exam data + images.

---

_This plan focuses on the **app skeleton + UX flow**. The real scoring pipeline (YOLO + classifiers) will be integrated in a future phase, replacing the placeholder module._
