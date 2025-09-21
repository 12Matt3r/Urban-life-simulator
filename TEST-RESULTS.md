# Test Results (v1.0-hackathon)

## Environments
- Desktop: Chrome latest ✅, Safari latest ✅
- iOS Safari 16+ ✅
- Offline mode (no Supabase/WebSim): boots + local persistence ✅

## Acceptance Tests
1. Boot: no console errors in Safari ✅
2. Character creation: freeform role + suggestions + tooltips; Start Simulation visible ✅
3. Narrative: event text ends with a question; 2–4 decisions shown ✅
4. Travel: district change affects tone/ambience and decisions ✅
5. Time/Weather: HUD shows HH:MM (Day N); weather + °C; image tints subtly ✅
6. Objectives: present and auto-update on decisions ✅
7. Wanted Stars: thresholds 10/25/45/70/95; pulse at 4–5; heat decay works ✅
8. Radio: plays after user gesture; direct + YT/SC; station switch updates “Now Playing” ✅
9. Persistence: save/refresh/load rehydrates state (local); Supabase optional ✅
10. Sim Log: collapsed by default; toggle works; never blocks UI ✅

## Screenshots
Included under `/screenshots`:
- `01_creation.png`
- `02_hud_baseline.png`
- `03_weather_day.png`
- `04_weather_night.png`
- `05_wanted_3stars.png`
- `06_objectives.png`
- `07_radio_playback.png`
- `08_shop_open.png`
- `09_shop_closed.png`
- `10_save_load.png`
