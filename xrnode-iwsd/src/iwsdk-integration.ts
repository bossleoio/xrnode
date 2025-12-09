/**
 * IWSDK Integration Module
 * Initializes IWSDK world only when entering XR mode
 */

import {
  AssetManifest,
  AssetType,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SessionMode,
  SRGBColorSpace,
  AssetManager,
  World,
} from "@iwsdk/core";

import { QRScannerSystem, onScanComplete } from "./qrScanner.js";
import { HandshakeSystem, setPendingConnection, onConnectionConfirmed } from "./handshake.js";

let worldInstance: any = null;

const assets: AssetManifest = {
  chimeSound: {
    url: "./audio/chime.mp3",
    type: AssetType.Audio,
    priority: "background",
  },
  webxr: {
    url: "./textures/webxr.png",
    type: AssetType.Texture,
    priority: "critical",
  },
};

export async function initializeIWSdk(container: HTMLElement): Promise<void> {
  if (worldInstance) {
    console.log('IWSDK already initialized');
    return;
  }

  try {
    const world = await World.create(container, {
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
    });

    worldInstance = world;
    const { camera } = world;
    camera.position.set(0, 1, 0.5);

    // Add WebXR logo
    const webxrLogoTexture = AssetManager.getTexture("webxr")!;
    webxrLogoTexture.colorSpace = SRGBColorSpace;
    const logoBanner = new Mesh(
      new PlaneGeometry(3.39, 0.96),
      new MeshBasicMaterial({
        map: webxrLogoTexture,
        transparent: true,
      }),
    );
    world.createTransformEntity(logoBanner);
    logoBanner.position.set(0, 1, 1.8);
    logoBanner.rotateY(Math.PI);

    // Register systems
    world.registerSystem(QRScannerSystem)
         .registerSystem(HandshakeSystem);

    // Connect QR scan to handshake flow
    onScanComplete((profile, matchResult) => {
      setPendingConnection(profile, matchResult);
    });

    // Handle confirmed connections
    onConnectionConfirmed((connection) => {
      console.log(`🤝 Connected with ${connection.profile.name} (${connection.matchScore}% match)`);
    });

    console.log('✅ IWSDK XR environment initialized');
  } catch (error) {
    console.error('Failed to initialize IWSDK:', error);
    throw error;
  }
}

export function destroyIWSdk(): void {
  if (worldInstance) {
    // Clean up IWSDK resources
    worldInstance = null;
    console.log('IWSDK cleaned up');
  }
}

export function getWorld(): any {
  return worldInstance;
}
