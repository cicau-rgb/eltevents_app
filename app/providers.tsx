"use client";

import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@/src/themes/neutral/built/neutral";

// Client component: the theme holds functions (icon registry), which can't be
// passed from a server component. This is the pre-built theme (its CSS is
// imported in globals.css), so styles are present on first paint. After editing
// src/themes/neutral/neutralTheme.ts run `pnpm theme:build`.
export function Providers({ children }: { children: React.ReactNode }) {
  return <Theme theme={neutralTheme}>{children}</Theme>;
}
