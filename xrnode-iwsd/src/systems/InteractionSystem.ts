/**
 * InteractionSystem - Handles card selection and carousel rotation
 * Phase 2: Directory Interactions
 * 
 * VR: Controller raycast + trigger (squeeze to select)
 * PC: Mouse click + arrow keys + WASD movement
 */

import {
  createSystem,
  Raycaster,
  Vector2,
  Vector3,
  Mesh,
  MeshBasicMaterial,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
} from "@iwsdk/core";

import { carouselGroup, profileCards } from "./RadarSystem.js";
import { Profile } from "../data/profiles.js";

// Session cube interaction (set by SessionSystem)
let sessionSystemRef: any = null;
let cubeRef: any = null;
let holdingCube = false;

export function setSessionSystemRef(system: any) {
  sessionSystemRef = system;
}

export function setCubeRef(cube: any) {
  cubeRef = cube;
}

// State
let raycaster: Raycaster;
let mouse = new Vector2();
let hoveredCard: Mesh | null = null;
let selectedProfile: Profile | null = null;
let carouselRotation = 0;
let targetRotation = 0;

// PC Movement state
const moveState = { forward: false, backward: false, left: false, right: false };
const MOVE_SPEED = 0.05;

// VR Controller state
let xrSession: XRSession | null = null;
let leftController: XRInputSource | null = null;
let rightController: XRInputSource | null = null;
let controllerRayLine: Line | null = null;
let vrHoveredCard: Mesh | null = null;
let lastSelectTime = 0;

// Callbacks
type SelectCallback = (profile: Profile) => void;
const selectCallbacks: SelectCallback[] = [];

export function onCardSelect(callback: SelectCallback) {
  selectCallbacks.push(callback);
}

export function getSelectedProfile(): Profile | null {
  return selectedProfile;
}

/**
 * Highlight a card when hovered
 */
function highlightCard(card: Mesh | null, highlight: boolean) {
  if (!card) return;
  
  if (highlight) {
    card.scale.set(1.2, 1.2, 1);
  } else {
    card.scale.set(1, 1, 1);
  }
}

/**
 * Select a card and trigger callbacks
 */
function selectCard(card: Mesh) {
  const profile = card.userData.profile as Profile;
  if (!profile) return;

  selectedProfile = profile;
  
  // Visual feedback - pulse animation
  card.scale.set(1.4, 1.4, 1);
  setTimeout(() => {
    card.scale.set(1, 1, 1);
  }, 300);

  // Notify listeners
  selectCallbacks.forEach(cb => cb(profile));
  console.log(`✅ Selected: ${profile.name} (${profile.matchScore}% match)`);
}

/**
 * InteractionSystem - Main system for card interactions
 */
export class InteractionSystem extends createSystem({}) {
  private boundMouseMove!: (e: MouseEvent) => void;
  private boundMouseDown!: (e: MouseEvent) => void;
  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;

  init() {
    console.log("🎮 InteractionSystem initializing...");
    
    raycaster = new Raycaster();
    
    // Bind event handlers
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    
    // PC Controls
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Create controller ray visualization
    const rayGeometry = new BufferGeometry();
    const positions = new Float32Array(6);
    rayGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    const rayMaterial = new LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    controllerRayLine = new Line(rayGeometry, rayMaterial);
    controllerRayLine.visible = false;
    this.world.scene.add(controllerRayLine);

    // Listen for XR session changes
    this.world.visibilityState.subscribe((state) => {
      // VisibilityState enum: NonImmersive = 0, Immersive = 1, etc.
      const isXR = String(state) !== "NonImmersive" && String(state) !== "0";
      if (isXR) {
        console.log("🥽 XR Mode - Controllers active");
        if (controllerRayLine) controllerRayLine.visible = true;
      } else {
        console.log("💻 PC Mode - Mouse/Keyboard active");
        if (controllerRayLine) controllerRayLine.visible = false;
      }
    });
    
    console.log("✅ InteractionSystem initialized");
    console.log("   🖱️ PC: Click on cards, WASD to move");
    console.log("   🥽 VR: Point controller + Squeeze/Trigger to select");
  }

