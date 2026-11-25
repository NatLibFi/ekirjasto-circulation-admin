import { useEffect, useReducer, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionCreator from "../../actions";
import { RootState } from "../../store";
import {
  apiMetadataFilters,
  FilterKey,
  OptionalKey,
  SortDirection,
  SortKey,
  WorkFilters,
  WorkQueryParams,
} from "../../utils/allWorks";

interface QueryState {
  filters: WorkFilters;
  sort: SortKey;
  direction: SortDirection;
  selectedColumns: OptionalKey[];
  request: { params: WorkQueryParams; delay: number };
}

type QueryAction =
  | { type: "filter"; key: FilterKey; value: string; debounce: boolean }
  | { type: "sort"; key: SortKey }
  | { type: "column"; key: OptionalKey }
  | { type: "page"; offset: number };

export const initialQueryState: QueryState = {
  filters: {},
  sort: "title",
  direction: "asc",
  selectedColumns: [],
  request: {
    params: { sort: "title", direction: "asc", offset: 0, include_total: 1 },
    delay: 0,
  },
};

export function queryReducer(
  state: QueryState,
  action: QueryAction
): QueryState {
  let next = state;
  let delay = 0;
  switch (action.type) {
    case "filter":
      next = {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
      };
      delay = action.debounce ? 250 : 0;
      break;
    case "sort":
      next = {
        ...state,
        sort: action.key,
        direction:
          state.sort === action.key && state.direction === "asc"
            ? "desc"
            : "asc",
      };
      break;
    case "column": {
      if (!state.selectedColumns.includes(action.key)) {
        // Showing a column does not change the server query.
        return {
          ...state,
          selectedColumns: [...state.selectedColumns, action.key],
        };
      }
      const filters = { ...state.filters };
      Object.keys(filters)
        .filter((key) => key === action.key || key.startsWith(`${action.key}_`))
        .forEach((key) => delete filters[key]);
      next = {
        ...state,
        filters,
        selectedColumns: state.selectedColumns.filter(
          (key) => key !== action.key
        ),
        sort: state.sort === action.key ? "title" : state.sort,
        direction: state.sort === action.key ? "asc" : state.direction,
      };
      break;
    }
    case "page":
      return {
        ...state,
        request: {
          params: {
            ...state.request.params,
            offset: Math.max(0, action.offset),
            include_total: 0,
          },
          delay: 0,
        },
      };
  }
  return {
    ...next,
    request: {
      params: {
        ...apiMetadataFilters(next.filters),
        sort: next.sort,
        direction: next.direction,
        offset: 0,
        include_total: 1,
      },
      delay,
    },
  };
}

export default function useAllWorksQuery(library: string) {
  const dispatch = useDispatch();
  const result = useSelector((state: RootState) => state.editor.allWorks);
  const [query, update] = useReducer(queryReducer, initialQueryState);
  const requestedLibrary = useRef<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    setPending(true);
    const libraryChanged = requestedLibrary.current !== library;
    const params = libraryChanged
      ? { ...query.request.params, offset: 0, include_total: 1 }
      : query.request.params;
    const fetchWorks = () => {
      requestedLibrary.current = library;
      Promise.resolve(
        dispatch(new ActionCreator().fetchAllWorks(library, params) as any)
      )
        .catch(() => undefined) // The reducer owns the request error.
        .finally(() => {
          if (active) setPending(false);
        });
    };
    const timer =
      query.request.delay && !libraryChanged
        ? window.setTimeout(fetchWorks, query.request.delay)
        : null;
    if (timer === null) fetchWorks();
    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [dispatch, library, query.request]);

  return {
    ...query,
    data: result.library === library ? result.data : null,
    fetchError: result.library === library ? result.fetchError : null,
    isFetching: result.isFetching || pending,
    updateFilter: (key: FilterKey, value: string, debounce = false) =>
      update({ type: "filter", key, value, debounce }),
    changeSort: (key: SortKey) => update({ type: "sort", key }),
    toggleColumn: (key: OptionalKey) => update({ type: "column", key }),
    loadPage: (offset: number) => update({ type: "page", offset }),
  };
}
