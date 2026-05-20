import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

export interface CapacitorAppPlugin {
  addListener(
    eventName: "backButton",
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  minimizeApp(): Promise<void>;
}

/** Native App plugin (back button, minimize). Registered in Capacitor Android shell. */
export const CapacitorApp = registerPlugin<CapacitorAppPlugin>("App");
