import * as React from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  SelectionState,
} from "draft-js";
import { Button } from "library-simplified-reusable-components";

import { ContentItem } from "./ContentPage";

export function normalizeLinkUrl(url: string): string | undefined {
  const trimmedUrl = url.trim();

  if (!trimmedUrl || /^(javascript|data|vbscript):/i.test(trimmedUrl)) {
    return undefined;
  }

  return /^(https?:\/\/|mailto:|\/|#)/i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;
}

export function insertLink(
  editor: EditorState,
  selection: SelectionState,
  text: string,
  url: string
): EditorState | undefined {
  const linkText = text.trim();
  const safeUrl = normalizeLinkUrl(url);
  if (!linkText || !safeUrl) return undefined;

  let content = editor.getCurrentContent();
  let linkSelection = selection;
  const linkStart = selection.getStartOffset();

  if (selection.isCollapsed()) {
    content = Modifier.insertText(
      content,
      selection,
      linkText,
      editor.getCurrentInlineStyle()
    );
    linkSelection = content.getSelectionAfter().merge({
      anchorOffset: linkStart,
      focusOffset: linkStart + linkText.length,
      isBackward: false,
    });
  } else if (
    linkText !==
    content
      .getBlockForKey(selection.getStartKey())
      .getText()
      .slice(selection.getStartOffset(), selection.getEndOffset())
  ) {
    content = Modifier.replaceText(
      content,
      selection,
      linkText,
      editor.getCurrentInlineStyle()
    );
    linkSelection = content.getSelectionAfter().merge({
      anchorOffset: linkStart,
      focusOffset: linkStart + linkText.length,
      isBackward: false,
    });
  }

  content = Modifier.applyInlineStyle(content, linkSelection, "BOLD");
  content = Modifier.applyInlineStyle(content, linkSelection, "UNDERLINE");
  content = content.createEntity("LINK", "MUTABLE", { url: safeUrl });
  content = Modifier.applyEntity(
    content,
    linkSelection,
    content.getLastCreatedEntityKey()
  );

  return EditorState.forceSelection(
    EditorState.push(editor, content, "apply-entity"),
    linkSelection
  );
}

interface ContentEditorProps {
  item: Partial<ContentItem>;
  introEditor: EditorState;
  contentEditor: EditorState;
  activeEditor: "intro" | "content";
  onChangeItem: (item: Partial<ContentItem>) => void;
  onChangeActiveEditor: (editor: "intro" | "content") => void;
  onChangeIntroEditor: (editor: EditorState) => void;
  onChangeContentEditor: (editor: EditorState) => void;
  onSave: (status: "draft" | "published") => void;
}

export default function ContentEditor({
  item,
  introEditor,
  contentEditor,
  activeEditor,
  onChangeItem,
  onChangeActiveEditor,
  onChangeIntroEditor,
  onChangeContentEditor,
  onSave,
}: ContentEditorProps) {
  const editorRef = React.useRef<Editor>(null);
  const [linkFormOpen, setLinkFormOpen] = React.useState(false);
  const [linkText, setLinkText] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkError, setLinkError] = React.useState("");
  const linkSelectionRef = React.useRef<SelectionState | null>(null);
  const editor = activeEditor === "intro" ? introEditor : contentEditor;
  const onChangeEditor =
    activeEditor === "intro" ? onChangeIntroEditor : onChangeContentEditor;
  const updateItem = (changes: Partial<ContentItem>) =>
    onChangeItem({ ...item, ...changes });
  const focusEditor = () => editorRef.current && editorRef.current.focus();
  const toggleInline = (style: string) =>
    onChangeEditor(RichUtils.toggleInlineStyle(editor, style));
  const changeBlock = (blockType: string) =>
    onChangeEditor(RichUtils.toggleBlockType(editor, blockType));
  const openLinkForm = () => {
    const selection = editor.getSelection();
    linkSelectionRef.current = selection;
    const selectedText = editor
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getText()
      .slice(selection.getStartOffset(), selection.getEndOffset());
    setLinkText(selectedText);
    setLinkUrl("");
    setLinkError("");
    setLinkFormOpen(true);
  };
  const closeLinkForm = () => {
    setLinkFormOpen(false);
    setLinkError("");
    focusEditor();
  };
  const addLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = linkText.trim();
    const url = linkUrl.trim();

    if (!text) {
      setLinkError("Enter the text to display for the link.");
      return;
    }
    if (!url) {
      setLinkError("Enter a URL for the link.");
      return;
    }

    if (!normalizeLinkUrl(url)) {
      setLinkError("Enter a valid web address.");
      return;
    }

    const selection = linkSelectionRef.current || editor.getSelection();
    const nextEditor = insertLink(editor, selection, text, url);
    if (!nextEditor) return;
    onChangeEditor(nextEditor);
    linkSelectionRef.current = null;
    setLinkFormOpen(false);
    setLinkText("");
    setLinkUrl("");
    setLinkError("");
  };

  return (
    <section className="content-editor-form">
      <label>
        Kieli{" "}
        <select
          value={item.language || ""}
          onChange={(event) => updateItem({ language: event.target.value })}
        >
          <option value="fi">Suomi</option>
          <option value="sv">Svenska</option>
          <option value="en">English</option>
        </select>
      </label>
      <label>
        Otsikko{" "}
        <input
          className="content-title-input"
          value={item.title || ""}
          onChange={(event) => updateItem({ title: event.target.value })}
        />
      </label>
      <div
        className={`editor-group ${
          item.type !== "banner" ? "has-switcher" : ""
        }`}
      >
        {item.type !== "banner" && (
          <div className="editor-toolbar editor-switcher" aria-label="Editor">
            <button
              className="btn btn-default editor-switcher-button"
              type="button"
              aria-pressed={activeEditor === "intro"}
              onClick={() => onChangeActiveEditor("intro")}
            >
              Esittelyteksti
            </button>
            <button
              className="btn btn-default editor-switcher-button"
              type="button"
              aria-pressed={activeEditor === "content"}
              onClick={() => onChangeActiveEditor("content")}
            >
              Sisältö
            </button>
          </div>
        )}
        <div className="editor-panel">
          <div className="editor-toolbar" aria-label="Text formatting">
            <button
              className="btn btn-default"
              type="button"
              onClick={() => toggleInline("BOLD")}
            >
              Lihavoitu
            </button>
            <button
              className="btn btn-default"
              type="button"
              onClick={() => toggleInline("ITALIC")}
            >
              Kursivoitu
            </button>
            <button
              className="btn btn-default"
              type="button"
              onClick={() => changeBlock("header-one")}
            >
              Otsikkotaso 1
            </button>

            <button
              className="btn btn-default"
              type="button"
              onClick={() => changeBlock("header-two")}
            >
              Otsikkotaso 2
            </button>
            <button
              className="btn btn-default"
              type="button"
              onClick={() => changeBlock("header-three")}
            >
              Otsikkotaso 3
            </button>
            <button
              className="btn btn-default"
              type="button"
              onClick={() => changeBlock("unordered-list-item")}
            >
              Lista
            </button>
            <button
              className="btn btn-default"
              type="button"
              onClick={() => changeBlock("ordered-list-item")}
            >
              Numeroitu lista
            </button>

            <button
              className="btn btn-default"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={openLinkForm}
            >
              Lisää linkki
            </button>
          </div>
          {linkFormOpen && (
            <form className="content-link-form" onSubmit={addLink}>
              <label htmlFor="content-link-text">Linkkiteksti</label>
              <input
                id="content-link-text"
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
              />
              <label htmlFor="content-link-url">URL-osoite</label>
              <input
                id="content-link-url"
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
              />
              {linkError && (
                <p className="content-link-error" role="alert">
                  {linkError}
                </p>
              )}
              <button className="btn btn-primary" type="submit">
                Lisää linkki
              </button>
              <button
                className="btn btn-default"
                type="button"
                onClick={closeLinkForm}
              >
                Peruuta
              </button>
            </form>
          )}
          <label htmlFor="editorial-content-body">
            Muokkaat nyt:{" "}
            <strong>
              {activeEditor === "intro" ? "Esittelyteksti" : "Sisältö"}
            </strong>
          </label>
          <div
            id="editorial-content-body"
            className="editor content-editor"
            role="textbox"
            aria-label="Sisältö"
            tabIndex={0}
            onClick={focusEditor}
            onKeyDown={(event) => {
              // Do not intercept keys bubbling from Draft.js's contenteditable.
              // In particular, preventing Space here stops Draft.js from
              // inserting spaces into the editor.
              if (
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                focusEditor();
              }
            }}
          >
            <Editor
              ref={editorRef}
              editorState={editor}
              onChange={onChangeEditor}
              ariaLabel="Sisältö"
            />
          </div>
        </div>
      </div>
      <Button callback={() => onSave("draft")} content="Tallenna luonnos" />
      <Button callback={() => onSave("published")} content="Julkaise" />
    </section>
  );
}
