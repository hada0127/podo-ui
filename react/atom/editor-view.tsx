import 'suneditor/dist/css/suneditor.min.css';
import styles from './editor-view.module.scss';

const EditorView = ({ content }: { content: string }) => {
  return (
    <div
      className={`${styles.context} sun-editor-editable`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default EditorView;
