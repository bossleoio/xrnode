# 🚀 Speed Networker XR - 3-Hour Proof of Concept Proposal

## Executive Summary
Transform the current QR-scanning matchmaking app into an **immersive, physics-driven social experience** using Meta Immersive Web SDK. Focus on "juice" (visual/audio feedback), hand interactions, and spatial presence rather than complex matching logic.

**Timeline:** 3 hours  
**Scope:** Proof of concept (PoC) - iterate later  
**Target:** Meta Quest Browser (Passthrough AR)  
**Fallback:** Desktop PC with WASD + Mouse controls

---

## 🎯 New Creative Direction vs. Current Approach

### Current State (QR Scanning App)
- ❌ Text-heavy UI, minimal spatial presence
- ❌ 2D card-based interaction
- ❌ Complex AI matching logic
- ❌ Limited hand gesture support
- ❌ No physics or environmental interaction

### New Direction (Speed Networker XR)
- ✅ **Immersive 3D environment** (Hotel Lobby 360° skybox)
- ✅ **Spatial profile cards** spawned in a carousel around user
- ✅ **Physics-driven interactions** (grab, throw, collide)
- ✅ **Hand tracking gestures** (pinch to select, fist bump to match)
- ✅ **Audio feedback** (spatial audio, satisfying sound effects)
- ✅ **Particle effects & visual juice** (glow, shattering, explosions)

---

## 📋 Proposed 3-Hour Breakdown

### **Phase 1: Directory & Radar (45 min)**
**Goal:** Spawn profile cards in 3D space with visual feedback

**Deliverables:**
- Pulsing radar ring at user's feet
- 6-8 profile cards spawned in semi-circle around user
- Glowing aura effect on cards
- Spatial audio (low hum on each card)
- **PC Fallback:** Mouse hover highlights cards

**Key Files to Create:**
- `src/systems/RadarSystem.ts` - Spawns cards in circular pattern
- `src/systems/AudioSystem.ts` - Spatial audio for cards
- `src/materials/AuraMaterial.ts` - Glowing shader for cards

---

### **Phase 2: Directory Interactions (45 min)**
**Goal:** Make card selection feel physical and responsive

**Deliverables:**
- Carousel rotation (grab-to-spin interaction)
- Hand raycast highlighting
- Pinch gesture detection for selection
- Satisfying "ping" sound on select
- Transition to Session environment
- **PC Fallback:** Click-to-select, arrow keys to rotate

**Key Files to Create:**
- `src/systems/GrabSystem.ts` - Carousel rotation logic
- `src/systems/HandTrackingSystem.ts` - Pinch detection
- `src/utils/GestureDetector.ts` - Hand pose recognition

---

### **Phase 3: Session & Ice Breaker (60 min)**
**Goal:** Create the meeting environment and physics interaction

**Deliverables:**
- 360° Hotel Lobby skybox
- Static NPC model opposite user
- Floating profile card UI (Panel System)
- Grabbable question cube (dynamic physics)
- Wall detection via Scene Understanding
- Collision detection → particle effect + sound
- 3 questions revealed on collision
- **PC Fallback:** Click-to-grab, click-release to throw

**Key Files to Create:**
- `src/systems/EnvironmentSystem.ts` - Skybox + NPC setup
- `src/systems/PhysicsSystem.ts` - Cube dynamics + collisions
- `src/systems/SceneUnderstandingSystem.ts` - Wall detection
- `src/systems/ParticleSystem.ts` - Shattering effect
- `src/ui/SessionPanel.ts` - Profile card UI

---

### **Phase 4: Match & Polish (30 min)**
**Goal:** Memorable fist bump gesture and celebratory feedback

**Deliverables:**
- Fist bump detection zone near NPC
- Hand pose recognition (closed fist)
- Particle explosion on match
- Triumphant sound effect
- "Match Confirmed!" UI state
- Audio level balancing
- **PC Fallback:** Spacebar to trigger match

**Key Files to Create:**
- `src/systems/GestureMatchSystem.ts` - Fist bump detection
- `src/effects/MatchParticles.ts` - Celebration effect
- `src/audio/SoundManager.ts` - Centralized audio control

---

## 🏗️ Recommended Changes to plan.md

### Remove (Simplify)
- ❌ Complex AI matching algorithm (use dummy profiles instead)
- ❌ QR code scanning (use pre-loaded profile list)
- ❌ Directory scroll view (use 3D carousel)
- ❌ Connection persistence/database (in-memory only)
- ❌ Appreciation/emote system (focus on core flow)

### Keep & Repurpose
- ✅ Profile data structure (reuse existing types)
- ✅ Participant database (use as dummy data)
- ✅ WebXR context (extend for hand tracking)
- ✅ Component structure (adapt for 3D)

