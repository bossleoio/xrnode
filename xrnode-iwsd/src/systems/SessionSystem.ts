/**
 * SessionSystem - Manages the 1:1 meeting session environment
 * Phase 3: Session & Ice Breaker
 * 
 * Features:
 * - Transition from directory to session
 * - NPC profile display
 * - Physics-enabled question cube
 * - Ice breaker question reveal on collision
 */

import {
  createSystem,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  BoxGeometry,
  PlaneGeometry,
  SphereGeometry,
  Group,
  Color,
  Vector3,
  CanvasTexture,
  DoubleSide,
  AdditiveBlending,
} from "@iwsdk/core";

import { Profile, ICE_BREAKER_QUESTIONS } from "../data/profiles.js";
import { onCardSelect, getSelectedProfile } from "./InteractionSystem.js";

// Session state
let sessionActive = false;
let selectedProfile: Profile | null = null;
let sessionGroup: Group | null = null;
let npcCard: Mesh | null = null;
let questionCube: Mesh | null = null;
let cubeVelocity = new Vector3();
let cubeGrabbed = false;
let revealedQuestion: string | null = null;
let questionPanel: Mesh | null = null;

// Particle state for collision effect
let particles: Mesh[] = [];
let particleTime = 0;

// Callbacks
type SessionCallback = (profile: Profile) => void;
type QuestionCallback = (question: string) => void;
const sessionStartCallbacks: SessionCallback[] = [];
const questionRevealCallbacks: QuestionCallback[] = [];

export function onSessionStart(callback: SessionCallback) {
  sessionStartCallbacks.push(callback);
}

export function onQuestionReveal(callback: QuestionCallback) {
  questionRevealCallbacks.push(callback);
}

export function isSessionActive(): boolean {
  return sessionActive;
}

/**
 * Creates the NPC profile card (larger, floating in front of user)
 */
