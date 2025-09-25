# Urban Life Simulator - Multi-Realm Edition

This project is a modular, multi-realm narrative game built for the Chroma Awards. It consists of a central "Urban Life Simulator" hub and several interconnected "realms," each offering a unique gameplay experience.

## 🚀 Project Vision

The game is designed as a single-page application that runs entirely in the browser, with no login or downloads required. It's built around a core set of shared systems (the "Kernel") and a "Router" that manages transitions between the different game realms.

The project includes the following realms:
*   **ULS (Urban Life Simulator):** The central hub where the main game loop takes place.
*   **Living Hell (Fish Tank):** A reality show-themed realm with "Chat Control" mechanics.
*   **Backrooms:** A surreal, fever-dream-like survival experience.
*   **Dreamworld:** A realm of symbolic trials that affect the player's stats and abilities.

## 🏗️ Architecture

The project follows a modular architecture to keep the different realms and systems decoupled and maintainable.

*   `/kernel/`: Contains the shared, realm-agnostic systems like the `eventBus`, `router`, `state` manager, and `hotpatch` injector.
*   `/realms/`: Contains the individual game realms, each with its own UI, systems, and logic.
    *   `/uls/`
    *   `/livinghell/`
    *   `/dreamworld/`
    *   `/backrooms/`
*   `/systems/`: Contains other shared systems like the `narrator`, `imagegen`, `music`, and `save` systems.
*   `/ui/`: Contains shared UI components like the `hud`, `radio`, and `dialogue` systems.
*   `index.html`: The single entry point for the application, which loads all the necessary scripts and starts the game.
*   `styles.css`: The main stylesheet for the application.

## 🎮 How to Play

The project is delivered as a single, self-contained `index.html` file that includes a **Dev Test Harness**. To play and test the game:

1.  **Open `index.html` in a desktop browser.**
2.  The game will load, and you will see a floating **Dev Harness** panel in the top-right corner.
3.  Use the buttons in the harness to test the various game systems:
    *   **💵 Wallet +$50:** Adds $50 to the player's wallet.
    *   **⭐ Fame +5:** Increases the player's fame/reputation by 5.
    *   **🎬 Open Credits:** Displays the credits screen.
    *   **🧩 Apply Hotpatch:** Applies a test hotpatch to the game at runtime.
    *   **📜 List Patches:** Shows a list of all applied hotpatches.
    *   **🧹 Teardown:** Removes the test harness UI.
4.  Open the browser's **DevTools console** to see detailed logs from the game's event bus and other systems.

## 🔧 Development Notes

The project is built to be ES5-compatible to ensure it runs on a wide range of browsers, including older versions of Safari. It does not use any modern JavaScript features like `async/await`, `let`/`const`, or classes.

The final `index.html` contains all the necessary code to run the game, including the kernel, all the modules, and the test harness. This was done to work around persistent issues with the file system tools in the development environment.

---

This README provides a comprehensive overview of the project and how to run and test it. It is the final piece of documentation for the project.