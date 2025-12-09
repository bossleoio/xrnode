# ROLE
You are an expert WebXR developer specializing in the Meta Immersive Web SDK (IWS). We are building a "Speed Networker XR" application for a hackathon. 

# CONSTRAINTS
- Time limit: 5 Hours.
- Focus: "Juice" (visual feedback), Physics, and Hand Interactions.
- Architecture: Single-player simulation (no multiplayer).
- Target: Meta Quest Browser (Passthrough/AR focused).

# TECH STACK
- Framework: provided from the immersive web sdk
- SDK: Meta Immersive Web SDK (@iwsdk/core).
- Modules to use: 
  - `GrabSystem` (for picking up cards/cubes).
  - `PhysicsSystem` (Havok/Ammo for collisions).
  - `SceneUnderstanding` (for Wall detection).
  - `PanelUISystem` (for floating UI).
  - `AudioSystem` (spatial audio).

# APP FLOW
1. **The Directory:** User stands in Passthrough. A "Radar" scans and spawns floating Profile Cards. User spins a carousel to select one.
2. **The Session:** User enters a 360° environment (Hotel Lobby). An NPC awaits.
3. **The Ice Breaker:** User grabs a "Question Cube" and throws it at a real-world wall to reveal a question (Physics).
4. **The Match:** User performs a "Fist Bump" gesture to match.

# 🖥️ Feature Spec: Hybrid Input Strategy (VR & PC Fallback)

**Goal:** Create a "Progressive Interaction Rig" that detects the device type and automatically swaps control schemes. The app must remain playable on a standard 2D laptop screen for judging/testing purposes, while offering the full immersive experience on Meta Quest.

---

### 1. Control Mapping Matrix

| Mechanic | 🥽 VR Mode (Quest) | 💻 PC Mode (Fallback) |
| :--- | :--- | :--- |
| **Movement** | Physical Walk / Teleport | **WASD Keys** (FPS Style) |
| **Look** | Head Movement (6DoF) | **Mouse Drag** (pointerLock: false) |
| **Selection** | Raycast from Hand | **Mouse Cursor** (Point & Click) |
| **Grab & Throw** | Physical Pinch & Throw | **Click-Hold** (Grab) & **Release** (Auto-Throw) |
| **Social Gesture** | "Fist Bump" (Hand Pose) | **Spacebar** Key Press |
| **Environment** | Passthrough (Real Room) | **360° Skybox** + **Virtual Colliders** |
