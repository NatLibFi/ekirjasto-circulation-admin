import * as React from "react";

export type BookDetailsTableValue =
  | string
  | number
  | string[]
  | null
  | undefined
  | JSX.Element;

interface BookDetailsTableSectionProps {
  title: string;
  rows: Array<[string, BookDetailsTableValue]>;
}

/** Renders a titled two-column table of book metadata. */
export default function BookDetailsTableSection({
  title,
  rows,
}: BookDetailsTableSectionProps): JSX.Element {
  return (
    <section className="custom-book-table-section">
      <h2>{title}</h2>
      <table className="custom-book-table">
        <tbody>
          {rows.map(([name, value]) => renderBookTableRow(name, value))}
        </tbody>
      </table>
    </section>
  );
}

function renderBookTableRow(
  name: string,
  value: BookDetailsTableValue
): JSX.Element[] {
  const values = Array.isArray(value) ? value : [value];
  const displayValues =
    values.length &&
    values.some((item) => item !== null && item !== undefined && item !== "")
      ? values
      : [""];
  const className = name.toLowerCase().replace(/\s/g, "-");

  return displayValues.map((item, index) => (
    <tr key={`${name}-${index}`} className={className}>
      <th scope="row">{index === 0 ? name : null}</th>
      <td>{item ?? ""}</td>
    </tr>
  ));
}
