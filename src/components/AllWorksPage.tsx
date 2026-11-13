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
        <div className="all-works-filters">
          {columns.map(([key, label]) => (
            <label key={key}>
              {label}
              {key === "license_pool_status" ? (
                <select
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
              ) : key === "licenses_owned" ||
                key === "patrons_in_hold_queue" ? (
                <span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters[`${key}_min`]}
                    onChange={(event) =>
                      updateFilter(`${key}_min`, event.target.value)
                    }
                  />
                  <input
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
                  type={key === "published_year" ? "number" : "text"}
                  value={filters[key]}
                  onChange={(event) => updateFilter(key, event.target.value)}
                />
              )}
            </label>
          ))}
          <label>
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {columns.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setDirection(direction === "asc" ? "desc" : "asc")}
          >
            {direction === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
        {fetchError && <ErrorMessage error={fetchError} />}
        {isFetching && !data && <LoadingIndicator />}
        <table className="table table-striped">
          <thead>
            <tr>
              {columns.map(([, label]) => (
                <th key={label}>{label}</th>
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
