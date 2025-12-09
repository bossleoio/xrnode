The 5-Hour "Speed Networker XR" Roadmap
Phase 1: The Directory (Visuals & Radar)

Goal: Create the feeling of scanning the metaverse for connections.

- The Radar: Instead of a complex scanner, create a simple, rotating, semi-transparent cone or a pulsing ring at the user's feet.
- The Cards: Use the Entity Component System (ECS) to spawn a semi-circle of profile cards around the user.
    - Aura Effect: Apply a custom shader or a simple glowing material to the card borders to give them an "energy" vibe.
    - Sound: Use the Audio System to attach a spatial sound source to each card. A low, pulsing hum that gets louder as you get closer will enhance the "aura" feel.
- Simulated Matching: Create a simple JSON array of "dummy" profiles. The "radar" will "find" these and spawn them.

Phase 2: Directory Interactions (Gestures)
Goal: Make browsing the directory feel physical.

- Scrolling: Instead of a swipe gesture (which can be finicky), use a Grab Interaction.
    - Place the cards in a carousel-like container.
    - Make the entire container OneHandGrabbable but lock its movement to rotation only. The user grabs the air in front of them and "spins" the carousel.
- Selecting:
    - Use Hand Tracking and raycasting. When the user's hand points at a card, highlight it.
    - Detect a "pinch" gesture (thumb and index finger touching) while pointing to select the card and transition to the session.
    - Add a satisfying "ping" sound on selection.

Phase 3: The Session Environment & NPC
Goal: Set the stage for the meeting.

- Environment: Use a high-quality 360° photo (<a-sky>) for the "Hotel Lobby". This is the fastest way to create a realistic backdrop.
- The NPC: Place a static 3D model of a person opposite the user.
- Profile Card UI: Use the Panel UI System to create a floating profile card next to the NPC. This allows you to build the UI using familiar HTML-like syntax for the timer and buttons.
    - Timer: A simple visual bar that shrinks over 5 minutes.
    - Buttons: Add "Extend" and "End" buttons to the panel.

Phase 4: The Ice Breaker (The Squash Court)
Goal: Create a fun, physical way to reveal questions. This is your "hero" interaction.

- The Setup:
    - The Cube: Spawn a dynamic-body cube that is OneHandGrabbable. Give it a glowing, icy texture.
    - The Wall: Use the Scene Understanding System to detect real-world vertical planes (walls). Automatically attach a static-body physics collider to the detected mesh.
- The Interaction:
    - Use the Physics System (Havok) to listen for a collide event on the cube.
    - On Collision:
        1. Destroy the cube entity.
        2. Spawn a particle effect (like shattering glass).
        3. Play a "glass break" sound using the Audio System.
        4. Reveal one of the pre-written questions on a new floating text panel.
    - Limit this to three cubes/questions.

Phase 5: The Spark Match & Polish
Goal: End the session with a memorable moment.

- The "Spark" Gesture: A Fist Bump is a perfect, socially recognizable gesture for a match.
    - Create a small, invisible interaction zone near the NPC's hand.
    - Use Hand Pose data from the xr-input module to detect if the user's hand is in a "fist" pose.
    - If a fist enters the zone -> MATCH!
- The Finale:
    - Trigger a large, celebratory particle explosion around their hands.
    - Play a triumphant sound effect.
    - Change the NPC's profile card to a "Match Confirmed!" state.
- Final Polish: Do a final pass to balance audio levels and ensure all interactions feel snappy and responsive.

