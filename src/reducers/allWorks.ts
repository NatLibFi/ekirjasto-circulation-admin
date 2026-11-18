import { RequestError } from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { RootState } from "../store";

export interface AllWork {
  id: number;
  admin_url?: string;
  title: string;
  author: string;
  published_year: number | null;
  language: string;
  format: string;
  license_pool_status: string;
  licenses_owned: number;
  patrons_in_hold_queue: number;
  series: string | null;
  series_position: number | null;
  duration: number | null;
  number_of_pages: number | null;
  awards: string[];
  title_created_date: string | null;
  data_source_modified: string | null;
  original_published_year: number | null;
  original_language: string | null;
  original_title: string | null;
  keywords: string[];
  genres: string[];
  fiction: boolean | null;
  audience: string | null;
  target_age: string | null;
}

export interface AllWorksData {
  works: AllWork[];
  genre_options: { value: string; label: string }[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface AllWorksState {
  data: AllWorksData | null;
  isFetching: boolean;
  fetchError: RequestError | null;
  requestId?: number;
  dataQueryKey?: string;
  library?: string;
}

const initialState: AllWorksState = {
  data: null,
  isFetching: false,
  fetchError: null,
};

export const stateSelector = {
  data: (state: RootState) => state.editor.allWorks.data,
  isFetching: (state: RootState) => state.editor.allWorks.isFetching,
  fetchError: (state: RootState) => state.editor.allWorks.fetchError,
};

export default (state: AllWorksState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.ALL_WORKS_REQUEST:
      return {
        ...state,
        isFetching: true,
        fetchError: null,
        requestId: action.requestId,
        library: action.library,
        data: state.library === action.library ? state.data : null,
      };
    case ActionCreator.ALL_WORKS_LOAD:
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        data: {
          ...action.data,
          total:
            action.data.total ??
            (action.queryKey === state.dataQueryKey ? state.data?.total : 0) ??
            0,
        },
        isFetching: false,
        fetchError: null,
        dataQueryKey: action.queryKey,
      };
    case ActionCreator.ALL_WORKS_FAILURE:
      if (action.requestId !== state.requestId) return state;
      return { ...state, isFetching: false, fetchError: action.error };
    default:
      return state;
  }
};
