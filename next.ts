'use client';
import dynamic from 'next/dynamic';

import Input from './react/atom/input';
import Textarea from './react/atom/textarea';
import EditorView from './react/atom/editor-view';
import Field from './react/molecule/field';
const Editor = dynamic(() => import('./react/atom/editor'), { ssr: false });

const Form = {
  Input,
  Textarea,
  Editor,
  EditorView,
  Field,
};

export default Form;

export { Input, Textarea, Editor, EditorView, Field };
