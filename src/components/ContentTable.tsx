import * as React from "react";

import { ContentGroup } from "./ContentPage";

export interface ContentTableProps {
  items: ContentGroup[];
  onView: (item: ContentGroup) => void;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : "—";

export default function ContentTable({ items, onView }: ContentTableProps) {
  return (
    <div className="content-table-wrapper">
      <table className="content-table">
        <thead>
          <tr>
            <th className="content-table-cell">Otsikko</th>
            <th className="content-table-cell">Status</th>
            <th className="content-table-cell">Kielet</th>
            <th className="content-table-cell">Luotu</th>
            <th className="content-table-actions">Katso</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.group_id}>
              <td className="content-table-cell">{item.title}</td>
              <td className="content-table-cell">
                {Object.entries(item.statuses)
                  .map(([language, status]) => `${language}: ${status}`)
                  .join(", ")}
              </td>
              <td className="content-table-cell">
                {item.languages.join(", ")}
              </td>
              <td className="content-table-cell">
                {formatDate(item.created_at)}
              </td>
              <td className="content-table-actions">
                <button
                  className="btn btn-default content-action-button"
                  type="button"
                  onClick={() => onView(item)}
                >
                  Katso
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