function createNPCCard(profile: Profile): Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  // Card background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
  ctx.fill();

  // Glowing border
  ctx.strokeStyle = profile.avatarColor;
  ctx.lineWidth = 10;
  ctx.shadowColor = profile.avatarColor;
  ctx.shadowBlur = 30;
  ctx.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 20);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Match score badge
  ctx.fillStyle = profile.avatarColor;
  ctx.beginPath();
  ctx.arc(canvas.width - 60, 60, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${profile.matchScore}%`, canvas.width - 60, 68);

  // Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "left";
  ctx.fillText(profile.name, 40, 70);

  // Role & Company
  ctx.fillStyle = "#a0a0a0";
  ctx.font = "28px Arial";
  ctx.fillText(profile.role, 40, 115);
  ctx.fillStyle = profile.avatarColor;
  ctx.fillText(profile.company, 40, 155);

  // Skills
  ctx.fillStyle = "#808080";
  ctx.font = "22px Arial";
  ctx.fillText("Skills:", 40, 210);
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText(profile.skills.join(" • "), 40, 245);

  // Interests
  ctx.fillStyle = "#808080";
  ctx.font = "22px Arial";
  ctx.fillText("Interests:", 40, 300);
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText(profile.interests.join(" • "), 40, 335);

  // "Session Active" indicator
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "right";
  ctx.fillText("● SESSION ACTIVE", canvas.width - 40, canvas.height - 30);

  const texture = new CanvasTexture(canvas);
  const geometry = new PlaneGeometry(0.8, 0.53);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide,
  });

  return new Mesh(geometry, material);
}

/**
 * Creates the grabbable question cube
 */
function createQuestionCube(): Mesh {
  const geometry = new BoxGeometry(0.15, 0.15, 0.15);
  const material = new MeshStandardMaterial({
    color: new Color(0x00f0ff),
    emissive: new Color(0x00f0ff),
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
  });

  const cube = new Mesh(geometry, material);
  cube.userData = { type: "questionCube", grabbable: true };
  
  return cube;
}

/**
 * Creates a question reveal panel
 */
function createQuestionPanel(question: string): Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 200;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
  ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
  ctx.fill();

  // Question text
  ctx.fillStyle = "#000000";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Word wrap
  const words = question.split(" ");
  let line = "";
  let y = canvas.height / 2 - 20;
  const maxWidth = canvas.width - 60;
  
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + " ";
      y += 35;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  const texture = new CanvasTexture(canvas);
  const geometry = new PlaneGeometry(1.0, 0.25);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: DoubleSide,
  });

  return new Mesh(geometry, material);
}

/**
 * Creates particle explosion effect
 */
function createParticles(position: Vector3, color: Color): Mesh[] {
  const newParticles: Mesh[] = [];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const geometry = new SphereGeometry(0.02, 8, 8);
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
    });
    
    const particle = new Mesh(geometry, material);
    particle.position.copy(position);
    
    // Random velocity
    particle.userData.velocity = new Vector3(
      (Math.random() - 0.5) * 0.1,
      Math.random() * 0.1,
      (Math.random() - 0.5) * 0.1
    );
    particle.userData.life = 1.0;
    
    newParticles.push(particle);
  }

  return newParticles;
}

/**
 * SessionSystem - Main system for 1:1 meeting sessions
 */
export class SessionSystem extends createSystem({}) {
  
  init() {
    console.log("🎯 SessionSystem initializing...");

    // Listen for card selection to start session
    onCardSelect((profile) => {
      this.startSession(profile);
    });

    console.log("✅ SessionSystem initialized");
  }

  startSession(profile: Profile) {
    if (sessionActive) return;

    console.log(`🚀 Starting session with ${profile.name}...`);
    
    selectedProfile = profile;
    sessionActive = true;

    // Create session group
    sessionGroup = new Group();
    this.world.scene.add(sessionGroup);

    // Create NPC card (positioned in front of user)
    npcCard = createNPCCard(profile);
    npcCard.position.set(0, 1.4, -1.5);
    sessionGroup.add(npcCard);

    // Create question cube (floating near the NPC)
    questionCube = createQuestionCube();
    questionCube.position.set(0.3, 1.2, -1.0);
    sessionGroup.add(questionCube);

    // Notify listeners
    sessionStartCallbacks.forEach(cb => cb(profile));

    console.log("✅ Session started!");
    console.log("   💡 Click the glowing cube to grab it");
    console.log("   💡 Press F to throw the cube");
  }

  endSession() {
    if (!sessionActive) return;

    console.log("👋 Ending session...");

    // Clean up
    if (sessionGroup) {
      this.world.scene.remove(sessionGroup);
      sessionGroup = null;
    }

    npcCard = null;
    questionCube = null;
    questionPanel = null;
    selectedProfile = null;
    sessionActive = false;
    revealedQuestion = null;

    // Clear particles
    particles.forEach(p => this.world.scene.remove(p));
    particles = [];
  }

  update() {
    if (!sessionActive) return;

    // Animate question cube (gentle rotation + float)
    if (questionCube && !cubeGrabbed) {
      questionCube.rotation.y += 0.02;
      questionCube.rotation.x += 0.01;
      questionCube.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.05;
    }

    // Apply cube physics when thrown
    if (questionCube && cubeVelocity.length() > 0.001) {
      questionCube.position.add(cubeVelocity);
      cubeVelocity.y -= 0.002; // Gravity
      cubeVelocity.multiplyScalar(0.98); // Drag

      // Floor collision
      if (questionCube.position.y < 0.1) {
        questionCube.position.y = 0.1;
        cubeVelocity.y *= -0.5;
        
        // Trigger question reveal on impact
        if (!revealedQuestion && cubeVelocity.length() > 0.01) {
          this.revealQuestion();
        }
      }

      // Wall collision (simple bounds)
      if (Math.abs(questionCube.position.x) > 2 || Math.abs(questionCube.position.z) > 2) {
        if (!revealedQuestion) {
          this.revealQuestion();
        }
        cubeVelocity.multiplyScalar(-0.5);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.002;
      p.userData.life -= 0.02;
      (p.material as MeshBasicMaterial).opacity = p.userData.life;

      if (p.userData.life <= 0) {
        this.world.scene.remove(p);
        particles.splice(i, 1);
      }
    }

    // Animate NPC card (subtle float)
    if (npcCard) {
      npcCard.position.y = 1.4 + Math.sin(Date.now() * 0.002) * 0.02;
    }
  }

  revealQuestion() {
    if (revealedQuestion || !questionCube) return;

    // Pick random question
    revealedQuestion = ICE_BREAKER_QUESTIONS[
      Math.floor(Math.random() * ICE_BREAKER_QUESTIONS.length)
    ];

    console.log(`❓ Ice Breaker: "${revealedQuestion}"`);

    // Create particle explosion
    const newParticles = createParticles(
      questionCube.position.clone(),
      new Color(0x00f0ff)
    );
    newParticles.forEach(p => {
      this.world.scene.add(p);
      particles.push(p);
    });

    // Create question panel
    questionPanel = createQuestionPanel(revealedQuestion);
    questionPanel.position.set(0, 1.8, -1.2);
    if (sessionGroup) {
      sessionGroup.add(questionPanel);
    }

    // Notify listeners
    questionRevealCallbacks.forEach(cb => cb(revealedQuestion!));
  }

  // Called when cube is grabbed (from InteractionSystem)
  grabCube() {
    cubeGrabbed = true;
    cubeVelocity.set(0, 0, 0);
  }

  // Called when cube is thrown
  throwCube(direction: Vector3, force: number = 0.1) {
    cubeGrabbed = false;
    cubeVelocity.copy(direction).multiplyScalar(force);
    console.log("🎲 Cube thrown!");
  }

  destroy() {
    this.endSession();
  }
}

// Export for external access
export { sessionActive, selectedProfile, questionCube };
