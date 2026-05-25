export interface Theme {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  borderColor: string;
  inputBackground: string;
  fontFamily: string;
  emoji: string;
}

export const BUILT_IN_THEMES: Record<string, Theme> = {
  dexter: {
    id: "dexter",
    name: "Dexter's Lab",
    description: "90s cartoon genius scientist",
    category: "Cartoon",
    primaryColor: "#cc0000",
    backgroundColor: "#e8f0fe",
    cardColor: "#ffffff",
    textColor: "#1a1a2e",
    mutedTextColor: "#5c5c8a",
    accentColor: "#cc0000",
    borderColor: "#b0c4f8",
    inputBackground: "#f0f4ff",
    fontFamily: '"Courier New", monospace',
    emoji: "🧪",
  },
};

export function getTheme(id: string): Theme {
  return BUILT_IN_THEMES[id] ?? BUILT_IN_THEMES["dexter"]!;
}

export function getThemeList(): Theme[] {
  return Object.values(BUILT_IN_THEMES);
}
