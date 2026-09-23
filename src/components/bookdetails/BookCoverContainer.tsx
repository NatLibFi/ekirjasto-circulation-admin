import * as React from "react";
import { BookData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";

/** Renders the book cover, or a text fallback when no cover is available. */
export default function BookCoverContainer({
  book,
}: {
  book: BookData;
}): JSX.Element {
  if (book.imageUrl) {
    return (
      <div className="custom-book-cover">
        <img src={book.imageUrl} alt="" className="custom-book-cover-image" />
      </div>
    );
  }

  return (
    <div
      className="custom-book-cover custom-book-cover-fallback"
      aria-hidden="true"
    >
      <span>{book.title}</span>
      {book.authors && book.authors.length > 0 && (
        <small>By {book.authors.join(", ")}</small>
      )}
    </div>
  );
}
