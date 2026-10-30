import { expect } from "chai";
import { ContentState, EditorState, Modifier } from "draft-js";
import * as React from "react";
import { mount, shallow } from "enzyme";

import ContentPage, {
  convertContentToHTML,
  convertHTMLToContent,
} from "../ContentPage";
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

    expect(wrapper.find("label").first().text()).to.contain("Kieli");
    expect(wrapper.find(".editor-switcher-button")).to.have.length(0);
  });

  it("does not prevent spaces typed in the Draft.js editor", () => {
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
    const contentEditor = wrapper.find(".content-editor");
    const onKeyDown = contentEditor.prop("onKeyDown") as Function;
    let prevented = false;
    const editorTarget = {};
    const containerTarget = {};

    onKeyDown({
      key: " ",
      target: editorTarget,
      currentTarget: containerTarget,
      preventDefault: () => {
        prevented = true;
      },
    });

    expect(prevented).to.equal(false);
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

describe("ContentPage creation", () => {
  const params = { library: "library", type: "news" };

  const createPage = (pageParams: any = params) =>
    shallow(<ContentPage params={pageParams} />, {
      context: { csrfToken: "csrf-token" },
      disableLifecycleMethods: true,
    });

  it("initializes a new item with the selected content type", () => {
    const wrapper = createPage();
    const page = wrapper.instance() as ContentPage;

    page.newItem();

    expect(page.state.mode).to.equal("create");
    expect(page.state.creating).to.equal(true);
    expect(page.state.item).to.deep.include({
      type: "news",
      language: "fi",
      title: "",
      intro_html: "",
      body_html: "",
    });
  });

  it("prompts the user to view content when no type is selected", () => {
    const wrapper = createPage({ library: "library" });
    const rightPanel = wrapper.find(".content-management-layout > div");

    expect(rightPanel).to.have.length(1);
    expect(rightPanel.text()).to.equal(
      "Voit luoda ja tarkastella sisältöjä valitsemalla sisällön vasemmasta valikosta."
    );
  });

  it("identifies the content type and action outside the main content page", () => {
    const wrapper = createPage({
      library: "library",
      type: "faq",
      identifier: "group-1",
    });
    const page = wrapper.instance() as ContentPage;

    page.setState({ mode: "language-view", item: { type: "faq" } });
    expect(wrapper.find(".content-page-subheading").text()).to.equal(
      " Käyttöohje"
    );

    page.setState({ mode: "edit", item: { type: "banner" } });
    expect(wrapper.find(".content-page-subheading").text()).to.equal(
      "Muokkaa Häiriöilmoitus"
    );
  });

  it("uses the selected content type for the language table heading", () => {
    const wrapper = createPage({
      library: "library",
      type: "faq",
      identifier: "group-1",
    });
    const page = wrapper.instance() as ContentPage;

    page.setState({ mode: "view", item: { type: "news" } });

    expect(wrapper.find(".content-page-subheading").text()).to.equal(
      " Käyttöohje"
    );
  });

  it("initializes a new translation in the existing content group", () => {
    const wrapper = createPage({ ...params, identifier: "group-1" });
    const page = wrapper.instance() as ContentPage;
    page.setState({
      items: [
        {
          group_id: "group-1",
          type: "faq",
          title: "Ohje",
          languages: ["fi"],
          statuses: { fi: "published" },
          created_at: "2026-01-01",
        },
      ],
    });

    page.createLanguage("sv");

    expect(page.state.mode).to.equal("create");
    expect(page.state.creating).to.equal(true);
    expect(page.state.item).to.deep.include({
      type: "faq",
      language: "sv",
      group_id: "group-1",
    });
  });

  it("POSTs a new draft with serialized editor content", async () => {
    const wrapper = createPage();
    const page = wrapper.instance() as ContentPage;
    page.setState({
      creating: true,
      mode: "create",
      item: {
        type: "news",
        language: "fi",
        title: "New title",
        group_id: "group-1",
      },
      introEditor: EditorState.createWithContent(
        ContentState.createFromText("Intro")
      ),
      contentEditor: EditorState.createWithContent(
        ContentState.createFromText("Body")
      ),
    });

    const originalFetch = (global as any).fetch;
    const requests: Array<{ url: string; options: RequestInit }> = [];
    (global as any).fetch = async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      if (requests.length === 1) {
        return {
          ok: true,
          json: async () => ({
            id: "item-1",
            group_id: "group-1",
            type: "news",
            language: "fi",
            title: "New title",
            intro_html: "<p>Intro</p>",
            body_html: "<p>Body</p>",
            status: "draft",
          }),
        };
      }
      return { ok: true, json: async () => ({ content: [] }) };
    };

    try {
      await page.save("draft");
    } finally {
      (global as any).fetch = originalFetch;
    }

    expect(requests[0].url).to.equal("/library/admin/content");
    expect(requests[0].options.method).to.equal("POST");
    expect(requests[0].options.headers).to.deep.equal({
      "Content-Type": "application/json",
      "X-CSRF-Token": "csrf-token",
    });
    expect(JSON.parse(requests[0].options.body as string)).to.deep.include({
      type: "news",
      language: "fi",
      title: "New title",
      group_id: "group-1",
      intro_html: "<p>Intro</p>",
      body_html: "<p>Body</p>",
      status: "draft",
    });
  });
});