  onMouseMove(event: MouseEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onMouseDown(event: MouseEvent) {
    // Only handle left click
    if (event.button !== 0) return;
    
    console.log("🖱️ Mouse down detected");
    
    if (hoveredCard) {
      selectCard(hoveredCard);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'arrowleft':
        targetRotation += 0.3;
        break;
      case 'arrowright':
        targetRotation -= 0.3;
        break;
      case ' ':
        if (hoveredCard) {
          selectCard(hoveredCard);
        }
        event.preventDefault();
        break;
      case 'w':
        moveState.forward = true;
        break;
      case 's':
        moveState.backward = true;
        break;
      case 'a':
        moveState.left = true;
        break;
      case 'd':
        moveState.right = true;
        break;
      case 'e':
      case 'enter':
        // Select hovered card
        if (hoveredCard) {
          selectCard(hoveredCard);
        }
        break;
      case 'f':
        // Throw cube if holding
        if (sessionSystemRef && holdingCube) {
          const camera = this.world.camera;
          const direction = new Vector3(0, 0, -1);
          direction.applyQuaternion(camera.quaternion);
          sessionSystemRef.throwCube(direction, 0.15);
          holdingCube = false;
          console.log("🎲 Threw the cube!");
        }
        break;
      case 'g':
        // Grab cube
        if (sessionSystemRef && cubeRef) {
          sessionSystemRef.grabCube();
          holdingCube = true;
          console.log("✊ Grabbed the cube!");
        }
        break;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'w':
        moveState.forward = false;
        break;
      case 's':
        moveState.backward = false;
        break;
      case 'a':
        moveState.left = false;
        break;
      case 'd':
        moveState.right = false;
        break;
    }
  }

  update() {
    const camera = this.world.camera;
    if (!camera) return;

    // Check if in XR mode
    const isXR = this.world.renderer?.xr?.isPresenting ?? false;

    if (isXR) {
      // VR Mode: Use controller input
      this.updateVRInput();
    } else {
      // PC Mode: Use mouse/keyboard
      this.updatePCInput(camera);
    }

    // Smooth carousel rotation (both modes)
    if (carouselGroup) {
      const rotationDiff = targetRotation - carouselRotation;
      if (Math.abs(rotationDiff) > 0.001) {
        carouselRotation += rotationDiff * 0.1;
        carouselGroup.rotation.y = carouselRotation;
      }
    }
  }

  updatePCInput(camera: any) {
    // PC Movement (WASD)
    if (moveState.forward) camera.position.z -= MOVE_SPEED;
    if (moveState.backward) camera.position.z += MOVE_SPEED;
    if (moveState.left) camera.position.x -= MOVE_SPEED;
    if (moveState.right) camera.position.x += MOVE_SPEED;

    // Raycast for card hover/selection
    if (carouselGroup && profileCards.size > 0) {
      raycaster.setFromCamera(mouse, camera);
      
      const cards = Array.from(profileCards.values());
      const intersects = raycaster.intersectObjects(cards, false);
      
      if (intersects.length > 0) {
        const newHovered = intersects[0].object as Mesh;
        if (newHovered !== hoveredCard) {
          highlightCard(hoveredCard, false);
          hoveredCard = newHovered;
          highlightCard(hoveredCard, true);
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (hoveredCard) {
          highlightCard(hoveredCard, false);
          hoveredCard = null;
          document.body.style.cursor = 'default';
        }
      }
    }
  }

  updateVRInput() {
    // Get XR frame and input sources
    const xr = this.world.renderer?.xr;
    if (!xr || !xr.isPresenting) return;

    const session = xr.getSession();
    if (!session) return;

    // Get input sources (controllers/hands)
    const inputSources = session.inputSources;
    
    for (const source of inputSources) {
      // Skip if no grip space
      if (!source.gripSpace && !source.targetRaySpace) continue;

      // Get controller pose
      const frame = xr.getFrame();
      if (!frame) continue;

      const refSpace = xr.getReferenceSpace();
      if (!refSpace) continue;

      const raySpace = source.targetRaySpace;
      const pose = frame.getPose(raySpace, refSpace);
      if (!pose) continue;

      // Get ray origin and direction
      const position = pose.transform.position;
      const orientation = pose.transform.orientation;
      
      const rayOrigin = new Vector3(position.x, position.y, position.z);
      const rayDirection = new Vector3(0, 0, -1);
      rayDirection.applyQuaternion({
        x: orientation.x,
        y: orientation.y,
        z: orientation.z,
        w: orientation.w
      } as any);

      // Update ray visualization
      if (controllerRayLine) {
        const positions = controllerRayLine.geometry.attributes.position as BufferAttribute;
        const rayEnd = rayOrigin.clone().add(rayDirection.clone().multiplyScalar(5));
        positions.setXYZ(0, rayOrigin.x, rayOrigin.y, rayOrigin.z);
        positions.setXYZ(1, rayEnd.x, rayEnd.y, rayEnd.z);
        positions.needsUpdate = true;
      }

      // Raycast against cards
      raycaster.set(rayOrigin, rayDirection);
      const cards = Array.from(profileCards.values());
      const intersects = raycaster.intersectObjects(cards, false);

      if (intersects.length > 0) {
        const newHovered = intersects[0].object as Mesh;
        if (newHovered !== vrHoveredCard) {
          highlightCard(vrHoveredCard, false);
          vrHoveredCard = newHovered;
          highlightCard(vrHoveredCard, true);
        }
      } else {
        if (vrHoveredCard) {
          highlightCard(vrHoveredCard, false);
          vrHoveredCard = null;
        }
      }

      // Check for select action (trigger/squeeze)
      const gamepad = source.gamepad;
      if (gamepad) {
        // Button 0 = trigger, Button 1 = squeeze
        const triggerPressed = gamepad.buttons[0]?.pressed;
        const squeezePressed = gamepad.buttons[1]?.pressed;
        
        // Select card if hovered
        if (vrHoveredCard) {
          const now = Date.now();
          if ((triggerPressed || squeezePressed) && now - lastSelectTime > 500) {
            lastSelectTime = now;
            selectCard(vrHoveredCard);
          }
        }

        // Thumbstick locomotion (left controller = move, right = rotate)
        // Axes: [0] = X (left/right), [1] = Y (forward/back)
        if (gamepad.axes.length >= 2) {
          const axisX = gamepad.axes[0];
          const axisY = gamepad.axes[1];
          const deadzone = 0.15;
          
          if (source.handedness === 'left') {
            // Left thumbstick = movement
            const camera = this.world.camera;
            if (camera && (Math.abs(axisX) > deadzone || Math.abs(axisY) > deadzone)) {
              const moveSpeed = 0.03;
              
              // Get camera forward/right vectors (ignore Y for ground movement)
              const forward = new Vector3(0, 0, -1);
              forward.applyQuaternion(camera.quaternion);
              forward.y = 0;
              forward.normalize();
              
              const right = new Vector3(1, 0, 0);
              right.applyQuaternion(camera.quaternion);
              right.y = 0;
              right.normalize();
              
              // Apply movement
              camera.position.addScaledVector(forward, -axisY * moveSpeed);
              camera.position.addScaledVector(right, axisX * moveSpeed);
            }
          } else if (source.handedness === 'right') {
            // Right thumbstick = carousel rotation
            if (Math.abs(axisX) > deadzone) {
              targetRotation += axisX * 0.02;
            }
          }
        }
      }

      // Process both controllers (don't break early)
    }
  }

  destroy() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
