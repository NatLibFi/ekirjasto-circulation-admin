import * as React from "react";
import { EditorState } from "draft-js";
import { convertFromHTML, convertToHTML } from "draft-convert";
import * as PropTypes from "prop-types";
import { browserHistory } from "react-router";
import { Button } from "library-simplified-reusable-components";

import Header from "./Header";
import Footer from "./Footer";
import ContentTable from "./ContentTable";
import ContentDetails from "./ContentDetails";
import ContentEditor from "./ContentEditor";

export type ContentType = "news" | "faq" | "banner";

export const convertContentToHTML = convertToHTML({
  entityToHTML: (entity, originalText) => {
    if (entity.type === "LINK") {
      return React.createElement("a", { href: entity.data.url }, originalText);
    }
    return originalText;
  },
});

export const convertHTMLToContent = convertFromHTML({
  htmlToEntity: (nodeName, node, createEntity) => {
    if (nodeName !== "a") return undefined;
    const url = (node as HTMLElement).getAttribute("href") || "";
    if (/^(javascript|data|vbscript):/i.test(url)) return undefined;
    return createEntity("LINK", "MUTABLE", { url });
  },
});

export interface ContentItem {
  id: string;
  group_id: string;
  library?: string;
  type: ContentType;
  language: string;
  title: string;
  intro_html: string;
  body_html: string;
  status: "draft" | "published" | "hide";
  slug: string;
  published_at?: string;
  hidden_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentGroup {
  group_id: string;
  type: ContentType;
  title: string;
  languages: string[];
  statuses: { [language: string]: ContentItem["status"] };
  created_at: string;
}

interface ContentPageProps {
  params: {
    library: string;
    type?: string;
    identifier?: string;
    itemId?: string;
    action?: "view" | "edit";
  };
}

interface ContentPageContext {
  csrfToken: string;
}

interface ContentPageState {
  items: ContentGroup[];
  languages: Array<
    Partial<ContentItem> & {
      language: string;
      available: boolean;
      action: string;
    }
  >;
  item: Partial<ContentItem>;
  introEditor: EditorState;
  contentEditor: EditorState;
  activeEditor: "intro" | "content";
  loading: boolean;
  creating: boolean;
  mode: "none" | "view" | "language-view" | "edit" | "create";
  error?: string;
}

const newContentItem = (type: ContentType = "news"): Partial<ContentItem> => ({
  type,
  language: "fi",
  title: "",
  intro_html: "",
  body_html: "",
});

export default class ContentPage extends React.Component<
  ContentPageProps,
  ContentPageState
> {
  context: ContentPageContext;
  static contextTypes = { csrfToken: PropTypes.string.isRequired };

  constructor(props: ContentPageProps) {
    super(props);
    this.state = {
      items: [],
      languages: [],
      item: newContentItem((props.params.type as ContentType) || "news"),
      introEditor: EditorState.createEmpty(),
      contentEditor: EditorState.createEmpty(),
      activeEditor: "content",
      loading: false,
      creating: false,
      mode: "none",
    };
  }

  componentDidMount() {
    this.load();
  }

  async load() {
    this.setState({ loading: true });
    const response = await fetch(
      `/${this.props.params.library}/admin/content`,
      { credentials: "same-origin" }
    );
    const data = await response.json();
    const items = data.content || [];
    this.setState({ items, loading: false });

    if (this.props.params.identifier) {
      const languages = await this.loadGroup(this.props.params.identifier);
      if (this.props.params.itemId) {
        const item = languages.find(
          (language) => language.id === this.props.params.itemId
        );
        if (item) {
          this.openItem(
            item as ContentItem,
            this.props.params.action || "view",
            false
          );
        }
      }
    }
  }

  async loadGroup(groupId: string) {
    const response = await fetch(
      `/${this.props.params.library}/admin/content/${groupId}`,
      { credentials: "same-origin" }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const languages = data.languages || [];
    this.setState({ languages, mode: "view" });
    return languages;
  }

  edit = (item: ContentItem) => {
    this.openItem(item, "edit");
  };

  openItem = (item: ContentItem, action: "view" | "edit", updateUrl = true) => {
    if (updateUrl) {
      browserHistory.push(
        `/admin/web/content/${this.props.params.library}/${item.type}/${item.group_id}/${item.id}/${action}`
      );
    }
    this.setState({
      creating: false,
      mode: action === "edit" ? "edit" : "language-view",
      item,
      introEditor: EditorState.createWithContent(
        convertHTMLToContent(item.intro_html || "<p></p>")
      ),
      contentEditor: EditorState.createWithContent(
        convertHTMLToContent(item.body_html || "<p></p>")
      ),
      activeEditor: "content",
    });
  };

  newItem = () =>
    this.setState({
      creating: true,
      mode: "create",
      item: newContentItem((this.props.params.type as ContentType) || "news"),
      introEditor: EditorState.createEmpty(),
      contentEditor: EditorState.createEmpty(),
      activeEditor: "content",
      error: undefined,
    });

  view = (item: ContentGroup) => {
    const groupId = item.group_id;
    browserHistory.push(
      `/admin/web/content/${this.props.params.library}/${item.type}/${groupId}`
    );
    this.setState({ creating: false, mode: "view", error: undefined });
    this.loadGroup(groupId);
  };

  showTable = () => {
    browserHistory.push(`/admin/web/content/${this.props.params.library}`);
    this.setState({
      mode: "none",
      creating: false,
      languages: [],
      error: undefined,
    });
  };

  showGroup = () => {
    if (!this.props.params.identifier || !this.props.params.type) {
      this.showTable();
      return;
    }
    browserHistory.push(
      `/admin/web/content/${this.props.params.library}/${this.props.params.type}/${this.props.params.identifier}`
    );
    this.setState({ mode: "view", creating: false, error: undefined });
  };

  viewLanguage = (item: ContentItem) => {
    this.openItem(item, "view");
  };

  save = async (status: "draft" | "published") => {
    const { item, introEditor, contentEditor } = this.state;
    const intro_html = convertContentToHTML(introEditor.getCurrentContent());
    const body_html = convertContentToHTML(contentEditor.getCurrentContent());
    const payload = {
      ...item,
      intro_html,
      body_html,
      status,
      group_id: item.group_id || this.props.params.identifier,
    };
    const updating = Boolean(item.id) && !this.state.creating;
    const method = updating ? "PUT" : "POST";
    const url = updating
      ? `/${this.props.params.library}/admin/content/${item.id}`
      : `/${this.props.params.library}/admin/content`;
    const response = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.context.csrfToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      this.setState({ error: error.detail || "Could not save content." });
      return;
    }

    const saved = await response.json();
    this.setState({
      creating: false,
      mode: "view",
      item: saved,
      error: undefined,
    });
    browserHistory.push(
      `/admin/web/content/${this.props.params.library}/${saved.type}/${saved.group_id}`
    );
    await this.load();
    await this.loadGroup(saved.group_id);
  };

  changeStatus = async (item: ContentItem, status: "published" | "hide") => {
    const response = await fetch(
      `/${this.props.params.library}/admin/content/${item.id}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.context.csrfToken,
        },
        body: JSON.stringify({ ...item, status }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      this.setState({ error: error.detail || "Could not update content." });
      return;
    }

    this.setState({
      mode: "view",
      item: await response.json(),
      error: undefined,
    });
    await this.load();
  };

  deleteItem = async (item: ContentItem) => {
    if (!window.confirm(`Delete ${item.title}?`)) return;
    await fetch(`/${this.props.params.library}/admin/content/${item.id}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": this.context.csrfToken },
    });
    this.setState({ mode: "none", creating: false });
    await this.load();
  };

