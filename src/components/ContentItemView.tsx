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
      <h2>Otsikko: {item.title}</h2>
      <p>
        Kieli: {item.language}, Tila: {item.status}
      </p>
      {item.type !== "banner" && (
        <>
          <h3>Esittelyteksti</h3>
          {item.intro_html && (
            <div dangerouslySetInnerHTML={{ __html: item.intro_html }} />
          )}
        </>
      )}
      <h3>Sisältöteksti</h3>
      <div dangerouslySetInnerHTML={{ __html: item.body_html || "" }} />
    </section>
  );
}
