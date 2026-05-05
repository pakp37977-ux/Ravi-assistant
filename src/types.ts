export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  atmosphere: string;
  bgGlow: string;
}

export const THEMES: Theme[] = [
  {
    name: "Cyan",
    primary: "#00e5ff",
    secondary: "#0088ff",
    accent: "#00e5ff",
    glow: "rgba(0, 229, 255, 0.6)",
    atmosphere: "rgba(0, 136, 255, 0.2)",
    bgGlow: "rgba(0,136,255,0.2)"
  },
  {
    name: "Purple",
    primary: "#a855f7",
    secondary: "#7c3aed",
    accent: "#d946ef",
    glow: "rgba(168, 85, 247, 0.6)",
    atmosphere: "rgba(124, 58, 237, 0.2)",
    bgGlow: "rgba(124,58,237,0.2)"
  },
  {
    name: "Emerald",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    glow: "rgba(16, 185, 129, 0.6)",
    atmosphere: "rgba(5, 150, 105, 0.2)",
    bgGlow: "rgba(5, 150, 105, 0.2)"
  },
  {
    name: "Gold",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.6)",
    atmosphere: "rgba(217, 119, 6, 0.2)",
    bgGlow: "rgba(217,119,6,0.2)"
  },
  {
    name: "Rose",
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#fb7185",
    glow: "rgba(244, 63, 94, 0.6)",
    atmosphere: "rgba(225, 29, 72, 0.2)",
    bgGlow: "rgba(225, 29, 72, 0.2)"
  }
];
