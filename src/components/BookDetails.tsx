import * as React from "react";
import { BookData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";

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
            {renderBookFields(book)}
          </div>
        </div>

        <div className="custom-book-details-main">
          <div className="circulation-links" />
        </div>
      </div>
    );
  }
}

function formatContributor(contributor: {
  name: string;
  role?: string;
}): string {
  const role = contributor.role && mapContributorRole(contributor.role);
  return role ? `${contributor.name} (${role})` : contributor.name;
}

function mapContributorRole(role: string): string {
  const normalizedRole = role.trim().toLowerCase();
  return CONTRIBUTOR_ROLE_NAMES[normalizedRole] || role;
}

const CONTRIBUTOR_ROLE_NAMES: { [role: string]: string } = {
  act: "Actor",
  adp: "Adapter",
  aft: "Afterword Author",
  art: "Artist",
  asn: "Associated Author",
  aut: "Author",
  ctb: "Contributor",
  com: "Compiler",
  cmp: "Composer",
  cph: "Copyright Holder",
  dsr: "Designer",
  drt: "Director",
  edt: "Editor",
  eng: "Engineer",
  pro: "Producer",
  wpr: "Foreword Author",
  ill: "Illustrator",
  win: "Introduction Author",
  lyr: "Lyricist",
  mus: "Musician",
  nrt: "Narrator",
  prf: "Performer",
  pht: "Photographer",
  trc: "Transcriber",
  trl: "Translator",
  clr: "Colorist",
};

function BookCover({ book }: { book: BookData }) {
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

function renderBookFields(book: BookData) {
  const fields = [
    {
      name: "Author",
      value:
        book.authors && book.authors.length
          ? book.authors.join(", ")
          : null,
    },
    {
      name: "Contributors",
      value:
        book.contributors && book.contributors.length
          ? book.contributors.map(formatContributor).join(", ")
          : null,
    },
    { name: "Published", value: book.published },
    { name: "Publisher", value: book.publisher },
    { name: "Audience", value: audience(book) },
    { name: "Categories", value: categories(book) },
    { name: "Distributed By", value: distributor(book) },
    { name: "ISBN", value: isbn(book) },
    { name: "Medium", value: medium(book) },
  ];

  return (
    <dl className="custom-book-fields" lang="en">
      {fields.map((field) =>
        <div
          key={field.name}
          className={field.name.toLowerCase().replace(" ", "-")}
        >
          <dt>{field.name}: </dt>
          <dd>{field.value || "—"}</dd>
        </div>
      )}
      {renderCirculationFields(book)}
      <div className="summary-row">
        <dt>Summary: </dt>
        <dd>
          {book.summary ? (
            <div
              className="summary"
              lang={book.language}
              dangerouslySetInnerHTML={{ __html: book.summary }}
            />
          ) : (
            "—"
          )}
        </dd>
      </div>
    </dl>
  );
}

function renderCirculationFields(book: BookData) {
  if (isOpenAccess(book)) {
    return (
      <div className="open-access-info">
        <dt>Availability: </dt>
        <dd>This open-access book is available to keep.</dd>
      </div>
    );
  }

  const availableCopies = book.copies && book.copies.available;
  const totalCopies = book.copies && book.copies.total;
  const holds = book.holds && book.holds.total;

  return (
    <React.Fragment>
      <div className="circulation-info copies-row">
        <dt>Copies available: </dt>
        <dd className="copies-info">
          {availableCopies !== undefined &&
          availableCopies !== null &&
          totalCopies !== undefined &&
          totalCopies !== null
            ? `${availableCopies} of ${totalCopies} copies available`
            : "—"}
        </dd>
      </div>
      <div className="circulation-info holds-row">
        <dt>Hold queue: </dt>
        <dd className="holds-info">
          {holds !== undefined && holds !== null
            ? `${holds} patrons in hold queue`
            : "—"}
        </dd>
      </div>
    </React.Fragment>
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
        excluded
          .concat([fictionScheme])
          .indexOf(category["$"]["scheme"].value) === -1
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

function formatDate(value: string): string {
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
