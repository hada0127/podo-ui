import { podoWebComponentCss, registerPodoElements } from "@podo/web";

const iconFontCss = `@font-face {
  font-family: "PodoIcons";
  src: url("./assets/PodoIcons.woff2") format("woff2"), url("./assets/PodoIcons.woff") format("woff");
  font-display: block;
}

.podo-icon {
  font-family: "PodoIcons";
  speak: never;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
}

.podo-icon-menu::before {
  content: "\\E003";
}`;

const exampleCss = `${podoWebComponentCss}

:root {
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

[data-podo-theme="landing"][data-color-scheme="light"] {
  --podo-component-button-background: #305cde;
  --podo-component-button-text: #ffffff;
  --podo-component-input-background: #ffffff;
  --podo-component-input-border: #9aa8bd;
  --podo-semantic-color-text-default: #111827;
  --podo-semantic-color-text-danger: #c0262d;
  --podo-typography-h1-fontSize: 48px;
  --podo-typography-body-fontSize: 18px;
}

[data-podo-theme="landing"][data-color-scheme="dark"] {
  --podo-component-button-background: #9db7ff;
  --podo-component-button-text: #101828;
  --podo-component-input-background: #101828;
  --podo-component-input-border: #61708a;
  --podo-semantic-color-text-default: #f8fafc;
  --podo-semantic-color-text-danger: #ff9a9f;
  --podo-typography-h1-fontSize: 48px;
  --podo-typography-body-fontSize: 18px;
}

body {
  margin: 0;
  background: var(--podo-component-input-background);
  color: var(--podo-semantic-color-text-default);
}

.example-shell {
  display: grid;
  gap: 20px;
  max-width: 720px;
  padding: 40px;
}

.example-actions {
  display: flex;
  gap: 8px;
}`;

export function mountWebExample(root: HTMLElement): void {
  registerPodoElements();
  root.innerHTML = `
    <style>${iconFontCss}${exampleCss}</style>
    <section class="example-shell">
      <podo-text as="h1">Podo Web Components</podo-text>
      <podo-text>
        Custom Elements, icon font classes, and data-attribute theme switching in one page.
      </podo-text>
      <podo-field field-id="email">
        <span slot="label">Work email</span>
        <podo-input placeholder="team@podo.dev" required></podo-input>
        <span slot="description">The field wires label and description ids into the control.</span>
      </podo-field>
      <div class="example-actions">
        <podo-button variant="solid">
          <span class="podo-icon podo-icon-menu" slot="leftIcon" aria-hidden="true"></span>
          Save
        </podo-button>
        <button id="toggle-theme" type="button">Toggle dark mode</button>
      </div>
    </section>
  `;
  root.querySelector("#toggle-theme")?.addEventListener("click", () => {
    const current = document.documentElement.dataset.colorScheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.podoTheme = "landing";
    document.documentElement.dataset.colorScheme = current === "dark" ? "light" : "dark";
  });
}

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  mountWebExample(root);
}
