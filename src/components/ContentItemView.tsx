import * as React from "react";
import { Button } from "library-simplified-reusable-components";

import { ContentItem } from "./ContentPage";

interface ContentItemViewProps {
  item: Partial<ContentItem>;
  onBack: () => void;
  onEdit: () => void;
}

export default function ContentItemView({
  item,
  onBack,
  onEdit,
}: ContentItemViewProps) {
  return (
    <section className="content-details">
      <button className="btn btn-default" type="button" onClick={onBack}>
        Takaisin
      </button>
      <Button callback={onEdit} content="Muokkaa" />
      <h1>{item.title}</h1>
      <p>
        {item.language} · {item.status}
      </p>
      <h2>Esittelyteksti</h2>
      {item.intro_html && (
        <div dangerouslySetInnerHTML={{ __html: item.intro_html }} />
      )}
      <h2>Sisältöteksti</h2>
      <div dangerouslySetInnerHTML={{ __html: item.body_html || "" }} />
    </section>
  );
}
