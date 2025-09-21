# Changelog

## v1.0-hackathon — Urban Life Simulator
**Status:** Production-ready, Safari-compatible, static-hostable.

### Core
- Two-panel RPG UI with top action bar (Save, Load, Export, Community, Glass House, Backrooms, Music, Auto, Shop).
- Collapsible Simulation Log (starts collapsed; never blocks UI).
- Character Creation: freeform role input (player can be anything), role suggestions, stat tooltips, role sanitization.
- Narrative loop: always ends prompts with a question; 2–4 decisions per event; travel/districts supported.

### Systems
- Time (day/night) + Weather; hourly updates; subtle ambience tint on scene image.
- Objectives: seeded by role; auto-evaluated on decisions.
- Wanted Stars: 0–5 stars derived from HEAT (thresholds: 10/25/45/70/95); gentle pulse at 4–5.
- HEAT decay: lay low ≥3 in-game hours → −1 heat per hour.
- Image pipeline: `image.request` includes `{ timeOfDay, weather }`.

### Audio / Community
- Radio stations (Lo-Fi, Hip-Hop, Metal, House, Country, Reggaeton, Dubstep, Psychedelic/Trippy, Vaporwave/Slushwave, Mixes, Classical, News, DJ Spotlight).
- External links: direct audio, YouTube, SoundCloud; iOS autoplay gate handled.
- Community Hub: groundwork for radio uploads and storyline packs (local-first with optional Supabase).

### Persistence
- Hybrid saves: localStorage + optional Supabase slots (Autosave + A/B/C).

### Compatibility
- ES5-only; no optional chaining, nullish coalescing, spread, or top-level await.
- Relative, case-exact module paths; single-page static hosting.

### Notes
- WebSim narrator is optional (`?engine=websim`); local mock is default to preserve free runtime.
