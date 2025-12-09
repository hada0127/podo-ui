import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';

// Supported languages
const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  'tsx',
  'typescript',
  'javascript',
  'jsx',
  'html',
  'css',
  'scss',
  'json',
  'bash',
];

// Dual theme configuration
const THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

// Singleton highlighter promise
let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang = 'tsx'): Promise<string> {
  const highlighter = await getHighlighter();

  // Fallback to tsx if language is not supported
  const language = SUPPORTED_LANGUAGES.includes(lang as BundledLanguage) ? lang : 'tsx';

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: THEMES,
    defaultColor: false, // Use CSS variables for theme switching
  });
}

export { THEMES, SUPPORTED_LANGUAGES };