### Add (New)
- ✅ Physics system integration (Havok/Ammo)
- ✅ Scene Understanding for wall detection
- ✅ Audio system (spatial + UI sounds)
- ✅ Particle effects system
- ✅ Hand gesture recognition
- ✅ PC fallback input mapping
- ✅ 360° skybox asset loading

---

## 🎮 Hybrid Input Strategy (VR & PC Fallback)

| Mechanic | 🥽 Quest (VR) | 💻 PC (Fallback) |
|----------|---------------|-----------------|
| **Movement** | Physical walk | WASD keys |
| **Look** | Head tracking | Mouse drag |
| **Card Selection** | Pinch gesture | Click |
| **Carousel Spin** | Grab & rotate | Arrow keys |
| **Grab Cube** | Hand pinch | Click-hold |
| **Throw Cube** | Release hand | Click-release |
| **Fist Bump** | Closed fist pose | Spacebar |
| **Environment** | Passthrough AR | 360° Skybox |

---

## 📊 Success Criteria (PoC)

### Must Have (Core Loop)
- [ ] User can see profile cards in 3D space
- [ ] User can select a card (pinch or click)
- [ ] Session environment loads with NPC
- [ ] User can grab and throw cube
- [ ] Cube collision triggers particle effect + sound
- [ ] User can perform fist bump gesture
- [ ] Match confirmed with celebration effect

### Nice to Have (Polish)
- [ ] Smooth carousel rotation
- [ ] Spatial audio positioning
- [ ] Glowing aura on cards
- [ ] Wall detection working
- [ ] PC fallback fully functional

### Out of Scope (Iterate Later)
- [ ] Multiplayer networking
- [ ] Persistent connections
- [ ] Complex matching algorithm
- [ ] QR code scanning
- [ ] Mobile optimization

---

## 🛠️ Tech Stack (Confirmed)

| Layer | Technology |
|-------|-----------|
| **Framework** | Meta Immersive Web SDK (@iwsdk/core v0.2.2) |
| **Physics** | Havok (via IWSDK) |
| **3D Graphics** | Three.js (super-three v0.177.0) |
| **UI** | Panel UI System (IWSDK) |
| **Audio** | Web Audio API + IWSDK Audio System |
| **Input** | Hand Tracking + Keyboard/Mouse fallback |
| **Build** | Vite + React (for UI overlays only) |

---

## 📁 Proposed File Structure

```
xrnode-iwsd/
├── src/
│   ├── systems/
│   │   ├── RadarSystem.ts          ← Phase 1
│   │   ├── AudioSystem.ts          ← Phase 1
│   │   ├── GrabSystem.ts           ← Phase 2
│   │   ├── HandTrackingSystem.ts   ← Phase 2
│   │   ├── EnvironmentSystem.ts    ← Phase 3
│   │   ├── PhysicsSystem.ts        ← Phase 3
│   │   ├── SceneUnderstandingSystem.ts ← Phase 3
│   │   ├── ParticleSystem.ts       ← Phase 3
│   │   └── GestureMatchSystem.ts   ← Phase 4
│   ├── materials/
│   │   └── AuraMaterial.ts         ← Phase 1
│   ├── effects/
│   │   ├── ParticleEffects.ts      ← Phase 3
│   │   └── MatchParticles.ts       ← Phase 4
│   ├── ui/
│   │   └── SessionPanel.ts         ← Phase 3
│   ├── audio/
│   │   └── SoundManager.ts         ← Phase 4
│   ├── utils/
│   │   ├── GestureDetector.ts      ← Phase 2
│   │   └── InputMapper.ts          ← All phases
│   ├── data/
│   │   └── profiles.json           ← Dummy data
│   └── main.ts                     ← Entry point (IWSDK world)
├── public/
│   ├── audio/
│   │   ├── ping.mp3
│   │   ├── glass-break.mp3
│   │   ├── match-success.mp3
│   │   └── card-hum.mp3
│   ├── textures/
│   │   └── hotel-lobby-360.jpg     ← Skybox
│   └── models/
│       └── npc.glb                 ← NPC model
└── vite.config.ts                  ← Already configured
```

---

## ⚡ Quick Start Checklist

- [ ] Review this proposal
- [ ] Approve changes to plan.md
- [ ] Start Phase 1 (Radar + Cards)
- [ ] Test on Meta Quest or desktop
- [ ] Iterate based on feedback

---

## 🎬 Next Steps

1. **Your Review:** Check if this direction aligns with your vision
2. **Approval:** Confirm we should proceed with this approach
3. **Phase 1 Start:** Begin with Radar System + Audio
4. **Continuous Testing:** Test each phase on device before moving to next

**Questions for you:**
- Does this creative direction excite you?
- Any assets (skybox, NPC model) you want to use?
- Should we prioritize VR or PC fallback?
- Any specific questions/topics for the ice breaker cube?
