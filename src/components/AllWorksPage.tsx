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
import { AllWork } from "../reducers/allWorks";
import { CustomListData } from "../interfaces";

const columns = [
  ["title", "Nimi"],
  ["author", "Tekijä(t)"],
  ["language", "Kieli"],
  ["format", "Formaatti"],
  ["license_pool_status", "Tila"],
] as const;

const optionalColumns = [
  ["published_year", "Julkaisuvuosi"],
  ["licenses_owned", "Lukuoikeudet"],
  ["patrons_in_hold_queue", "Varausjono"],
  ["series", "Sarja"],
  ["duration", "Äänikirjan kesto (tuntia)"],
  ["number_of_pages", "E-kirjan sivumäärä"],
  ["awards", "Palkinnot"],
  ["title_created_date", "Nimekkeen luontipvm"],
  ["data_source_modified", "Tietolähteen muokkauspvm"],
  ["original_published_year", "Alkuperäinen julkaisuvuosi"],
  ["original_language", "Alkuperäinen kieli"],
  ["original_title", "Alkuperäinen nimi"],
  ["keywords", "Avainsanat"],
  ["genres", "Genret"],
  ["fiction", "Kauno-/tietokirjallisuus"],
  ["audience", "Kohdeyleisö"],
  ["target_age", "Kohdeikä"],
] as const;

type OptionalKey = typeof optionalColumns[number][0];

function apiMetadataFilters(filters: { [key: string]: string }) {
  const result = { ...filters };
  (["duration_min", "duration_max"] as const).forEach((key) => {
    if (result[key] !== undefined && result[key] !== "") {
      result[key] = String(Number(result[key]) * 60 * 60);
    }
  });
  return result;
}

const numberKeys: OptionalKey[] = [
  "published_year",
  "licenses_owned",
  "patrons_in_hold_queue",
  "duration",
  "number_of_pages",
  "original_published_year",
];
const dateKeys: OptionalKey[] = ["title_created_date", "data_source_modified"];
const listKeys: OptionalKey[] = ["awards", "keywords", "genres"];

