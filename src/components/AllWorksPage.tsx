import * as React from "react";
import * as PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionCreator from "../actions";
import Header from "./Header";
import Footer from "./Footer";
import LoadingIndicator from "@natlibfi/ekirjasto-web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import title from "../utils/title";
import { RootState } from "../store";

const columns = [
  ["title", "Nimi"],
  ["author", "Tekijä(t)"],
  ["published_year", "Julkaisuvuosi"],
  ["language", "Kieli"],
  ["format", "Formaatti"],
  ["license_pool_status", "Tila"],
  ["licenses_owned", "Lisenssit"],
  ["patrons_in_hold_queue", "Varausjono"],
] as const;

export function bookDetailsHref(
  library: string,
  adminUrl?: string
): string | null {
  if (!adminUrl) {
    return null;
  }

  let pathname: string;
  try {
    pathname = new URL(adminUrl, window.location.origin).pathname;
  } catch (_error) {
    return null;
  }

  const worksMarker = "/admin/works/";
  const worksIndex = pathname.indexOf(worksMarker);
  if (worksIndex < 0) {
    return null;
  }

  const workPath = pathname.slice(worksIndex + worksMarker.length);
  if (!workPath) {
    return null;
  }

  return `/admin/web/admin-book/${encodeURIComponent(
    `${library}/${workPath}`
  )}`;
}

