import * as React from "react";

/** Renders the complete summary supplied by the OPDS book data. */
export default function SummaryContainer({
  summary,
  language,
}: {
  summary: string;
  language?: string;
}): JSX.Element {
  return (
    <div
      className="summary"
      lang={language}
      dangerouslySetInnerHTML={{ __html: summary }}
    />
  );
}
