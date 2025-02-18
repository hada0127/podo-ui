import 'suneditor/dist/css/suneditor.min.css';

const EditorView = ({ content }: { content: string }) => {
  return (
    <div
      className="context sun-editor-editable"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default EditorView;