function AllWorksContent(props: { params: { library: string } }): JSX.Element {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.editor.allWorks.data);
  const languages = useSelector(
    (state: RootState) => state.editor.languages?.data
  );
  const isFetching = useSelector(
    (state: RootState) => state.editor.allWorks.isFetching
  );
  const fetchError = useSelector(
    (state: RootState) => state.editor.allWorks.fetchError
  );
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    language: "",
    format: "",
    status: "",
  });
  const [sort, setSort] = useState("title");
  const [direction, setDirection] = useState("asc");

  const load = (offset = 0, includeTotal = true) => {
    Promise.resolve(
      dispatch(
        new ActionCreator().fetchAllWorks(
          props.params.library,
          {
            ...filters,
            sort,
            direction,
            offset,
            include_total: includeTotal ? 1 : 0,
          },
          false
        ) as any
      )
    ).catch(() => undefined);
  };

  useEffect(() => {
    document.title = title("Kirjaluettelo");
    load();
  }, [sort, direction]);

  useEffect(() => {
    Promise.resolve(
      dispatch(new ActionCreator().fetchLanguages() as any)
    ).catch(() => undefined);
  }, []);

  const updateFilter = (name: string, value: string) => {
    const next = { ...filters, [name]: value };
    setFilters(next);
    window.setTimeout(
      () =>
        Promise.resolve(
          dispatch(
            new ActionCreator().fetchAllWorks(
              props.params.library,
              { ...next, sort, direction, offset: 0, include_total: 1 },
              false
            ) as any
          )
        ).catch(() => undefined),
      0
    );
  };

  const rows = data?.works || [];
  const page = data ? Math.floor(data.offset / data.limit) + 1 : 1;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const canGoPrevious = page > 1;
  const canGoNext = !!data?.has_more;
  const sortLabel = useMemo(
    () => columns.find(([key]) => key === sort)?.[1] || sort,
    [sort]
  );

  return (
    <div className="all-works">
      <Header />
      <main className="body">
        <h1>Kirjaluettelo</h1>
        <p>
          {data ? `${data.total} kirjaa, Lajitteluperuste: ${sortLabel}` : ""}
        </p>
        {fetchError && <ErrorMessage error={fetchError} />}
        {isFetching && !data && <LoadingIndicator />}
        {data && pageCount > 1 && (
          <nav
            className="all-works-pagination all-works-pagination-top"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={!canGoPrevious || isFetching}
              onClick={() => load(data.offset - data.limit, false)}
            >
              Edellinen
            </button>
            <span aria-live="polite">
              Sivu {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={!canGoNext || isFetching}
              onClick={() => load(data.offset + data.limit, false)}
            >
              Seuraava
            </button>
          </nav>
        )}
        <table className="table table-striped">
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>
                  <div className="all-works-column-heading">
                    <div className="all-works-column-title-row">
                      <span className="all-works-column-title">{label}</span>
                      <button
                        type="button"
                        aria-label={`Sort ${label} ${
                          sort === key && direction === "asc"
                            ? "descending"
                            : "ascending"
                        }`}
                        aria-pressed={sort === key}
                        className={`all-works-sort-button${
                          sort === key ? " active" : ""
                        }`}
                        onClick={() => {
                          if (sort === key) {
                            setDirection(direction === "asc" ? "desc" : "asc");
                          } else {
                            setSort(key);
                            setDirection("asc");
                          }
                        }}
                      >
                        ⇅
                      </button>
                    </div>
                    <div className="all-works-column-filter">
                      {key === "license_pool_status" ? (
                        <select
                          aria-label={`Filter by ${label}`}
                          value={filters.status}
                          onChange={(event) =>
                            updateFilter("status", event.target.value)
                          }
                        >
                          <option value="">Kaikki</option>
                          <option value="active">Aktiivinen</option>
                          <option value="exhausted">Umpeutunut</option>
                          <option value="no_licenses">Ei lisenssejä</option>
                        </select>
                      ) : key === "language" ? (
                        <select
                          aria-label={`Filter by ${label}`}
                          value={filters.language}
                          onChange={(event) =>
                            updateFilter("language", event.target.value)
                          }
                        >
                          <option value="">Kaikki</option>
                          {Object.keys(languages || {})
                            .sort((a, b) => a.localeCompare(b))
                            .map((code) => (
                              <option key={code} value={code}>
                                {languages[code]?.[0] || code}
                              </option>
                            ))}
                        </select>
                      ) : key === "format" ? (
                        <select
                          aria-label={`Filter by ${label}`}
                          value={filters[key]}
                          onChange={(event) =>
                            updateFilter(key, event.target.value)
                          }
                        >
                          <option value="">Kaikki</option>
                          {Array.from(
                            new Set([
                              ...rows.map((work) => work[key]),
                              filters[key],
                            ])
                          )
                            .filter(Boolean)
                            .sort((a, b) => a.localeCompare(b))
                            .map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                        </select>
                      ) : key === "published_year" ||
                        key === "licenses_owned" ||
                        key === "patrons_in_hold_queue" ? (
                        <></>
                      ) : (
                        <input
                          aria-label={`Filter by ${label}`}
                          type="text"
                          value={filters[key]}
                          onChange={(event) =>
                            updateFilter(key, event.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((work) => {
              const detailsHref = bookDetailsHref(
                props.params.library,
                work.admin_url
              );
              return (
                <tr key={work.id}>
                  <td>{work.title}</td>
                  <td>{work.author}</td>
                  <td>{work.published_year}</td>
                  <td>{work.language}</td>
                  <td>{work.format}</td>
                  <td>{work.license_pool_status}</td>
                  <td>{work.licenses_owned}</td>
                  <td>{work.patrons_in_hold_queue}</td>
                  <td>
                    {detailsHref && <a href={detailsHref}>Katso tiedot</a>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data && pageCount > 1 && (
          <nav
            className="all-works-pagination all-works-pagination-bottom"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={!canGoPrevious || isFetching}
              onClick={() => load(data.offset - data.limit, false)}
            >
              Edellinen
            </button>
            <span aria-live="polite">
              Sivu {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={!canGoNext || isFetching}
              onClick={() => load(data.offset + data.limit, false)}
            >
              Seuraava
            </button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}

/** Supplies the active library to Header's legacy context consumers. */
export default class AllWorksPage extends React.Component<{
  params: { library: string };
}> {
  static childContextTypes = {
    library: PropTypes.func,
  };

  getChildContext() {
    return { library: () => this.props.params.library };
  }

  render() {
    return <AllWorksContent {...this.props} />;
  }
}
