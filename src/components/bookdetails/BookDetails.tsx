import * as React from "react";
import * as PropTypes from "prop-types";
import { Store } from "redux";
import { connect } from "react-redux";
import editorAdapter from "../../editorAdapter";
import ActionCreator from "../../actions";
import { FetchErrorData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";
import DataFetcher from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import { CirculationData } from "../../interfaces";
import { RootState } from "../../store";
import Admin from "../../models/Admin";
import LicensePool from "./LicensePool";
import BookCoverContainer from "./BookCoverContainer";
import BookDetailsTableSection from "./BookDetailsTableSection";
import SummaryContainer from "../SummaryContainer";
import {
  audience,
  accessibilityConformance,
  accessibilityFeatures,
  circulationDataUrl,
  copiesAvailable,
  copiesOwned,
  distributor,
  drm,
  formats,
  fictionType,
  formatContributor,
  genres,
  issued,
  isbn,
  medium,
  patronsInQueue,
  selectedByPatrons,
  targetAge,
  updated,
  ExtendedBookData,
} from "./bookDetailsData";

export interface BookDetailsProps {
  book: ExtendedBookData;
  workEntry?: ExtendedBookData;
  // Kept for compatibility with the props supplied by OPDSCatalog.
  updateBook?: (...args: any[]) => any;
  bookUrl?: string;
  library?: string;
  store?: Store<RootState>;
  circulationData?: CirculationData;
  circulationIsFetching?: boolean;
  circulationFetchError?: FetchErrorData;
  fetchCirculationData?: (url: string) => Promise<any>;
}

/** Renders the book details page without using web-opds-client's UI components. */
export class BookDetails extends React.Component<BookDetailsProps> {
  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.fetchCirculationData();
  }

  componentDidUpdate(previousProps: BookDetailsProps) {
    if (
      this.circulationDataUrl(previousProps) !==
      this.circulationDataUrl(this.props)
    ) {
      this.fetchCirculationData();
    }
  }

  private fetchCirculationData() {
    if (!this.context.admin || !this.context.admin.isSystemAdmin()) {
      return;
    }

    const url = circulationDataUrl(this.props.bookUrl);
    if (url && this.props.fetchCirculationData) {
      this.props.fetchCirculationData(url);
    }
  }

  private circulationDataUrl(props: BookDetailsProps) {
    return circulationDataUrl(props.bookUrl);
  }

  render(): JSX.Element {
    const { book } = this.props;

    return (
      <div className="custom-book-details" lang={book.language}>
        <div className="custom-book-details-top">
          <BookCoverContainer book={book} />
          <div className="custom-book-details-metadata">
            <h1 className="title">{book.title}</h1>
            {book.subtitle && <p className="subtitle">{book.subtitle}</p>}
            {book.series && book.series.name && (
              <p className="series">{book.series.name}</p>
            )}
            {renderBookTables(book, this.props, this.context.admin)}
          </div>
        </div>
        <div className="custom-book-details-main">
          {/* Kept for compatibility with the surrounding OPDS client layout. */}
          <div className="circulation-links" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state): Partial<BookDetailsProps> {
  return {
    workEntry: state.editor.book.data,
    circulationData: state.editor.circulation.data,
    circulationIsFetching: state.editor.circulation.isFetching,
    circulationFetchError: state.editor.circulation.fetchError,
  };
}

function mapDispatchToProps(dispatch): Partial<BookDetailsProps> {
  const fetcher = new DataFetcher({ adapter: editorAdapter });
  const actions = new ActionCreator(fetcher);
  return {
    fetchCirculationData: (url: string) =>
      dispatch(actions.fetchCirculationData(url)),
  };
}

export const ConnectedBookDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(BookDetails);

export default BookDetails;

function renderBookTables(
  book: BookDetailsProps["book"],
  props: Pick<
    BookDetailsProps,
    | "workEntry"
    | "circulationData"
    | "circulationIsFetching"
    | "circulationFetchError"
  >,
  admin: Admin
) {
  return (
    <div className="custom-book-tables" lang="en">
      <BookDetailsTableSection
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
          ["Duration", audiobookDuration(book)],
          ["Published", book.published],
          ["Issued", issued(book)],
          ["Updated", updated(book)],
          ["Distributor", distributor(book)],
          [
            "Summary",
            book.summary ? (
              <SummaryContainer
                summary={book.summary}
                language={book.language}
              />
            ) : null,
          ],
        ]}
      />
      <BookDetailsTableSection
        title="DRMs and formats"
        rows={[
          ["DRM", drm(book)],
          ["Formats", formats(book)],
        ]}
      />
      <BookDetailsTableSection
        title="Classifications"
        rows={[
          ["Genres", genres(book)],
          ["Audience", audience(book)],
          ["Target age", targetAge(book)],
          ["Fiction", fictionType(book)],
        ]}
      />
      <BookDetailsTableSection
        title="Accessibility"
        rows={[
          ["Conformance", accessibilityConformance(props.workEntry || book)],
          ["Ways of reading", accessibilityFeatures(props.workEntry || book)],
        ]}
      />
      <BookDetailsTableSection
        title="Popularity"
        rows={[
          ["Selected by patrons", selectedByPatrons(props.workEntry || book)],
        ]}
      />
      <BookDetailsTableSection
        title="Availability"
        rows={[
          ["Copies owned (total concurrency)", copiesOwned(book)],
          ["Copies available", copiesAvailable(book)],
          ["Patrons in queue", patronsInQueue(book)],
        ]}
      />
      {admin && admin.isSystemAdmin() && (
        <LicensePool
          data={props.circulationData}
          isFetching={props.circulationIsFetching}
          fetchError={props.circulationFetchError}
        />
      )}
    </div>
  );
}

function audiobookDuration(book: ExtendedBookData): string | null {
  if (
    medium(book) !== "Audio" ||
    book.duration === undefined ||
    book.duration === null
  ) {
    return null;
  }

  const totalSeconds = Math.floor(book.duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
