import { ComboboxOnSelectItem, comboboxStore } from '@udecode/plate-combobox';
import { getBlockAbove, insertNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlatePluginKey,
  TElement,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_MENTION } from './defaults';
import { MentionNodeData } from './types';

export const getMentionOnSelectItem = ({
  pluginKey = ELEMENT_MENTION,
  insertSpaceAfterMention,
}: {
  insertSpaceAfterMention?: boolean;
} & PlatePluginKey): ComboboxOnSelectItem => (editor, item) => {
  const targetRange = comboboxStore.get.targetRange();
  if (!targetRange) return;

  const type = getPlatePluginType(editor, pluginKey || ELEMENT_MENTION);
  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd =
    editor.selection &&
    pathAbove &&
    Editor.isEnd(editor, editor.selection.anchor, pathAbove);

  // insert a space to fix the bug
  if (isBlockEnd) {
    Transforms.insertText(editor, ' ');
  }

  // select the text and insert the element
  Transforms.select(editor, targetRange);
  insertNodes<TElement<MentionNodeData>>(editor, {
    type,
    children: [{ text: '' }],
    value: item.text,
  });
  // move the selection after the element
  Transforms.move(editor);

  // delete the inserted space
  if (isBlockEnd && !insertSpaceAfterMention) {
    Transforms.delete(editor);
  }

  return comboboxStore.set.reset();
};