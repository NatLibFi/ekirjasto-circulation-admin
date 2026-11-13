import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionCreator from "../actions";
import Header from "./Header";
import Footer from "./Footer";
import LoadButton from "./LoadButton";
import LoadingIndicator from "@natlibfi/ekirjasto-web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import { stateSelector } from "../reducers/allWorks";
import title from "../utils/title";
import { RootState } from "../store";

const columns = [
  ["title", "Title"],
  ["author", "Author"],
  ["published_year", "Publish year"],
  ["language", "Language"],
  ["format", "Format"],
  ["license_pool_status", "Licensepool status"],
  ["licenses_owned", "Licenses"],
  ["patrons_in_hold_queue", "Patron hold queue"],
] as const;

export default function AllWorksPage(props: {
  params: { library: string };
}): JSX.Element {
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
    published_year: "",
    language: "",
    format: "",
    status: "",
    licenses_owned_min: "",
    licenses_owned_max: "",
    patrons_in_hold_queue_min: "",
    patrons_in_hold_queue_max: "",
  });
  const [sort, setSort] = useState("title");
  const [direction, setDirection] = useState("asc");

  const load = (offset = 0, append = false) => {
    dispatch(
      new ActionCreator().fetchAllWorks(
        props.params.library,
        { ...filters, sort, direction, offset },
        append
      ) as any
    );
  };

  useEffect(() => {
    document.title = title("Koko kokoelma");
    load();
  }, [sort, direction]);

  useEffect(() => {
    dispatch(new ActionCreator().fetchLanguages() as any);
  }, []);

  const updateFilter = (name: string, value: string) => {
    const next = { ...filters, [name]: value };
    setFilters(next);
    window.setTimeout(
      () =>
        dispatch(
          new ActionCreator().fetchAllWorks(
            props.params.library,
            { ...next, sort, direction, offset: 0 },
            false
          ) as any
        ),
      0
    );
  };

  const rows = data?.works || [];
  const canLoadMore = !!data?.has_more;
  const sortLabel = useMemo(
    () => columns.find(([key]) => key === sort)?.[1] || sort,
    [sort]
  );

  return (
    <div className="all-works">
      <Header />
      <main className="body">
        <h1>Koko kokoelma</h1>
        <p>{data ? `${data.total} works, sorted by ${sortLabel}` : ""}</p>
        {fetchError && <ErrorMessage error={fetchError} />}
        {isFetching && !data && <LoadingIndicator />}
        <table className="table table-striped">
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>
                  <div className="all-works-column-heading">
                    <span className="all-works-column-title">{label}</span>
                    <div className="all-works-column-filter">
                      {key === "license_pool_status" ? (
                        <select
                          aria-label={`Filter by ${label}`}
                          value={filters.status}
                          onChange={(event) =>
                            updateFilter("status", event.target.value)
                          }
                        >
                          <option value="">All</option>
                          <option value="active">Active</option>
                          <option value="exhausted">Exhausted</option>
                          <option value="no_licenses">No licenses</option>
                          <option value="no_pool">No pool</option>
                        </select>
                      ) : key === "language" ? (
                        <select
                          aria-label={`Filter by ${label}`}
                          value={filters.language}
                          onChange={(event) =>
                            updateFilter("language", event.target.value)
                          }
                        >
                          <option value="">All</option>
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
                          <option value="">All</option>
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
                      ) : key === "licenses_owned" ||
                        key === "patrons_in_hold_queue" ? (
                        <span>
                          <input
                            aria-label={`${label} minimum`}
                            type="number"
                            placeholder="Min"
                            value={filters[`${key}_min`]}
                            onChange={(event) =>
                              updateFilter(`${key}_min`, event.target.value)
                            }
                          />
                          <input
                            aria-label={`${label} maximum`}
                            type="number"
                            placeholder="Max"
                            value={filters[`${key}_max`]}
                            onChange={(event) =>
                              updateFilter(`${key}_max`, event.target.value)
                            }
                          />
                        </span>
                      ) : (
                        <input
                          aria-label={`Filter by ${label}`}
                          type={key === "published_year" ? "number" : "text"}
                          value={filters[key]}
                          onChange={(event) =>
                            updateFilter(key, event.target.value)
                          }
                        />
                      )}
                    </div>
                    <span className="all-works-sort-controls">
                      <button
                        type="button"
                        aria-label={`Sort ${label} ascending`}
                        aria-pressed={sort === key && direction === "asc"}
                        className={
                          sort === key && direction === "asc" ? "active" : ""
                        }
                        onClick={() => {
                          setSort(key);
                          setDirection("asc");
                        }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label={`Sort ${label} descending`}
                        aria-pressed={sort === key && direction === "desc"}
                        className={
                          sort === key && direction === "desc" ? "active" : ""
                        }
                        onClick={() => {
                          setSort(key);
                          setDirection("desc");
                        }}
                      >
                        ▼
                      </button>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((work) => (
              <tr key={work.id}>
                <td>{work.title}</td>
                <td>{work.author}</td>
                <td>{work.published_year}</td>
                <td>{work.language}</td>
                <td>{work.format}</td>
                <td>{work.license_pool_status}</td>
                <td>{work.licenses_owned}</td>
                <td>{work.patrons_in_hold_queue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {canLoadMore && data && (
          <LoadButton
            isFetching={isFetching}
            loadMore={() => load(data.offset + data.limit, true)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
