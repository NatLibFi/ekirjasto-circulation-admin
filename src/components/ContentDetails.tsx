import * as React from "react";

import { ContentItem } from "./ContentPage";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : "—";

interface ContentDetailsProps {
  groupId?: string;
  languages: Array<
    Partial<ContentItem> & {
      language: string;
      available: boolean;
      action: string;
    }
  >;
  onBack: () => void;
  onView: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
  onChangeStatus: (item: ContentItem, status: "published" | "hide") => void;
  onDelete: (item: ContentItem) => void;
  onCreate: (language: string) => void;
}

export default function ContentDetails({
  languages,
  onBack,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
  onCreate,
}: ContentDetailsProps) {
  return (
    <section className="content-details">
      <div className="content-details-header">
        <button className="btn btn-default" type="button" onClick={onBack}>
          Takaisin
        </button>
      </div>
      <table className="content-details-table">
        <thead>
          <tr>
            <th>Kieli</th>
            <th>Otsikko</th>
            <th>Status</th>
            <th>Luotu</th>
            <th>Julkaistu</th>
            <th>Muokattu</th>
            <th>Piilotettu</th>
            <th>Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {languages.map((language) => {
            const item = language as ContentItem;
            const nextStatus =
              item.status === "published" ? "hide" : "published";
            return (
              <tr key={language.language}>
                <th>{language.language}</th>
                <td>{language.title || "—"}</td>
                <td>{language.status || "—"}</td>
                <td>{formatDate(language.created_at)}</td>
                <td>
                  {language.status === "published"
                    ? formatDate(language.published_at)
                    : "—"}
                </td>
                <td>{formatDate(language.updated_at)}</td>
                <td>{language.status === "hide" ? "Kyllä" : "—"}</td>
                <td className="content-action-buttons">
                  {!language.available ? (
                    <button
                      className="btn btn-default"
                      type="button"
                      onClick={() => onCreate(language.language)}
                    >
                      Luo uusi
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-default"
                        type="button"
                        onClick={() => onView(item)}
                      >
                        Katso
                      </button>
                      <button
                        className="btn btn-default"
                        type="button"
                        onClick={() => onEdit(item)}
                      >
                        Muokkaa
                      </button>
                      <button
                        className="btn btn-default"
                        type="button"
                        onClick={() => onChangeStatus(item, nextStatus)}
                      >
                        {nextStatus === "published" ? "Julkaise" : "Piilota"}
                      </button>
                      <button
                        className="btn btn-default"
                        type="button"
                        onClick={() => onDelete(item)}
                      >
                        Poista
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
