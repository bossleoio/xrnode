/**
 * Speed Networker XR - Main Entry Point
 * Phase 1: Directory & Radar
 */

import {
  AssetManifest,
  AssetType,
  SessionMode,
  World,
} from "@iwsdk/core";

import { PanelSystem } from "./panel.js";
import { RadarSystem } from "./systems/RadarSystem.js";
import { InteractionSystem, onCardSelect, setSessionSystemRef, setCubeRef } from "./systems/InteractionSystem.js";
import { SessionSystem, onSessionStart, onQuestionReveal, questionCube } from "./systems/SessionSystem.js";

const assets: AssetManifest = {
  // Audio assets
  chimeSound: {
    url: "./audio/chime.mp3",
    type: AssetType.Audio,
    priority: "background",
  },
  // Textures
  webxr: {
    url: "./textures/webxr.png",
    type: AssetType.Texture,
    priority: "critical",
  },
};

World.create(document.getElementById("scene-container") as HTMLDivElement, {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveAR,
    offer: "always",
    features: {
      handTracking: true,
      anchors: true,
      hitTest: true,
      planeDetection: true,
      meshDetection: true,
      layers: true,
    },
  },
  features: {
    locomotion: false,
    grabbing: true,
    physics: true,
    sceneUnderstanding: true,
  },
  level: "./glxf/Composition.glxf",
}).then((world) => {
  const { camera } = world;

  // Position camera at standing height
  camera.position.set(0, 1.6, 0);

  // Register systems
  world.registerSystem(PanelSystem)
       .registerSystem(RadarSystem)
       .registerSystem(InteractionSystem)
       .registerSystem(SessionSystem);

  // Get SessionSystem reference for cube interaction
  const sessionSystem = world.getSystem(SessionSystem);
  if (sessionSystem) {
    setSessionSystemRef(sessionSystem);
  }

  // Handle session start
  onSessionStart((profile) => {
    console.log(`🎯 Session started with ${profile.name}`);
    // Update cube reference
    if (questionCube) {
      setCubeRef(questionCube);
    }
  });

  // Handle question reveal
  onQuestionReveal((question) => {
    console.log(`❓ Ice Breaker Question: "${question}"`);
  });
  
  console.log('🚀 Speed Networker XR initialized');
  console.log('📡 Radar scanning for connections...');
  console.log('💡 Controls:');
  console.log('   WASD - Move camera');
  console.log('   Arrow keys - Rotate carousel');
  console.log('   Click/E - Select card');
  console.log('   G - Grab cube | F - Throw cube');
});
