import * as React from "react";
import { BookData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";

export interface BookDetailsProps {
  book: BookData & { updated?: string };
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

// Builds the metadata grid, keeping multi-value fields such as authors,
// contributors, and genres as separate rows.
function renderBookFields(book: BookData) {
  const fields = [
    { name: "ISBN", value: isbn(book) },
    { name: "Published", value: book.published },
    { name: "Updated", value: updated(book) },
    { name: "Publisher", value: book.publisher },
    { name: "Distributor", value: distributor(book) },
    { name: "Audience", value: audience(book) },
    { name: "Fiction/Nonfiction", value: fictionType(book) },
    { name: "Genres", value: genres(book) },
    { name: "Medium", value: medium(book) },
    { name: "Delivery Mechanisms (DRM)", value: drm(book) },
    { name: "Formats", value: formats(book) },
  ];

  return (
    <dl className="custom-book-fields" lang="en">
      {renderBookField("Author", book.authors)}
      {renderBookField(
        "Contributors",
        book.contributors && book.contributors.map(formatContributor)
      )}
      {fields.map((field) => renderBookField(field.name, field.value))}
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

function updated(book: BookData & { updated?: string }): string | null {
  const value = book.updated || rawUpdatedValue(book);
  return value ? formatDate(value) : null;
}

function rawUpdatedValue(book: BookData): string | null {
  const rawUpdated = book.raw && (book.raw.updated || book.raw["atom:updated"]);
  const value = Array.isArray(rawUpdated) ? rawUpdated[0] : rawUpdated;
  if (!value) {
    return null;
  }
  return typeof value === "string" ? value : value._ || value.value || null;
}

// Renders one metadata field. Array values become one row per item; the label
// is shown only on the first row so the following rows stay visually grouped.
function renderBookField(
  name: string,
  value: string | string[] | null | undefined
) {
  const values = Array.isArray(value) ? value : [value];
  const displayValues = values.length && values.some(Boolean) ? values : ["—"];
  const className = name.toLowerCase().replace(" ", "");

  return displayValues.map((item, index) => (
    <div key={`${name}-${index}`} className={className}>
      <dt>{index === 0 ? `${name}: ` : null}</dt>
      <dd>{item || "—"}</dd>
    </div>
  ));
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

function fictionType(book: BookData): string | null {
  const category = rawCategories(book).find((candidate) => {
    const scheme = candidate["$"] && candidate["$"]["scheme"];
    return (
      scheme &&
      normalizeCategoryScheme(scheme.value) ===
        "http://librarysimplified.org/terms/fiction"
    );
  });

  return categoryValue(category, "label");
}

function normalizeCategoryScheme(scheme: string): string {
  return scheme.replace(/\/$/, "");
}

function genres(book: BookData): string[] | null {
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

  return values.length ? values : null;
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

// The deepest indirect-acquisition type is the actual deliverable format
// (for example, application/epub+zip), not an outer DRM/license type.
function formats(book: BookData): string[] | null {
  const acquisitionTypes = rawAcquisitionTypes(book);
  if (acquisitionTypes.formats.length) {
    return acquisitionTypes.formats;
  }

  const links = ([] as Array<{
    type: string;
    indirectType?: string;
  }>).concat(
    book.openAccessLinks || [],
    book.allBorrowLinks || [],
    book.fulfillmentLinks || []
  );
  const values = links
    .filter((link) => !link.indirectType)
    .map((link) => link.type)
    .filter(Boolean)
    .filter((format, index, all) => all.indexOf(format) === index);

  return values.length ? values : null;
}

// Any indirect-acquisition types before the deepest type describe the
// intermediary protection or delivery layers, such as an LCP license.
function drm(book: BookData): string[] | null {
  const acquisitionTypes = rawAcquisitionTypes(book);
  if (acquisitionTypes.drm.length) {
    return acquisitionTypes.drm;
  }

  const links = ([] as Array<{ indirectType?: string }>).concat(
    book.allBorrowLinks || [],
    book.fulfillmentLinks || []
  );
  const values = links
    .map((link) => link.indirectType)
    .filter(Boolean)
    .filter((format, index, all) => all.indexOf(format) === index);

  return values.length ? values : null;
}

function rawAcquisitionTypes(book: BookData): {
  drm: string[];
  formats: string[];
} {
  // The adapted BookData keeps only the first indirect type. Use the raw OPDS
  // links here so nested indirectAcquisition elements are not lost.
  const links = (book.raw && book.raw.link) || [];
  const types = links.reduce(
    (types: { drm: string[]; formats: string[] }, link: any) => {
      const rel = link && link["$"] && link["$"]["rel"];
      if (!rel || !rel.value || rel.value.indexOf("/acquisition/") === -1) {
        return types;
      }

      const indirectAcquisitions = Object.keys(link)
        .filter(
          (key) =>
            key === "opds:indirectAcquisition" ||
            key === "indirectAcquisition"
        )
        .reduce(
          (acquisitions: any[], key) => acquisitions.concat(link[key]),
          []
        );
    if (!indirectAcquisitions.length) {
      const type = link["$"]["type"] && link["$"]["type"].value;
      if (type) {
        types.formats.push(type);
      }
        return types;
      }

    indirectAcquisitions.forEach((acquisition) => {
      const chain = indirectAcquisitionTypeChain(acquisition);
      if (chain.length > 1) {
        types.drm.push(...chain.slice(0, -1));
      }
      const format = chain[chain.length - 1];
      if (format) {
        types.formats.push(format);
      }
      });

      return types;
    },
    { drm: [], formats: [] }
  );
  return {
    drm: uniqueValues(types.drm),
    formats: uniqueValues(types.formats),
  };
}

function uniqueValues(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function indirectAcquisitionTypeChain(acquisition: any): string[] {
  const type =
    acquisition && acquisition["$"] && acquisition["$"]["type"]
      ? acquisition["$"]["type"].value
      : acquisition && acquisition.type;
  const nested = Object.keys(acquisition || {})
    .filter(
      (key) =>
        key === "opds:indirectAcquisition" || key === "indirectAcquisition"
    )
    .reduce((acquisitions: any[], key) => acquisitions.concat(acquisition[key]), []);
  const nestedChain = nested.length
    ? indirectAcquisitionTypeChain(nested[nested.length - 1])
    : [];
  // Keep the chain ordered from outermost to innermost so callers can split
  // DRM layers from the final, actual format.
  return (type ? [type] : []).concat(nestedChain);
}

function rawCategories(book: BookData): any[] {
  return (book.raw && book.raw.category) || [];
}

function label(category: any): string | null {
  return categoryValue(category, "label");
}

function categoryValue(category: any, attribute: string): string | null {
  const value = category && category["$"] && category["$"][attribute];
  return value && value.value ? value.value : null;
}

function isOpenAccess(book: BookData): boolean {
  return !!(book.openAccessLinks && book.openAccessLinks.length);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
}
