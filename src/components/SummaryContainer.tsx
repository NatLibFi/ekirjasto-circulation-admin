import * as React from "react";

/**
 * Renders the complete summary supplied by the OPDS book data.
 * The feed summary is expected to contain the markup provided by the source.
 */
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
