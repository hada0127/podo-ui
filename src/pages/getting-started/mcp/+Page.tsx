import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import styles from './Page.module.scss';

export default function McpServer() {
  const { t } = useTranslation('mcp');

  const tools = [
    { name: 'get_overview', description: t('tools.getOverview') },
    { name: 'search_component', description: t('tools.searchComponent') },
    { name: 'get_component', description: t('tools.getComponent') },
    { name: 'get_system', description: t('tools.getSystem') },
    { name: 'search_css_class', description: t('tools.searchCssClass') },
    { name: 'get_example', description: t('tools.getExample') },
  ];

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('setup.title')}</h2>
        <p>{t('setup.description')}</p>

        <h3>Claude Code</h3>
        <CodeBlock
          language="bash"
          code={`claude mcp add podo-ui -- node /path/to/podo-ui/mcp/dist/index.js`}
        />

        <h3>Cursor</h3>
        <CodeBlock
          title=".cursor/mcp.json"
          language="json"
          code={`{
  "mcpServers": {
    "podo-ui": {
      "command": "node",
      "args": ["/path/to/podo-ui/mcp/dist/index.js"]
    }
  }
}`}
        />

        <h3>Windsurf</h3>
        <CodeBlock
          title="~/.codeium/windsurf/mcp_config.json"
          language="json"
          code={`{
  "mcpServers": {
    "podo-ui": {
      "command": "node",
      "args": ["/path/to/podo-ui/mcp/dist/index.js"]
    }
  }
}`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.note.title')}</strong> {t('setup.note.content')}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('toolList.title')}</h2>
        <p>{t('toolList.description')}</p>

        <div className={styles.toolGrid}>
          {tools.map((tool) => (
            <div key={tool.name} className={styles.toolCard}>
              <code>{tool.name}</code>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('example.title')}</h2>
        <p>{t('example.description')}</p>

        <div className={styles.promptBox}>
          <div className={styles.promptLabel}>{t('example.promptLabel')}</div>
          <p>{t('example.prompt1')}</p>
        </div>

        <div className={styles.promptBox}>
          <div className={styles.promptLabel}>{t('example.promptLabel')}</div>
          <p>{t('example.prompt2')}</p>
        </div>

        <div className={styles.promptBox}>
          <div className={styles.promptLabel}>{t('example.promptLabel')}</div>
          <p>{t('example.prompt3')}</p>
        </div>
      </section>
    </>
  );
}
