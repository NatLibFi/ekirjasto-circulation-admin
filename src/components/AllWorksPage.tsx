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
import useAllWorksQuery from "./allWorks/useAllWorksQuery";

import { optionalColumns, workColumns } from "../utils/allWorks";
import WorkListAction from "./allWorks/WorkListAction";
import AllWorksTable from "./allWorks/AllWorksTable";
import AllWorksPagination from "./allWorks/AllWorksPagination";
export { bookDetailsHref } from "../utils/allWorks";

function AllWorksContent(props: {
  params: { library: string };
  csrfToken?: string;
}): JSX.Element {
  const dispatch = useDispatch();
  const {
    data,
    isFetching,
    fetchError,
    filters,
    sort,
    direction,
    selectedColumns,
    toggleColumn,
    changeSort,
    loadPage,
    updateFilter: changeFilter,
  } = useAllWorksQuery(props.params.library);
  const genreTree = useSelector(
    (state: RootState) => state.editor.classifications.genreTree
  );
  const customLists = useSelector(
    (state: RootState) => state.editor.customLists.data?.custom_lists || []
  );
  const [listLoadError, setListLoadError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setListLoadError(null);
    Promise.resolve(
      dispatch(
        new ActionCreator().fetchCustomLists(props.params.library) as any
      )
    ).catch(() => {
      if (active) setListLoadError("Listojen lataus epäonnistui.");
    });
    return () => {
      active = false;
    };
  }, [dispatch, props.params.library]);

  useEffect(() => {
    document.title = title("Kirjaluettelo");
    Promise.resolve(
      dispatch(new ActionCreator().fetchGenreTree("/admin/genres") as any)
    ).catch(() => undefined);
  }, [dispatch]);

  const rows = data?.works || [];
  const visibleColumns = useMemo(
    () =>
      workColumns.filter(
        (column) =>
          !column.optional ||
          selectedColumns.includes(column.key as typeof selectedColumns[number])
      ),
    [selectedColumns]
  );
  const sortLabel =
    workColumns.find((column) => column.key === sort)?.label || sort;

  return (
    <div className="all-works">
      <Header />
      <main className="body">
        <h1>Kirjaluettelo</h1>
        <p>
          {data ? `${data.total} kirjaa, Lajitteluperuste: ${sortLabel}` : ""}
        </p>
        {fetchError && <ErrorMessage error={fetchError} />}
        {listLoadError && <p role="alert">{listLoadError}</p>}
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
        <AllWorksPagination
          data={data}
          isFetching={isFetching}
          position="top"
          onPage={loadPage}
        />
        <AllWorksTable
          library={props.params.library}
          columns={visibleColumns}
          rows={rows}
          filters={filters}
          sort={sort}
          direction={direction}
          languages={data?.language_options}
          genreTree={genreTree}
          genreOptions={data?.genre_options}
          onFilter={changeFilter}
          onSort={changeSort}
          renderListAction={(work) => (
            <WorkListAction
              key={`${props.params.library}/${work.id}`}
              work={work}
              customLists={customLists}
              csrfToken={props.csrfToken}
            />
          )}
        />
        <AllWorksPagination
          data={data}
          isFetching={isFetching}
          position="bottom"
          onPage={loadPage}
        />
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
