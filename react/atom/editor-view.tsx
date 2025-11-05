import styles from './editor-view.module.scss';

export interface EditorViewProps {
  value: string;
  className?: string;
}

const EditorView = ({ value, className }: EditorViewProps) => {
  return (
    <div
      className={`${styles.editorView} ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default EditorView;
