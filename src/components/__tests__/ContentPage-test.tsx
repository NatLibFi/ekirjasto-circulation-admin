import { expect } from "chai";
import { ContentState, EditorState, Modifier } from "draft-js";
import * as React from "react";
import { mount } from "enzyme";

import { convertContentToHTML, convertHTMLToContent } from "../ContentPage";
import { insertLink, normalizeLinkUrl } from "../ContentEditor";
import ContentEditor from "../ContentEditor";

describe("content editor links", () => {
  it("offers disruption banners as an editable content type", () => {
    const editor = EditorState.createEmpty();
    const wrapper = mount(
      <ContentEditor
        item={{ type: "banner", language: "fi" }}
        introEditor={editor}
        contentEditor={editor}
        activeEditor="content"
        onChangeItem={() => undefined}
        onChangeActiveEditor={() => undefined}
        onChangeIntroEditor={() => undefined}
        onChangeContentEditor={() => undefined}
        onSave={() => undefined}
      />
    );

    expect(wrapper.find("label").first().text()).to.contain("Häiriöilmoitus");
    expect(wrapper.find(".editor-switcher-button")).to.have.length(0);
  });

  it("serializes a link inside its paragraph", () => {
    const editor = EditorState.createWithContent(
      ContentState.createFromText("Example")
    );
    let content = editor.getCurrentContent();
    const selection = editor.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 7,
      isBackward: false,
    });

    content = content.createEntity("LINK", "MUTABLE", {
      url: "https://example.com",
    });
    content = Modifier.applyEntity(
      content,
      selection,
      content.getLastCreatedEntityKey()
    );

    expect(convertContentToHTML(content)).to.equal(
      '<p><a href="https://example.com">Example</a></p>'
    );
  });

  it("serializes ordinary text as a paragraph", () => {
    expect(
      convertContentToHTML(ContentState.createFromText("Example"))
    ).to.equal("<p>Example</p>");
  });

  it("inserts and links supplied text when the selection is collapsed", () => {
    const editor = EditorState.createEmpty();
    const nextEditor = insertLink(
      editor,
      editor.getSelection(),
      "Example",
      "example.com"
    );

    expect(nextEditor).to.not.equal(undefined);
    expect(
      convertContentToHTML((nextEditor as EditorState).getCurrentContent())
    ).to.equal(
      '<p><strong><u><a href="https://example.com">Example</a></u></strong></p>'
    );
  });

  it("inserts link text from the link form at the current cursor", () => {
    let updatedEditor: EditorState | undefined;
    const editor = EditorState.createEmpty();
    const wrapper = mount(
      <ContentEditor
        item={{ type: "news", language: "fi" }}
        introEditor={editor}
        contentEditor={editor}
        activeEditor="content"
        onChangeItem={() => undefined}
        onChangeActiveEditor={() => undefined}
        onChangeIntroEditor={() => undefined}
        onChangeContentEditor={(nextEditor) => {
          updatedEditor = nextEditor;
        }}
        onSave={() => undefined}
      />
    );

    wrapper
      .find("button")
      .filterWhere((button) => button.text() === "Lisää linkki")
      .simulate("click");
    wrapper.find("#content-link-text").simulate("change", {
      target: { value: "Example" },
    });
    wrapper.find("#content-link-url").simulate("change", {
      target: { value: "example.com" },
    });
    wrapper.find("form.content-link-form").simulate("submit", {
      preventDefault: () => undefined,
    });

    expect(updatedEditor).to.not.equal(undefined);
    expect(
      convertContentToHTML((updatedEditor as EditorState).getCurrentContent())
    ).to.contain('<a href="https://example.com">');
  });

  it("provides intro and content tabs for news", () => {
    const editor = EditorState.createEmpty();
    const wrapper = mount(
      <ContentEditor
        item={{ type: "news", language: "fi" }}
        introEditor={editor}
        contentEditor={editor}
        activeEditor="content"
        onChangeItem={() => undefined}
        onChangeActiveEditor={() => undefined}
        onChangeIntroEditor={() => undefined}
        onChangeContentEditor={() => undefined}
        onSave={() => undefined}
      />
    );

    expect(wrapper.find(".editor-switcher-button")).to.have.length(2);
  });

  it("loads anchor HTML as a link entity", () => {
    const content = convertHTMLToContent(
      '<p><a href="https://example.com">Example</a></p>'
    );
    const block = content.getFirstBlock();
    const entityKey = block.getEntityAt(0);

    expect(entityKey).to.not.equal(null);
    expect(content.getEntity(entityKey as string).getData().url).to.equal(
      "https://example.com"
    );
  });

  it("normalizes safe URLs and rejects unsafe schemes", () => {
    expect(normalizeLinkUrl("example.com")).to.equal("https://example.com");
    expect(normalizeLinkUrl("mailto:test@example.com")).to.equal(
      "mailto:test@example.com"
    );
    expect(normalizeLinkUrl("javascript:alert(1)")).to.equal(undefined);
    expect(normalizeLinkUrl("data:text/html,unsafe")).to.equal(undefined);
    expect(normalizeLinkUrl("vbscript:unsafe")).to.equal(undefined);
  });
});
