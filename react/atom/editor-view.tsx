import styles from './editor-view.module.scss';

interface Props {
  value: string;
  className?: string;
}

const EditorView = ({ value, className }: Props) => {
  return (
    <div
      className={`${styles.editorView} ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default EditorView;
