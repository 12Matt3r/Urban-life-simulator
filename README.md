# Urban Life Simulator (ULS) - Multi-Realm RPG

Urban Life Simulator is an experimental, browser-based RPG that has evolved into a multi-realm experience. Players can create their own role, make choices, survive challenges, and explore distinct, interconnected worlds, each with its own theme and gameplay mechanics.

This project is built to be 100% client-side, ES5/Safari-compatible, and ready for deployment on static hosting platforms.

## 🚀 Core Features

### Multi-Realm Gameplay
Explore four distinct realms, each offering a unique experience:
- **Urban Life Simulator (The City):** The central hub. A classic RPG experience where you navigate city districts, take on gigs, manage your stats, and interact with a dynamic world.
- **Living Hell:** A surreal, "Fish Tank"-style reality show where player actions can be influenced by a simulated chat. Survive challenges and manage your reputation in a high-pressure environment.
- **The Backrooms:** A tense, fever-dream survival experience based on the popular internet mythos. Navigate uncanny, liminal spaces with minimal choices and eerie hazards.
- **Dreamworld:** A symbolic and surreal realm where you navigate vignettes based on your character's psyche and choices.

### Dynamic Game Systems
- **Character Creation:** A freeform role input system allows you to be anything you want, complemented by suggested roles for inspiration.
- **Adult Mode Toggle:** Choose between a standard, PG-13 experience or an Adult Mode that unlocks mature dialogue, darker storylines, and more explicit themes.
- **Day/Night & Weather Cycles:** The world changes around you, affecting ambient visuals, narrative events, and the availability of certain activities.
- **Player Stats & Progression:** Manage core stats like Strength, Charisma, Sanity, and Fame. Your choices directly impact your character's growth and survival.
- **Wanted System:** Actions have consequences. Gain "HEAT" from illicit activities, which translates into a 0-5 star wanted level, affecting how the world reacts to you.

### Rich Audio Experience
- **7-Station Radio:** The ULS Car Radio features seven distinct stations with extensive playlists and full playback controls, including a persistent shuffle mode. Stations include:
  - Cozy FM (Lofi)
  - Viva La Disco (Latin)
  - Bassface FM (Dubstep)
  - Hip Hop on the Block
  - BackFORTYdrip (Country)
  - Mosh Pit FM (Metal)
  - Notebook FM (Talk Radio)
- **Comprehensive SFX System:** A dynamic sound effects system brings the world to life with UI sounds, ambient loops for different environments, and narrative enhancers for dramatic moments.

### Persistence & Narrative
- **Supabase Backend:** The game uses Supabase for cloud-based persistence of user accounts and save data, with a localStorage fallback.
- **WebSim Narrative Engine:** An AI-powered narrator drives the story, generating dynamic events, descriptions, and choices based on the player's actions and current state.

## 🛠️ Tech Stack

-   **Frontend:** Vanilla JavaScript (ES5-safe), HTML5, CSS3
-   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
-   **Narrative Engine:** WebSim (iframe integration)
-   **Audio:** Native HTML5 `<audio>`

## 📦 Setup & Installation

To run the project locally, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Configure Environment (Optional - for Supabase):**
    If you want to connect to a Supabase backend for cloud saves, you need to create a `env.js` file in the root of the project. If this file is not present, the game will fall back to using `localStorage`.

    Create `env.js` and add the following lines with your Supabase project details:
    ```javascript
    window.SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
    window.SUPABASE_KEY = "YOUR_ANON_KEY";
    ```

3.  **Run the Game:**
    Simply open the `index.html` file in a modern web browser that supports ES5 (like Chrome, Firefox, or Safari). No build step is required.

4.  **Developer Mode:**
    To access the Dev Test Harness, add `?dev=1` to the end of the URL.
    `file:///path/to/your/project/index.html?dev=1`

## 🎮 How to Play

1.  **Start the Game:** Open `index.html` in your browser.
2.  **Character Creation:**
    -   Enter your character's name.
    -   Type any role you can imagine into the freeform input field.
    -   Choose whether to enable **Adult Mode** for a more mature experience.
3.  **Live Your Life:**
    -   Follow the narrative prompts presented by the AI narrator.
    -   Make choices that will shape your story and impact your stats.
    -   Listen to the radio, explore different realms, and try to survive the challenges thrown your way.
4.  **Use the Dev Harness (Optional):**
    -   If running in dev mode, use the floating panel to test various game systems, such as changing scenes, playing sound effects, or modifying player stats.