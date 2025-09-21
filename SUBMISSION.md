# Urban Life Simulator — Hackathon Submission (v1.0)

## What it is
A browser-based, single-player life sim / RPG with a modern two-panel UI, dynamic time & weather, objectives, and a wanted system that adapts to player choices. Players can be **anything** they type (freeform roles), with side templates as inspiration.

## Why it’s interesting
- **Player-defined identity** drives seeded objectives and narrative tone.
- **Low-friction AI runtime**: local-first narrative with optional WebSim engine for free “LLM-like” behavior.
- **Ambient world**: time/weather tint scenes and influence events.
- **Audio culture**: multi-genre radio, external link playback, community uploads (optional Supabase).

## How to run
- Static site: open `index.html` from any static host (GitHub Pages/Azure SWA).
- Safari-safe ES5. No build step required.
- Optional: append `?engine=websim` to use the WebSim narrator.

## What we built during the hackathon
- New UI/UX shell.
- Character creation with freeform roles + sanitization.
- Time/Weather, Objectives, Wanted stars + decay.
- Radio playback (direct audio + YouTube/SoundCloud).
- Persistence (local first).

## Screenshots
See `/screenshots` (creation, HUD, weather, objectives, wanted stars, radio, shop, save/load).

## Future work
- Backrooms mode (mini-game overlay)
- Surreal disruptions (toggleable)
- Community hub: fully hosted story packs
- Multiplayer (phase 2)