function metadataValue(work: AllWork, key: OptionalKey): string {
  const value = work[key];
  if (value == null) return "";
  if (key === "series")
    return [value, work.series_position]
      .filter((part) => part != null)
      .join(" #");
  if (key === "duration") {
    const minutes = Math.round(Number(value) / 60);
    return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(
      2,
      "0"
    )} min`;
  }
  if (dateKeys.includes(key))
    return new Date(String(value)).toLocaleDateString("fi-FI");
  if (listKeys.includes(key)) return (value as string[]).join(", ");
  if (key === "fiction")
    return value ? "Kaunokirjallisuus" : "Tietokirjallisuus";
  return String(value);
}

function licensePoolStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    active: "Aktiivinen",
    exhausted: "Umpeutunut",
    no_licenses: "Ei lisenssejä",
  };
  return labels[status] || status;
}

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

function bookListsUrl(adminUrl?: string): string | null {
  if (!adminUrl) return null;
  try {
    const pathname = new URL(adminUrl, window.location.origin).pathname;
    const marker = "/admin/works/";
    const index = pathname.indexOf(marker);
    if (index < 0) return null;
    return `${pathname.slice(index).replace(/\/$/, "")}/lists`;
  } catch (_error) {
    return null;
  }
}

function AllWorksContent(props: {
  params: { library: string };
  csrfToken?: string;
}): JSX.Element {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.editor.allWorks.data);
  const genreTree = useSelector(
    (state: RootState) => state.editor.classifications.genreTree
  );
  const languages = useSelector(
    (state: RootState) => state.editor.languages?.data
  );
  const isFetching = useSelector(
    (state: RootState) => state.editor.allWorks.isFetching
  );
  const fetchError = useSelector(
    (state: RootState) => state.editor.allWorks.fetchError
  );
  const customLists = useSelector(
    (state: RootState) => state.editor.customLists.data?.custom_lists || []
  );
  const [selectedLists, setSelectedLists] = useState<{
    [workId: number]: string;
  }>({});
  const [addingWork, setAddingWork] = useState<number | null>(null);
  const [listActionError, setListActionError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    language: "",
    format: "",
    status: "",
  });
  const [sort, setSort] = useState("title");
  const [direction, setDirection] = useState("asc");
  useEffect(() => {
    Promise.resolve(
      dispatch(
        new ActionCreator().fetchCustomLists(props.params.library) as any
      )
    ).catch(() => {
      setListActionError("Listojen lataus epäonnistui.");
    });
  }, [dispatch, props.params.library]);

  async function addWorkToList(work: AllWork) {
    const listId = selectedLists[work.id];
    const selectedList = customLists.find((list) => String(list.id) === listId);
    const listsUrl = bookListsUrl(work.admin_url);
    if (!selectedList || !listsUrl) {
      setListActionError("Teoksen listatoiminnon osoitetta ei löytynyt.");
      return;
    }
    setAddingWork(work.id);
    setListActionError(null);
    try {
      const actions = new ActionCreator(null, props.csrfToken);
      const current = await dispatch(
        actions.fetchCustomListsForBook(listsUrl) as any
      );
      const memberships: CustomListData[] = current?.custom_lists || [];
      if (!memberships.some((list) => String(list.id) === listId)) {
        const form = new (window as any).FormData();
        form.append("lists", JSON.stringify([...memberships, selectedList]));
        await dispatch(actions.editCustomListsForBook(listsUrl, form) as any);
      }
      setSelectedLists({ ...selectedLists, [work.id]: "" });
    } catch (error) {
      const requestError = error as { status?: number; response?: string };
      setListActionError(
        `Kirjan lisääminen listalle epäonnistui${
          requestError.status ? ` (${requestError.status})` : ""
        }: ${requestError.response || "Yritä uudelleen."}`
      );
    } finally {
      setAddingWork(null);
    }
  }
  const [selectedColumns, setSelectedColumns] = useState<OptionalKey[]>([]);
  const [metadataFilters, setMetadataFilters] = useState<{
    [key: string]: string;
  }>({});

  const load = (offset = 0, includeTotal = true) => {
    Promise.resolve(
      dispatch(
        new ActionCreator().fetchAllWorks(
          props.params.library,
          {
            ...filters,
            ...apiMetadataFilters(metadataFilters),
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

  const updateMetadataFilter = (key: string, value: string) => {
    const next = { ...metadataFilters, [key]: value };
    setMetadataFilters(next);
    Promise.resolve(
      dispatch(
        new ActionCreator().fetchAllWorks(
          props.params.library,
          {
            ...filters,
            ...apiMetadataFilters(next),
            sort,
            direction,
            offset: 0,
            include_total: 1,
          },
          false
        ) as any
      )
    ).catch(() => undefined);
  };

  const toggleColumn = (key: OptionalKey) => {
    if (!selectedColumns.includes(key)) {
      setSelectedColumns([...selectedColumns, key]);
      return;
    }
    setSelectedColumns(selectedColumns.filter((selected) => selected !== key));
    const next = { ...metadataFilters };
    Object.keys(next)
      .filter((name) => name === key || name.startsWith(`${key}_`))
      .forEach((name) => delete next[name]);
    setMetadataFilters(next);
    const nextSort = sort === key ? "title" : sort;
    const nextDirection = sort === key ? "asc" : direction;
    if (nextSort !== sort) {
      setSort(nextSort);
      setDirection(nextDirection);
    } else {
      Promise.resolve(
        dispatch(
          new ActionCreator().fetchAllWorks(
            props.params.library,
            {
              ...filters,
              ...apiMetadataFilters(next),
              sort: nextSort,
              direction: nextDirection,
              offset: 0,
              include_total: 1,
            },
            false
          ) as any
        )
      ).catch(() => undefined);
    }
  };

  useEffect(() => {
    Promise.resolve(
      dispatch(new ActionCreator().fetchLanguages() as any)
    ).catch(() => undefined);
    Promise.resolve(
      dispatch(new ActionCreator().fetchGenreTree("/admin/genres") as any)
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
              {
                ...next,
                ...apiMetadataFilters(metadataFilters),
                sort,
                direction,
                offset: 0,
                include_total: 1,
              },
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
    () =>
      [...columns, ...optionalColumns].find(([key]) => key === sort)?.[1] ||
      sort,
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
        <fieldset className="all-works-metadata-options">
          <legend>Näytettävät lisätiedot</legend>
          {optionalColumns.map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(key)}
                onChange={() => toggleColumn(key)}
              />
              {label}
            </label>
          ))}
        </fieldset>
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
              {optionalColumns
                .filter(([key]) => selectedColumns.includes(key))
                .map(([key, label]) => (
                  <th key={key}>
                    <div className="all-works-column-heading">
                      <div className="all-works-column-title-row">
                        <span className="all-works-column-title">{label}</span>
                        <button
                          type="button"
                          aria-label={`Lajittele: ${label}`}
                          aria-pressed={sort === key}
                          className={`all-works-sort-button${
                            sort === key ? " active" : ""
                          }`}
                          onClick={() => {
                            if (sort === key)
                              setDirection(
                                direction === "asc" ? "desc" : "asc"
                              );
                            else {
                              setSort(key);
                              setDirection("asc");
                            }
                          }}
                        >
                          ⇅
                        </button>
                      </div>
                      <div className="all-works-column-filter">
                        {key === "genres" ? (
                          <select
                            aria-label={`Rajaa: ${label}`}
                            value={metadataFilters[key] || ""}
                            onChange={(event) =>
                              updateMetadataFilter(key, event.target.value)
                            }
                          >
                            <option value="">Kaikki</option>
                            {Object.entries(genreTree || {}).map(
                              ([group, genres]) => (
                                <optgroup key={group} label={group}>
                                  {Object.entries(genres).map(([label]) => {
                                    const genre = (
                                      data?.genre_options || []
                                    ).find((option) => option.label === label);
                                    return genre ? (
                                      <option
                                        key={genre.value}
                                        value={genre.value}
                                      >
                                        {label}
                                      </option>
                                    ) : null;
                                  })}
                                </optgroup>
                              )
                            )}
                          </select>
                        ) : key === "fiction" ? (
                          <select
                            aria-label={`Rajaa: ${label}`}
                            value={metadataFilters[key] || ""}
                            onChange={(event) =>
                              updateMetadataFilter(key, event.target.value)
                            }
                          >
                            <option value="">Kaikki</option>
                            <option value="true">Kaunokirjallisuus</option>
                            <option value="false">Tietokirjallisuus</option>
                          </select>
                        ) : key === "audience" ? (
                          <select
                            aria-label={`Rajaa: ${label}`}
                            value={metadataFilters[key] || ""}
                            onChange={(event) =>
                              updateMetadataFilter(key, event.target.value)
                            }
                          >
                            <option value="">Kaikki</option>
                            <option value="Adult">Aikuiset</option>
                            <option value="Young Adult">Nuoret</option>
                            <option value="Children">Lapset</option>
                            <option value="Adults Only">Vain aikuiset</option>
                          </select>
                        ) : numberKeys.includes(key) ||
                          dateKeys.includes(key) ? (
                          <div
                            className={`all-works-range-filter${
                              key === "duration" ? " duration-range-filter" : ""
                            }`}
                          >
                            {(["min", "max"] as const).map((bound) => (
                              <input
                                key={bound}
                                aria-label={`${label}: ${
                                  bound === "min" ? "vähintään" : "enintään"
                                } tuntia`}
                                type={
                                  dateKeys.includes(key) ? "date" : "number"
                                }
                                step={key === "duration" ? "any" : undefined}
                                value={metadataFilters[`${key}_${bound}`] || ""}
                                onChange={(event) =>
                                  updateMetadataFilter(
                                    `${key}_${bound}`,
                                    event.target.value
                                  )
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <input
                            aria-label={`Rajaa: ${label}`}
                            type={key === "target_age" ? "number" : "text"}
                            value={metadataFilters[key] || ""}
                            onChange={(event) =>
                              updateMetadataFilter(key, event.target.value)
                            }
                          />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              <th>Listat</th>
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
                  <td>
                    {detailsHref ? (
                      <a href={detailsHref}>{work.title}</a>
                    ) : (
                      work.title
                    )}
                  </td>
                  <td className="all-works-author-cell">{work.author}</td>
                  <td>{work.language}</td>
                  <td>{work.format}</td>
                  <td>{licensePoolStatusLabel(work.license_pool_status)}</td>
                  {optionalColumns
                    .filter(([key]) => selectedColumns.includes(key))
                    .map(([key]) => (
                      <td key={key}>{metadataValue(work, key)}</td>
                    ))}
                  <td>
                    <select
                      aria-label={`Valitse lista teokselle ${work.title}`}
                      value={selectedLists[work.id] || ""}
                      onChange={(event) =>
                        setSelectedLists({
                          ...selectedLists,
                          [work.id]: event.target.value,
                        })
                      }
                    >
                      <option value="">Lisää listalle…</option>
                      {customLists
                        .filter((list) => list.name)
                        .map((list) => (
                          <option key={list.id} value={String(list.id)}>
                            {list.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={
                        !selectedLists[work.id] || addingWork === work.id
                      }
                      onClick={() => addWorkToList(work)}
                    >
                      {addingWork === work.id ? "Lisätään…" : "Lisää"}
                    </button>
                    {listActionError && addingWork === null && (
                      <span role="alert">{listActionError}</span>
                    )}
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
    csrfToken: PropTypes.string,
  };
  static contextTypes = {
    csrfToken: PropTypes.string,
  };

  getChildContext() {
    return {
      library: () => this.props.params.library,
      csrfToken: this.context.csrfToken,
    };
  }

  render() {
    return (
      <AllWorksContent {...this.props} csrfToken={this.context.csrfToken} />
    );
  }
}
