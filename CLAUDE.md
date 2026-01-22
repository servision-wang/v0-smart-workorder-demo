# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Work Order (智能工单录入) - A Chinese-language automotive repair work order app with voice control via OpenAI Realtime API. Built with Next.js, created/synced via v0.app, deployed on Vercel.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

Note: Project has both `pnpm-lock.yaml` and `package-lock.json`; either package manager works.

## Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=sk-...   # For voice control via OpenAI Realtime API
```

## Architecture

### Tech Stack
- Next.js 16 with React 19
- Tailwind CSS v4 with shadcn/ui (new-york style)
- TypeScript with path alias `@/*` mapping to root
- OpenAI Realtime API (WebRTC) for voice control

### Application Flow
Single-page app with state-based navigation in [app/page.tsx](app/page.tsx). Flow: `voice-input` → shimmer transition → `recognition` → (optional) `epc-catalogue` → `preview` → `success`

During voice-input → recognition transition, a [ShimmerTransition](components/shimmer-transition.tsx) displays while the `/api/extract-parts` endpoint processes the transcript.

Page components in `components/`:
- `voice-input-page.tsx` - Voice/text input for repair descriptions
- `recognition-results-page.tsx` - AI-recognized parts and actions with EPC lookup
- `epc-catalogue-page.tsx` - Parts catalog for finding replacement parts
- `work-order-preview-page.tsx` - Final order review with pricing
- `order-success-page.tsx` - Confirmation screen

### State Management (Two Context Providers)

**`lib/voice-control-context.tsx`** - Voice/AI interaction layer:
- WebRTC connection to OpenAI Realtime API (gpt-4o-realtime-preview)
- Manages microphone input, audio output, and connection state
- Executes tool calls from AI (navigation, part selection, quantity adjustments)
- Maintains transcript history across page transitions

**`lib/work-order-context.tsx`** - Business data layer:
- Parts list with selection, actions (更换/钣金/喷漆), quantities
- Labor items with hourly rates and price calculations
- EPC catalog state for part replacement workflow
- Registers handlers with VoiceControlContext for voice commands

### Voice Control System

**API Routes**:
- `app/api/realtime/session/route.ts` - Creates ephemeral tokens for WebRTC connection with OpenAI Realtime API
- `app/api/extract-parts/route.ts` - Extracts structured parts data from transcript text using GPT-4o-mini during voice-input → recognition transition

**Tool Definitions**: `lib/tools-definition.ts` - All voice commands the AI can execute:
- Navigation: `click_confirm`, `go_back`, `new_order`
- Parts: `toggle_part`, `set_part_action`, `select_all_parts`
- EPC: `open_epc`, `select_epc_part`, `confirm_epc_selection`
- Adjustments: `adjust_quantity`, `adjust_labor_hours`
- Input: `add_repair_items`

### Styling
- Global CSS in `app/globals.css` using OKLCH color space
- Light/dark theme via CSS custom properties
- shadcn/ui configuration in `components.json`

### Build Notes
- `next.config.mjs` has `ignoreBuildErrors: true` - type errors won't fail builds
- Images are unoptimized (`images: { unoptimized: true }`) for v0.app compatibility
- No test suite in project
- Project auto-syncs with v0.app deployments
