import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import editorAdapter from "../editorAdapter";
import ActionCreator from "../actions";
import {
  BookData,
  FetchErrorData,
} from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";
import DataFetcher from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import { CirculationData } from "../interfaces";
import { RootState } from "../store";
import LicensePool from "./LicensePool";

export interface BookDetailsProps {
  book: BookData & {
    updated?: string;
    issued?: string;
    targetAgeRange?: string[];
  };
  // Kept for compatibility with the props supplied by OPDSCatalog.
  updateBook?: (...args: any[]) => any;
  bookUrl?: string;
  library?: string;
  store?: Store<RootState>;
  circulationData?: CirculationData;
  circulationIsFetching?: boolean;
  circulationFetchError?: FetchErrorData;
  fetchCirculation?: (url: string) => Promise<any>;
}

interface SummaryCellProps {
  summary: string;
  language?: string;
}

class SummaryCell extends React.Component<SummaryCellProps> {
  state = { expanded: false };

  render(): JSX.Element {
    const { summary, language } = this.props;
    const plainSummary = stripMarkup(summary);
    const isLong = plainSummary.length > SUMMARY_PREVIEW_LENGTH;
    const displayedSummary = isLong
      ? plainSummary.substring(0, SUMMARY_PREVIEW_LENGTH).trimEnd() + "…"
      : plainSummary;

    return (
      <div className="summary" lang={language}>
        {this.state.expanded || !isLong ? (
          <div dangerouslySetInnerHTML={{ __html: summary }} />
        ) : (
          <span>{displayedSummary}</span>
        )}
        {isLong && (
          <button
            type="button"
            className="summary-toggle"
            aria-expanded={this.state.expanded}
            onClick={() => this.setState({ expanded: !this.state.expanded })}
          >
            {this.state.expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  }
}

const SUMMARY_PREVIEW_LENGTH = 50;

/** Renders the book details page without using web-opds-client's UI components. */
export class BookDetails extends React.Component<BookDetailsProps> {
  componentDidMount() {
    this.fetchCirculation();
  }

  componentDidUpdate(previousProps: BookDetailsProps) {
    if (this.circulationUrl(previousProps) !== this.circulationUrl(this.props)) {
      this.fetchCirculation();
    }
  }

  private fetchCirculation() {
    const url = circulationUrl(
      this.props.book,
      this.props.library,
      this.props.bookUrl
    );
    if (url && this.props.fetchCirculation) {
      this.props.fetchCirculation(url);
    }
  }

  private circulationUrl(props: BookDetailsProps) {
    return circulationUrl(props.book, props.library, props.bookUrl);
  }

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
            {renderBookTables(book, this.props)}
          </div>
        </div>

        <div className="custom-book-details-main">
          <div className="circulation-links" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state): Partial<BookDetailsProps> {
  return {
    circulationData: state.editor.circulation.data,
    circulationIsFetching: state.editor.circulation.isFetching,
    circulationFetchError: state.editor.circulation.fetchError,
  };
}

function mapDispatchToProps(dispatch): Partial<BookDetailsProps> {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher);
  return {
    fetchCirculation: (url: string) => dispatch(actions.fetchCirculation(url)),
  };
}

export const ConnectedBookDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(BookDetails);

export default BookDetails;

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

function renderBookTables(
  book: BookDetailsProps["book"],
  props: BookDetailsProps
) {
  return (
    <div className="custom-book-tables" lang="en">
      <BookDetailsTable
        title="Basic information"
        rows={[
          ["Title", book.title],
          ["Subtitle", book.subtitle],
          ["ISBN", isbn(book)],
          ["Authors", book.authors],
          [
            "Contributors",
            book.contributors && book.contributors.map(formatContributor),
          ],
          ["Language", book.language],
          ["Medium", medium(book)],
          ["Published", book.published],
          ["Issued", issued(book)],
          ["Updated", updated(book)],
          ["Distributor", distributor(book)],
          ["Summary", book.summary ? renderSummary(book) : null],
        ]}
      />
      <BookDetailsTable
        title="DRMs and formats"
        rows={[["DRM", drm(book)], ["Formats", formats(book)]]}
      />
      <BookDetailsTable
        title="Classifications"
        rows={[
          ["Genres", genres(book)],
          ["Audience", audience(book)],
          ["Target age", targetAge(book)],
          ["Fiction", fictionType(book)],
        ]}
      />
      <LicensePool
        data={props.circulationData}
        isFetching={props.circulationIsFetching}
        fetchError={props.circulationFetchError}
      />
    </div>
  );
}

function circulationUrl(
  book: BookDetailsProps["book"],
  library?: string,
  bookUrl?: string
): string | null {
  const rawLinkValues = book.raw
    ? Object.keys(book.raw)
        .filter((key) => key === "link" || key.endsWith(":link"))
        .map((key) => book.raw[key])
    : [];
  const rawLinks = rawLinkValues.reduce(
    (links: any[], value: any) =>
      links.concat(Array.isArray(value) ? value : value ? [value] : []),
    []
  );
  const circulationLink = rawLinks.find(
    (link: any) =>
      link &&
      link["$"] &&
      link["$"].rel &&
      rawAttributeValue(link["$"].rel) ===
        "http://librarysimplified.org/terms/rel/circulation-details"
  );

  const rawUrl =
    circulationLink && circulationLink["$"] && circulationLink["$"].href
      ? rawAttributeValue(circulationLink["$"].href)
      : null;
  if (rawUrl) {
    return rawUrl;
  }

  if (!library || !bookUrl) {
    return null;
  }

  const librarySlug = library.split(/[/?#]/)[0];
  const worksMarker = "/works/";
  const worksIndex = bookUrl.indexOf(worksMarker);
  if (!librarySlug || worksIndex === -1) {
    return null;
  }

  const identifierPath = bookUrl
    .substring(worksIndex + worksMarker.length)
    .split(/[?#]/)[0];
  const parts = identifierPath.split("/");
  if (parts.length < 2 || !parts[0] || !parts.slice(1).join("/")) {
    return null;
  }

  return `/${librarySlug}/admin/works/${parts[0]}/${parts
    .slice(1)
    .join("/")}/circulation`;
}

function rawAttributeValue(attribute: any): string | null {
  return attribute && typeof attribute === "object"
    ? attribute.value || attribute._ || null
    : attribute || null;
}

function BookDetailsTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string | number | string[] | null | undefined | JSX.Element]>;
}) {
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
  value: string | number | string[] | null | undefined | JSX.Element
) {
  const values = Array.isArray(value) ? value : [value];
  const displayValues = values.length && values.some(Boolean) ? values : [""];
  const className = name.toLowerCase().replace(/\s/g, "-");

  return displayValues.map((item, index) => (
    <tr key={`${name}-${index}`} className={className}>
      <th scope="row">{index === 0 ? name : null}</th>
      <td>{item || ""}</td>
    </tr>
  ));
}

function renderSummary(book: BookData): JSX.Element {
  return <SummaryCell summary={book.summary as string} language={book.language} />;
}

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
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

function issued(book: BookDetailsProps["book"]): string | null {
  return (
    book.issued || rawValue(book, "issued") || rawValue(book, "atom:issued")
  );
}

function targetAge(book: BookDetailsProps["book"]): string | string[] | null {
  return (
    book.targetAgeRange ||
    categoryLabel(book, "http://schema.org/typicalAgeRange")
  );
}

function rawValue(book: BookData, key: string): string | null {
  const value = book.raw && book.raw[key];
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue && typeof firstValue === "object"
    ? firstValue._ || firstValue.value || null
    : firstValue || null;
}

function categoryLabel(book: BookData, scheme: string): string | null {
  const category = rawCategories(book).find(
    (candidate) =>
      candidate["$"] &&
      candidate["$"]["scheme"] &&
      normalizeCategoryScheme(candidate["$"]["scheme"].value) ===
        normalizeCategoryScheme(scheme)
  );
  return label(category);
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
  return audienceValue;
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

function formatDate(value: string, includeTime = false): string {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(includeTime && {
          hour: "numeric",
          minute: "2-digit",
        }),
        timeZone: "UTC",
      });
}
