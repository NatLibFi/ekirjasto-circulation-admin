import * as React from "react";
import { BookData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface BookDetailsProps {
  book: BookData;
  // Kept for compatibility with the props supplied by OPDSCatalog.
  updateBook?: (...args: any[]) => any;
}

/** Renders the book details page without using web-opds-client's UI components. */
export default class BookDetails extends React.Component<BookDetailsProps> {
  render(): JSX.Element {
    const { book } = this.props;

    return (
      <div className="custom-book-details" lang={book.language}>
        <div className="custom-book-details-top">
          <BookCover book={book} />

          <div className="custom-book-details-metadata">
            <h1 className="title">{book.title}</h1>
            {book.subtitle && <p className="subtitle">{book.subtitle}</p>}
            {book.series && book.series.name && (
              <p className="series">{book.series.name}</p>
            )}
            {book.authors && book.authors.length > 0 && (
              <p className="authors">By {book.authors.join(", ")}</p>
            )}
            {book.contributors && book.contributors.length > 0 && (
              <p className="contributors">
                Contributors: {book.contributors.join(", ")}
              </p>
            )}
            {renderBookFields(book)}
          </div>
        </div>

        <div className="custom-book-details-main">
          <div className="circulation-links" />
          <CirculationInfo book={book} />
          <section className="summary" lang={book.language}>
            <h2>Summary</h2>
            <div dangerouslySetInnerHTML={{ __html: book.summary || "" }} />
          </section>
        </div>
      </div>
    );
  }
}

function BookCover({ book }: { book: BookData }) {
  if (book.imageUrl) {
    return (
      <div className="custom-book-cover">
        <img src={book.imageUrl} alt="" className="custom-book-cover-image" />
      </div>
    );
  }

  return (
    <div className="custom-book-cover custom-book-cover-fallback" aria-hidden="true">
      <span>{book.title}</span>
      {book.authors && book.authors.length > 0 && (
        <small>By {book.authors.join(", ")}</small>
      )}
    </div>
  );
}

function renderBookFields(book: BookData) {
  const fields = [
    { name: "Published", value: book.published },
    { name: "Publisher", value: book.publisher },
    { name: "Audience", value: audience(book) },
    { name: "Categories", value: categories(book) },
    { name: "Distributed By", value: distributor(book) },
    { name: "ISBN", value: isbn(book) },
    { name: "Medium", value: medium(book) },
  ];

  return (
    <ul className="custom-book-fields" lang="en">
      {fields.map((field) =>
        field.value ? (
          <li
            key={field.name}
            className={field.name.toLowerCase().replace(" ", "-")}
          >
            {field.name}: {field.value}
          </li>
        ) : null
      )}
    </ul>
  );
}

function CirculationInfo({ book }: { book: BookData }) {
  if (isOpenAccess(book)) {
    return (
      <div className="open-access-info">
        This open-access book is available to keep.
      </div>
    );
  }

  const availableCopies = book.copies && book.copies.available;
  const totalCopies = book.copies && book.copies.total;
  const holds = book.holds && book.holds.total;

  return (
    <div className="circulation-info">
      {availableCopies !== undefined &&
        availableCopies !== null &&
        totalCopies !== undefined &&
        totalCopies !== null && (
          <div className="copies-info">
            {availableCopies} of {totalCopies} copies available
          </div>
        )}
      {holds && availableCopies === 0 && (
        <React.Fragment>
          <div className="holds-info">{holds} patrons in hold queue</div>
        </React.Fragment>
      )}
    </div>
  );
}

function audience(book: BookData): string | null {
  const raw = rawCategories(book);
  const audienceCategory = raw.find(
    (category) =>
      category["$"] &&
      category["$"]["scheme"] &&
      category["$"]["scheme"].value === "http://schema.org/audience"
  );
  const audienceValue = label(audienceCategory);

  if (!audienceValue) {
    return null;
  }
  if (audienceValue === "Adult" || audienceValue === "Adults Only") {
    return audienceValue;
  }

  const ageCategory = raw.find(
    (category) =>
      category["$"] &&
      category["$"]["scheme"] &&
      category["$"]["scheme"].value === "http://schema.org/typicalAgeRange"
  );
  const age = label(ageCategory);
  return age ? `${audienceValue} (age ${age})` : audienceValue;
}

function categories(book: BookData): string | null {
  const excluded = [
    "http://schema.org/audience",
    "http://schema.org/typicalAgeRange",
  ];
  const fictionScheme = "http://librarysimplified.org/terms/fiction/";
  const raw = rawCategories(book);
  let values = raw
    .filter(
      (category) =>
        label(category) &&
        category["$"] &&
        category["$"]["scheme"] &&
        excluded.concat([fictionScheme]).indexOf(
          category["$"]["scheme"].value
        ) === -1
    )
    .map(label)
    .filter(Boolean);

  if (!values.length) {
    values = raw
      .filter(
        (category) =>
          category["$"] &&
          category["$"]["scheme"] &&
          category["$"]["scheme"].value === fictionScheme
      )
      .map(label)
      .filter(Boolean);
  }

  return values.length ? values.join(", ") : null;
}

function distributor(book: BookData): string | null {
  const distributions = book.raw && book.raw["bibframe:distribution"];
  const provider =
    distributions &&
    distributions[0] &&
    distributions[0]["$"] &&
    distributions[0]["$"]["bibframe:ProviderName"];
  return provider ? provider.value : null;
}

function isbn(book: BookData): string | null {
  const prefix = "urn:isbn:";
  return book.id && book.id.indexOf(prefix) === 0
    ? book.id.substring(prefix.length)
    : null;
}

function medium(book: BookData): string | null {
  const value =
    book.raw && book.raw["$"] && book.raw["$"]["schema:additionalType"];
  if (!value || !value.value) {
    return null;
  }
  if (value.value === "http://bib.schema.org/Audiobook") {
    return "Audio";
  }
  if (
    value.value === "http://schema.org/EBook" ||
    value.value === "http://schema.org/Book"
  ) {
    return "eBook";
  }
  return null;
}

function rawCategories(book: BookData): any[] {
  return (book.raw && book.raw.category) || [];
}

function label(category: any): string | null {
  return category && category["$"] && category["$"]["label"]
    ? category["$"]["label"].value
    : null;
}

function isOpenAccess(book: BookData): boolean {
  return !!(book.openAccessLinks && book.openAccessLinks.length);
}

function isBorrowed(book: BookData): boolean {
  return !!(book.fulfillmentLinks && book.fulfillmentLinks.length);
}

function isReserved(book: BookData): boolean {
  return !!book.availability && book.availability.status === "reserved";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