  createLanguage = (language: string) => {
    const group = this.state.items.find(
      (item) => item.group_id === this.props.params.identifier
    );
    this.setState({
      creating: true,
      mode: "create",
      item: {
        ...newContentItem(
          group?.type || (this.props.params.type as ContentType) || "news"
        ),
        language,
        group_id: this.props.params.identifier,
      },
      languages: this.state.languages,
    });
  };

  selectType = (type?: ContentType) => {
    browserHistory.push(
      type
        ? `/admin/web/content/${this.props.params.library}/${type}`
        : `/admin/web/content/${this.props.params.library}`
    );
    this.setState({ mode: "none", creating: false });
  };

  render() {
    const {
      item,
      introEditor,
      contentEditor,
      activeEditor,
      mode,
      items,
      languages,
      error,
    } = this.state;
    const editing = mode === "edit" || mode === "create";
    const visibleItems = this.props.params.type
      ? items.filter((item) => item.type === this.props.params.type)
      : items;

    return (
      <div className="content-page">
        <Header />
        <main className="container-fluid content-page-main">
          <h1>Sisällönhallinta</h1>
          {error && <p role="alert">{error}</p>}
          {mode === "none" && (
            <section className="content-page-section">
              <div className="content-management-layout">
                <aside className="content-type-panel">
                  <button
                    type="button"
                    className={
                      this.props.params.type === "news" ? "active" : ""
                    }
                    onClick={() => this.selectType("news")}
                  >
                    Uutiset
                  </button>
                  <button
                    type="button"
                    className={this.props.params.type === "faq" ? "active" : ""}
                    onClick={() => this.selectType("faq")}
                  >
                    Käyttöohjeet
                  </button>
                  <button
                    type="button"
                    className={
                      this.props.params.type === "banner" ? "active" : ""
                    }
                    onClick={() => this.selectType("banner")}
                  >
                    Häiriöilmoitus
                  </button>
                </aside>
                {this.props.params.type && (
                  <div>
                    <Button callback={this.newItem} content="Luo uusi" />
                    <ContentTable items={visibleItems} onView={this.view} />
                  </div>
                )}
              </div>
            </section>
          )}
          {mode === "view" && (
            <ContentDetails
              groupId={this.props.params.identifier}
              languages={languages}
              onBack={this.showTable}
              onView={this.viewLanguage}
              onEdit={this.edit}
              onChangeStatus={this.changeStatus}
              onDelete={this.deleteItem}
              onCreate={this.createLanguage}
            />
          )}
          {mode === "language-view" && (
            <section className="content-details">
              <button
                className="btn btn-default"
                type="button"
                onClick={this.showGroup}
              >
                Takaisin
              </button>
              <Button
                callback={() => this.edit(item as ContentItem)}
                content="Muokkaa"
              />
              <h1>{item.title}</h1>
              <p>
                {item.language} · {item.status}
              </p>
              {item.intro_html && (
                <div dangerouslySetInnerHTML={{ __html: item.intro_html }} />
              )}
              <div dangerouslySetInnerHTML={{ __html: item.body_html || "" }} />
            </section>
          )}
          {editing && (
            <section className="content-editor-page">
              <div className="content-details-header">
                <button
                  className="btn btn-default"
                  type="button"
                  onClick={this.showGroup}
                >
                  Takaisin
                </button>
              </div>
              <ContentEditor
                item={item}
                introEditor={introEditor}
                contentEditor={contentEditor}
                activeEditor={activeEditor}
                onChangeItem={(updatedItem) =>
                  this.setState({ item: updatedItem })
                }
                onChangeActiveEditor={(updatedEditor) =>
                  this.setState({ activeEditor: updatedEditor })
                }
                onChangeIntroEditor={(updatedEditor) =>
                  this.setState({ introEditor: updatedEditor })
                }
                onChangeContentEditor={(updatedEditor) =>
                  this.setState({ contentEditor: updatedEditor })
                }
                onSave={this.save}
              />
            </section>
          )}
        </main>
        <Footer />
      </div>
    );
  }
}
