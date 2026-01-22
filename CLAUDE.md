# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Work Order (智能工单录入) - A Chinese-language automotive repair work order app built with Next.js. Created and synced via v0.app, deployed on Vercel.

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm lint     # Run ESLint
pnpm start    # Start production server
```

## Architecture

### Tech Stack
- Next.js 16 with React 19
- Tailwind CSS v4 with shadcn/ui (new-york style)
- TypeScript with path alias `@/*` mapping to root

### Application Flow
Single-page app with state-based navigation (no routes). Flow: `voice-input` → `recognition` → `preview` → `success`

Page components in `components/`:
- `voice-input-page.tsx` - Voice/text input for repair descriptions
- `recognition-results-page.tsx` - AI-recognized parts and actions
- `work-order-preview-page.tsx` - Final order review with pricing
- `order-success-page.tsx` - Confirmation screen

### State Management
`lib/work-order-context.tsx` - React Context provider managing:
- Parts list with selection, actions (更换/钣金/喷漆), quantities
- Labor items with hourly rates
- Price calculations

`lib/work-order-data.tsx` - TypeScript interfaces and demo data for vehicles, parts, labor items

### Styling
- Global CSS variables in `styles/globals.css` using OKLCH color space
- Light/dark theme support via CSS custom properties
- shadcn/ui component configuration in `components.json`

### Note
`next.config.mjs` has `ignoreBuildErrors: true` for TypeScript - type errors won't fail builds.
