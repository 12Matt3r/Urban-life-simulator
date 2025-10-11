# Urban Life Simulator (ULS) - Multi-Realm RPG

Urban Life Simulator is an experimental, browser-based RPG that has evolved into a multi-realm experience. Players can create their own role, make choices, survive challenges, and explore distinct, interconnected worlds, each with its own theme and gameplay mechanics.

This project is a 100% client-side, single-file application, ready for deployment on any static hosting platform or for use directly from your local file system.

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
- **7-Station Radio:** The ULS Car Radio features seven distinct stations with extensive playlists and full playback controls, including a persistent shuffle mode.
- **Comprehensive SFX System:** A dynamic sound effects system brings the world to life with UI sounds and narrative enhancers for dramatic moments.

### Persistence & Narrative
- **Local Storage:** Game state is persisted in the browser's local storage.
- **WebSim Narrative Engine:** The game integrates with external narrative modules hosted on WebSim, allowing for dynamic and expandable storytelling.

## 🛠️ Tech Stack

-   **Frontend:** Vanilla JavaScript (ES5-compatible), HTML5, CSS3

## 🎮 How to Play

Because this is a single-file web application, there is no build process.

1.  **Clone the Repository (Optional):**
    If you want to have a local copy, you can clone this repository.
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```

2.  **Run the Game:**
    -   **Option A (Recommended):** Serve the project root directory with a simple local web server. This is necessary for the narrative and image generation iframes to work correctly due to browser security policies.
        ```bash
        # If you have Python 3 installed
        python3 -m http.server 8000
        ```
        Then, open your browser and navigate to `http://localhost:8000`.
    -   **Option B (Offline):** You can open the `index.html` file directly in your web browser. Note that some features that rely on cross-origin iframes may not function as expected with this method.

3.  **Character Creation:**
    -   Enter your character's name.
    -   Type any role you can imagine into the freeform input field.
    -   Choose whether to enable **Adult Mode** for a more mature experience.

4.  **Live Your Life:**
    -   Follow the narrative prompts presented by the narrator.
    -   Make choices that will shape your story and impact your stats.
    -   Listen to the radio, explore different realms, and try to survive the challenges thrown your way.

5.  **Developer Debugging:**
    -   When the application is running, open your browser's developer console.
    -   You can access all the core game systems via the `window.__app` object for debugging purposes.
    -   For example, to give yourself 100 money, you could run: `eventBus.publish('stats.update', { money: window.__app.stats.money + 100 })`