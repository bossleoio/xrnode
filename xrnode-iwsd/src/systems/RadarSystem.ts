/**
 * RadarSystem - Spawns profile cards in a carousel around the user
 * Phase 1: Directory & Radar
 */

import {
  createSystem,
  World,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  Color,
  AdditiveBlending,
} from "@iwsdk/core";

import { PROFILES, Profile } from "../data/profiles.js";

// State
let carouselGroup: Group | null = null;
let radarRing: Mesh | null = null;
let profileCards: Map<string, Mesh> = new Map();
let radarPulseTime = 0;
let cardsSpawned = false;
let selectedProfile: Profile | null = null;

// Callbacks
type SelectCallback = (profile: Profile) => void;
const selectCallbacks: SelectCallback[] = [];

export function onProfileSelect(callback: SelectCallback) {
  selectCallbacks.push(callback);
}

export function getSelectedProfile(): Profile | null {
  return selectedProfile;
}

/**
 * Creates a profile card mesh with text rendered on canvas
 */
function createProfileCard(profile: Profile, world: World): Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;

  // Card background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
  ctx.fill();

  // Glowing border based on match score
  const glowColor = profile.avatarColor;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 8;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 16);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Match score badge
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(canvas.width - 50, 50, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${profile.matchScore}%`, canvas.width - 50, 58);

  // Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "left";
  ctx.fillText(profile.name, 30, 60);

  // Role & Company
  ctx.fillStyle = "#a0a0a0";
  ctx.font = "24px Arial";
  ctx.fillText(profile.role, 30, 100);
  ctx.fillStyle = glowColor;
  ctx.fillText(profile.company, 30, 135);

  // Skills
  ctx.fillStyle = "#808080";
  ctx.font = "18px Arial";
  ctx.fillText("Skills:", 30, 180);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  const skillsText = profile.skills.slice(0, 3).join(" • ");
  ctx.fillText(skillsText, 30, 205);

  // Interests
  ctx.fillStyle = "#808080";
  ctx.font = "18px Arial";
  ctx.fillText("Interests:", 30, 250);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  const interestsText = profile.interests.slice(0, 3).join(" • ");
  ctx.fillText(interestsText, 30, 275);

  // Create mesh
  const texture = new CanvasTexture(canvas);
  const geometry = new PlaneGeometry(0.5, 0.32);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.userData = { profile, type: "profileCard" };

  return mesh;
}

/**
 * Creates the pulsing radar ring at user's feet
 */
function createRadarRing(world: World): Mesh {
  const geometry = new RingGeometry(0.8, 1.0, 64);
  const material = new MeshBasicMaterial({
    color: new Color(0x00f0ff),
    transparent: true,
    opacity: 0.6,
    side: DoubleSide,
    blending: AdditiveBlending,
  });

  const ring = new Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2; // Lay flat
  ring.position.y = 0.01; // Just above floor

  return ring;
}

/**
 * Spawns all profile cards in a semi-circle around user
 */
function spawnProfileCards(world: World) {
  if (cardsSpawned) return;

  carouselGroup = new Group();
  world.scene.add(carouselGroup);

  const radius = 2.0; // Distance from user
  const startAngle = -Math.PI / 3; // -60 degrees
  const endAngle = Math.PI / 3; // +60 degrees
  const angleStep = (endAngle - startAngle) / (PROFILES.length - 1);

  PROFILES.forEach((profile, index) => {
    const card = createProfileCard(profile, world);
    const angle = startAngle + angleStep * index;

    // Position in semi-circle
    card.position.x = Math.sin(angle) * radius;
    card.position.z = -Math.cos(angle) * radius;
    card.position.y = 1.2; // Eye level

    // Face the center
    card.lookAt(0, 1.2, 0);

    carouselGroup!.add(card);
    profileCards.set(profile.id, card);

    console.log(`📇 Spawned card: ${profile.name} at angle ${(angle * 180 / Math.PI).toFixed(0)}°`);
  });

  cardsSpawned = true;
  console.log(`✅ Spawned ${PROFILES.length} profile cards`);
}

/**
 * RadarSystem - Main system for directory view
 */
export class RadarSystem extends createSystem({}) {
  private lastTime = 0;

  init() {
    console.log("🔄 RadarSystem initializing...");

    // Create radar ring
    radarRing = createRadarRing(this.world);
    this.world.scene.add(radarRing);

    // Spawn cards after a short delay (radar scan effect)
    setTimeout(() => {
      spawnProfileCards(this.world);
    }, 1500);

    console.log("✅ RadarSystem initialized");
  }

  update() {
    const deltaTime = 0.016; // ~60fps approximation
    
    // Animate radar pulse
    if (radarRing) {
      radarPulseTime += deltaTime;
      const pulse = Math.sin(radarPulseTime * 3) * 0.5 + 0.5;
      
      // Scale pulse
      const scale = 1 + pulse * 0.3;
      radarRing.scale.set(scale, scale, 1);
      
      // Opacity pulse
      (radarRing.material as MeshBasicMaterial).opacity = 0.3 + pulse * 0.4;
    }

    // Animate cards (subtle float)
    if (carouselGroup) {
      profileCards.forEach((card, id) => {
        const offset = parseInt(id.replace("p", "")) * 0.5;
        card.position.y = 1.2 + Math.sin(radarPulseTime * 2 + offset) * 0.02;
      });
    }
  }

  destroy() {
    if (radarRing) {
      this.world.scene.remove(radarRing);
      radarRing = null;
    }
    if (carouselGroup) {
      this.world.scene.remove(carouselGroup);
      carouselGroup = null;
    }
    profileCards.clear();
    cardsSpawned = false;
  }
}

// Export for external access
export { carouselGroup, profileCards, PROFILES };
