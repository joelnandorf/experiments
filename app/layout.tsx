import type { Metadata } from "next";
import "./globals.css";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { THEME_STORAGE_KEY, THEMES } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Experiment",
  description: "En samling snabba webbprototyper.",
};

// Sätter rätt tema-klass på <html> innan React hydrerar, så sidan inte blixtrar till fel
// tema vid laddning (samma teknik som next-themes använder, utan att dra in beroendet).
const setThemeBeforeHydration = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var themes = ${JSON.stringify(THEMES)};
    var theme = themes.find(function (t) { return t.value === stored; });
    if (theme && theme.className) document.documentElement.classList.add(theme.className);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setThemeBeforeHydration }} />
      </head>
      <body className="antialiased">
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}
