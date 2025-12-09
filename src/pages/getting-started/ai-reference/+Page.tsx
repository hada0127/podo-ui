import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import styles from './Page.module.scss';

const BASE_URL = 'https://podoui.com';

export default function AiReference() {
  const { t } = useTranslation('aiReference');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('structure.title')}</h2>
        <CodeBlock
          language="bash"
          code={`public/
├── ai.json                    # ` + t('structure.mainIndex') + `
└── ai/
    ├── overview.json          # ` + t('structure.projectOverview') + `
    ├── components/            # ` + t('structure.components') + `
    │   ├── avatar.json
    │   ├── input.json
    │   ├── textarea.json
    │   └── ... (17 files)
    └── systems/               # ` + t('structure.systems') + `
        ├── color.json
        ├── typography.json
        ├── spacing.json
        └── ... (6 files)`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('mainIndex.title')}</h2>
        <p>{t('mainIndex.description')}</p>
        <CodeBlock
          title={`${BASE_URL}/ai.json`}
          language="json"
          code={`{
  "name": "podo-ui",
  "version": "1.0.0",
  "description": "Design system: SCSS 97% + React 3%",
  "philosophy": "Maximum flexibility with minimal JS dependency",
  "install": "npm install podo-ui",
  "modules": {
    "overview": "${BASE_URL}/ai/overview.json",
    "components": {
      "avatar": "${BASE_URL}/ai/components/avatar.json",
      "input": "${BASE_URL}/ai/components/input.json",
      ...
    },
    "systems": {
      "color": "${BASE_URL}/ai/systems/color.json",
      "typography": "${BASE_URL}/ai/systems/typography.json",
      ...
    }
  }
}`}
        />

        <div className={styles.fieldList}>
          <div className={styles.field}>
            <code>name</code>
            <span>{t('mainIndex.fields.name')}</span>
          </div>
          <div className={styles.field}>
            <code>version</code>
            <span>{t('mainIndex.fields.version')}</span>
          </div>
          <div className={styles.field}>
            <code>description</code>
            <span>{t('mainIndex.fields.description')}</span>
          </div>
          <div className={styles.field}>
            <code>philosophy</code>
            <span>{t('mainIndex.fields.philosophy')}</span>
          </div>
          <div className={styles.field}>
            <code>install</code>
            <span>{t('mainIndex.fields.install')}</span>
          </div>
          <div className={styles.field}>
            <code>modules</code>
            <span>{t('mainIndex.fields.modules')}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('componentFiles.title')}</h2>
        <p>{t('componentFiles.description')}</p>

        <CodeBlock
          title={`${BASE_URL}/ai/components/input.json`}
          language="json"
          code={`{
  "name": "Input",
  "category": "atom",
  "description": "Form input field with Zod validation support",
  "import": {
    "react": "import { Input } from 'podo-ui'",
    "scss": "@use 'podo-ui/scss/form/input'"
  },
  "props": [
    { "name": "value", "type": "string | number", "required": false },
    { "name": "validator", "type": "z.ZodType", "description": "Zod schema" },
    { "name": "withIcon", "type": "string", "description": "Left icon class" },
    ...
  ],
  "cssClasses": [
    { "class": "input", "description": "Base input style" },
    { "class": "fill", "description": "Filled background style" },
    ...
  ],
  "examples": [
    {
      "title": "Basic",
      "code": "<Input value={text} onChange={...} placeholder=\\"Enter text\\" />"
    },
    ...
  ],
  "related": ["textarea", "field", "select"]
}`}
        />

        <div className={styles.fieldList}>
          <div className={styles.field}>
            <code>name</code>
            <span>{t('componentFiles.fields.name')}</span>
          </div>
          <div className={styles.field}>
            <code>category</code>
            <span>{t('componentFiles.fields.category')}</span>
          </div>
          <div className={styles.field}>
            <code>import</code>
            <span>{t('componentFiles.fields.import')}</span>
          </div>
          <div className={styles.field}>
            <code>props</code>
            <span>{t('componentFiles.fields.props')}</span>
          </div>
          <div className={styles.field}>
            <code>cssClasses</code>
            <span>{t('componentFiles.fields.cssClasses')}</span>
          </div>
          <div className={styles.field}>
            <code>examples</code>
            <span>{t('componentFiles.fields.examples')}</span>
          </div>
          <div className={styles.field}>
            <code>related</code>
            <span>{t('componentFiles.fields.related')}</span>
          </div>
        </div>

        <p className={styles.componentList}>
          <strong>Components:</strong> {t('componentFiles.list')}
        </p>
      </section>

      <section className={styles.section}>
        <h2>{t('systemFiles.title')}</h2>
        <p>{t('systemFiles.description')}</p>

        <div className={styles.systemGrid}>
          <div className={styles.systemCard}>
            <h4>color.json</h4>
            <p>{t('systemFiles.items.color')}</p>
          </div>
          <div className={styles.systemCard}>
            <h4>typography.json</h4>
            <p>{t('systemFiles.items.typography')}</p>
          </div>
          <div className={styles.systemCard}>
            <h4>spacing.json</h4>
            <p>{t('systemFiles.items.spacing')}</p>
          </div>
          <div className={styles.systemCard}>
            <h4>grid.json</h4>
            <p>{t('systemFiles.items.grid')}</p>
          </div>
          <div className={styles.systemCard}>
            <h4>icon.json</h4>
            <p>{t('systemFiles.items.icon')}</p>
          </div>
          <div className={styles.systemCard}>
            <h4>button.json</h4>
            <p>{t('systemFiles.items.button')}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('usage.title')}</h2>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>{t('usage.step1.title')}</h4>
              <p>{t('usage.step1.description')}</p>
              <CodeBlock
                language="javascript"
                code={`fetch('${BASE_URL}/ai.json').then(r => r.json())`}
              />
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>{t('usage.step2.title')}</h4>
              <p>{t('usage.step2.description')}</p>
              <CodeBlock
                language="javascript"
                code={`fetch('${BASE_URL}/ai/components/input.json').then(r => r.json())`}
              />
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>{t('usage.step3.title')}</h4>
              <p>{t('usage.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('example.title')}</h2>

        <div className={styles.exampleBox}>
          <h4>{t('example.prompt')}</h4>
          <div className={styles.promptBox}>
            {t('example.promptText')}
          </div>

          <h4>{t('example.aiProcess')}</h4>
          <ol>
            <li>{t('example.process1')}</li>
            <li>{t('example.process2')}</li>
            <li>{t('example.process3')}</li>
          </ol>

          <CodeBlock
            title="Result"
            language="tsx"
            code={`import { Input } from 'podo-ui';
import { z } from 'zod';

<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  validator={z.string().email()}
  placeholder="Enter your email"
  withIcon="icon-mail"
/>`}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('benefits.title')}</h2>

        <div className={styles.benefitGrid}>
          <div className={styles.benefitCard}>
            <h4>{t('benefits.items.selective').split(' - ')[0]}</h4>
            <p>{t('benefits.items.selective').split(' - ')[1]}</p>
          </div>
          <div className={styles.benefitCard}>
            <h4>{t('benefits.items.structured').split(' - ')[0]}</h4>
            <p>{t('benefits.items.structured').split(' - ')[1]}</p>
          </div>
          <div className={styles.benefitCard}>
            <h4>{t('benefits.items.comprehensive').split(' - ')[0]}</h4>
            <p>{t('benefits.items.comprehensive').split(' - ')[1]}</p>
          </div>
          <div className={styles.benefitCard}>
            <h4>{t('benefits.items.upToDate').split(' - ')[0]}</h4>
            <p>{t('benefits.items.upToDate').split(' - ')[1]}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('accessUrls.title')}</h2>
        <p>{t('accessUrls.description')}</p>

        <div className={styles.urlList}>
          <a href={`${BASE_URL}/ai.json`} target="_blank" rel="noopener noreferrer">
            <code>{BASE_URL}/ai.json</code>
            <span>Main Index</span>
            <i className="icon-external-link"></i>
          </a>
          <a href={`${BASE_URL}/ai/overview.json`} target="_blank" rel="noopener noreferrer">
            <code>{BASE_URL}/ai/overview.json</code>
            <span>Project Overview</span>
            <i className="icon-external-link"></i>
          </a>
          <a href={`${BASE_URL}/ai/components/input.json`} target="_blank" rel="noopener noreferrer">
            <code>{BASE_URL}/ai/components/input.json</code>
            <span>Input Component</span>
            <i className="icon-external-link"></i>
          </a>
          <a href={`${BASE_URL}/ai/systems/color.json`} target="_blank" rel="noopener noreferrer">
            <code>{BASE_URL}/ai/systems/color.json</code>
            <span>Color System</span>
            <i className="icon-external-link"></i>
          </a>
        </div>
      </section>
    </>
  );
}
