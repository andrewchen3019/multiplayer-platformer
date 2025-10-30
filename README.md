# multiplayer-platformer
A real-time multiplayer 2D platformer built with Node.js, Express, and Socket.IO — featuring procedural world generation, synchronized physics, live chat, and an in-game store with weapons and power-ups.

A fast-paced real-time multiplayer platformer built with Node.js, Express, and Socket.IO.
Players connect to a shared procedurally generated world, collect coins, purchase upgrades, and engage in combat using various weapons and abilities — all rendered client-side via the HTML5 Canvas API.

🚀 Features

Multiplayer in real time — Socket.IO handles low-latency bidirectional communication for smooth player updates.

Procedural world generation — Platforms, coins, and spikes are randomly generated on the server for a unique layout each game.

Player synchronization — Server-authoritative model keeps all player positions and actions in sync with interpolation on the client for smoother visuals.

Physics and collision — Basic gravity, jumping, and collision detection implemented client-side for responsive controls.

Combat system — Players can purchase and use items such as:

Guns (with ammo tracking)

Bombs and assassins (in progress)

Teleporters and portals (in progress)

Speed boosts, potions, and revives

In-game store and economy — Collect coins and spend them on upgrades directly in the UI.

Chat system — Integrated text chat using WebSockets for player communication.

Custom skins and themes — Player avatars (e.g., historical figures or animals) plus optional “America Mode” visuals and music.

🧩 Architecture
Server (index.js, users.js)

Built on Express for static file serving.

Uses Socket.IO for player connection management and real-time events:

joinRoom, disconnect, changeValue, shoot, endBullet, etc.

Handles procedural generation of platforms, coins, and spikes.

Maintains authoritative player state and broadcasts updates to all clients.

Runs on a single Node.js process; scalable to multiple rooms with minimal refactor.

Client (public/index.html, main.js, style.css)

Uses HTML5 Canvas for rendering the world and all dynamic entities.

Client physics engine handles:

Gravity, jump arcs, and collision detection.

Rendering of other players with interpolation for smooth movement.

UI components built in vanilla JavaScript (no framework):

In-game HUD, chat, overlays, and store menus.

Uses simple event-based state updates from the server via Socket.IO.
