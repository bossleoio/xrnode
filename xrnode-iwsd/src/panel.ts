import {
  createSystem,
  PanelUI,
  PanelDocument,
  eq,
  VisibilityState,
  UIKitDocument,
  UIKit,
  Entity,
  Object3D,
  Visibility,
} from "@iwsdk/core";

// Store panel entity reference globally
let panelEntityRef: Entity | null = null;

export class PanelSystem extends createSystem({
  welcomePanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, "config", "./ui/welcome.json")],
  },
}) {
  private panelEntity: Entity | null = null;

  init() {
    this.queries.welcomePanel.subscribe("qualify", (entity) => {
      this.panelEntity = entity;
      panelEntityRef = entity;
      
      console.log("Panel entity found:", entity);
      console.log("Panel entity index:", entity.index);
      
      const document = PanelDocument.data.document[
        entity.index
      ] as UIKitDocument;
      if (!document) {
        return;
      }

      const xrButton = document.getElementById("xr-button") as UIKit.Text;
      xrButton.addEventListener("click", () => {
        if (this.world.visibilityState.value === VisibilityState.NonImmersive) {
          this.world.launchXR();
        } else {
          this.world.exitXR();
        }
      });
      
      // Hide panel when entering XR mode
      this.world.visibilityState.subscribe((visibilityState) => {
        if (visibilityState === VisibilityState.NonImmersive) {
          xrButton.setProperties({ text: "Enter XR" });
          // Show panel in PC mode
          this.setPanelVisible(true);
        } else {
          xrButton.setProperties({ text: "Exit to Browser" });
          // Hide panel in XR mode
          setTimeout(() => this.setPanelVisible(false), 200);
        }
      });
    });
  }

  setPanelVisible(visible: boolean) {
    console.log(`Setting panel visible: ${visible}`);
    
    if (this.panelEntity) {
      // Try using the Visibility component
      try {
        const visData = Visibility.data.isVisible;
        if (visData && visData[this.panelEntity.index] !== undefined) {
          visData[this.panelEntity.index] = visible ? 1 : 0;
          console.log("Set Visibility component:", visible);
        }
      } catch (e) {
        console.log("Visibility component not available");
      }
      
      // Also set object3D visibility
      if (this.panelEntity.object3D) {
        this.panelEntity.object3D.visible = visible;
        this.panelEntity.object3D.traverse((child: Object3D) => {
          child.visible = visible;
        });
        console.log("Set object3D visible:", visible);
      }
    }
    
    // Also traverse scene for any panel-related objects
    this.world.scene.traverse((obj: Object3D) => {
      const name = obj.name?.toLowerCase() || "";
      if (name.includes("panel") || name.includes("welcome") || name.includes("uikit")) {
        obj.visible = visible;
      }
    });
  }
}
