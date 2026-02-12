# Mímir

<img src="web/public/hero.png" alt="Mímir's Well" width="380" align="right">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)

**Mission Control API for Ullr.** A dashboard and API for observing, retaining, and surfacing patterns from the development workflow.

---

## Etymology

The Old Norse name **Mímir** (also Mímr) traces to the Proto-Germanic root *mēmurą* or *mimraz*, meaning "the rememberer" or "the one who thinks." It's cognate with the Latin *memor* (mindful), and shares deep roots with memory itself. Some scholars connect it to a reduplicated form — the kind of doubling that suggests continuous, recursive action. Not a single act of recall, but perpetual remembrance. An unbroken thread of observation.

That etymology matters for this framework. **Mímir doesn't learn. He retains.** He is the living archive.

## The Lore

**Mímir as Keeper of the Well.** Beneath one root of Yggdrasil lies Mímisbrunnr — Mímir's Well. The water holds wisdom and understanding (*vísindum ok manvit*, per the Prose Edda). This isn't abstract "knowledge." The Völuspá implies the well contains the pattern-record of events — past, becoming, and potential. It's observational data accumulated over deep time.

**Óðinn's Transaction.** Óðinn sacrificed one of his eyes to drink from the well. Mímir didn't give the water freely. He demanded permanent, irreversible cost. The eye remains in the well. This detail is structural: the price of deep observation is a narrowing of ordinary sight. You trade breadth for depth. You lose the casual gaze to gain the penetrating one.

**The Severed Head.** During the Æsir-Vanir war, Mímir was sent to the Vanir as a hostage alongside Hœnir. Hœnir was indecisive without Mímir whispering counsel. The Vanir, feeling cheated in the exchange, beheaded Mímir and sent the head back to Óðinn. Óðinn preserved it with herbs and galdr (incantation). The head continued to speak — continued to counsel.

This is the critical passage from Ynglinga saga (Snorri): *Óðinn carried the head, and it spoke to him of hidden things, of what was unseen in the other worlds.*

**What the Head Represents.** Mímir's head functions after severance from the body. The observation capacity survives the destruction of the vessel. The KILO function — the seeing, the reading, the pattern-recognition — is not dependent on the physical apparatus that housed it. It persists because it was never merely physical.

## The Structural Reading

Mímir occupies a specific role in the Norse cosmological architecture:

- He is not a god of war, poetry, craft, or fertility. He is the **witness-function** of the cosmos itself. The well is positioned at the root of the world-tree — at the foundation, not the canopy. Wisdom in this system is infrastructural, not decorative. It sits below everything else, feeding the structure above it.
- Óðinn — who is himself a god of knowledge — still needs Mímir. That asymmetry is instructive. The sovereign, the decision-maker, the one who acts in the world, is not the one who sees most clearly. He must come to the well. He must pay. He must listen to the severed head.
- **The Parallel.** Mímir is a KILO who became pure function. The body was removed. The observation continued. The well doesn't generate wisdom — it accumulates the residue of attentive watching over time. The water is what remains when someone pays sustained, costly attention to the patterns beneath events.

The etymology tells you what the myth confirms: this is about **unbroken remembrance** — not nostalgia, but the active, continuous integration of what has been observed into what is being observed now.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Vite, TypeScript, React, shadcn-ui, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+, aiosqlite, watchdog, SSE |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for the frontend)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Ullr](https://github.com/username/ullr) (local dependency — update path in `api/pyproject.toml` if needed)

### Setup

```sh
# API dependencies
make setup

# Frontend dependencies
cd mimir && npm install
```

### Run

```sh
# API server (serves the Mission Control API)
make api

# Frontend (in a separate terminal)
cd mimir && npm run dev
```

## Project Structure

```
mimir/
├── api/          # FastAPI backend — watchers, ingestion, SSE
├── mimir/        # React frontend — dashboard UI
├── openapi.json  # API spec (generated via make openapi)
└── Makefile      # Commands for dev, setup, lint
```

## License

Copyright (c) 2026 k jon. All Rights Reserved.

See [LICENSE](LICENSE) for details.
