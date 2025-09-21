Urban Life Simulator

An experimental browser-based RPG where players can live any life they imagine. Create your own role, make choices, survive challenges, and see how long you can thrive in the city.

Built for the Hackathon 2025 — feature-complete and Safari-compatible.

🚀 Features

Two-Panel RPG Interface

Left: Story panel with branching narrative.

Right: Player dashboard (stats, objectives, wanted level).

Top: Action bar with quick-access controls.

Collapsible sim log.

Character Creation

Freeform role input (be anything you want).

Suggested roles for inspiration.

Role sanitization (keeps language safe).

Dynamic Systems

Day/Night Cycle with shop hours and ambience changes.

Weather System with randomized atmospheric effects.

Wanted Stars (0–5) linked to the HEAT stat.

Objectives Panel that evolves with your choices.

Storyline Log always accessible — track what you’ve done.

Adult Content Toggle

At the start, choose between Standard Mode or Adult Mode.

Adult Mode unlocks mature dialogue, stronger language, sexual themes, and darker storylines.

Audio & Radio

12 radio stations: Lo-Fi, Hip-Hop, Reggaeton, Dubstep, House, Metal, Country, Vaporwave/Slushwave, Trippy, Classical, News, Mixes.

Play external links (YouTube, SoundCloud, MP3/OGG/WAV).

Community uploads via Supabase backend.

Persistence

Hybrid save system: Supabase cloud saves + localStorage fallback.

Autosave and multiple save slots.

Extras & Surreal Events

Lottery events.

Dream sequences that include strange, symbolic objects (like a mysterious ball that drifts through your sleep).

Surprising narrative twists for replayability.

🛠️ Tech Stack

Frontend: Vanilla JavaScript (ES5 only), HTML5, CSS3

Backend: Supabase (PostgreSQL + Auth + Storage)

Narrative Engine: WebSim iframe integration with local fallback

Audio: HTML5 <audio> + embedded YouTube/SoundCloud

📦 Setup

Clone the repository:

git clone https://github.com/12Matt3r/Urban-life-simulator.git
cd Urban-life-simulator


Configure environment variables:
Create env.js with your Supabase project details:

window.SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
window.SUPABASE_KEY = "YOUR_ANON_KEY";


Open index.html in a browser (or serve with a static server).

(Optional) Deploy via Azure Static Web Apps or Vercel.

🎮 How to Play

Start Simulation

Enter your name.

Type in any role you want to play.

Adjust your stats.

Toggle Adult Mode ON/OFF depending on the style of experience you want.

Live Your Life

Follow the narrative prompts.

Every decision advances your story.

Watch your stats, objectives, and wanted level.

Survive & Thrive

Avoid getting caught.

Explore surreal events and dream sequences.

Try to build your legacy.

✅ Hackathon Submission Status

Feature-complete ✅

9 acceptance tests passing ✅

Safari + mobile compatible ✅

Supabase + WebSim fully integrated ✅
