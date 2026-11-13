import { RequestError } from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import { RootState } from "../store";

export interface AllWork {
  id: number;
  title: string;
  author: string;
  published_year: number | null;
  language: string;
  format: string;
  license_pool_status: string;
  licenses_owned: number;
  patrons_in_hold_queue: number;
}

export interface AllWorksData {
  works: AllWork[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface AllWorksState {
  data: AllWorksData;
  isFetching: boolean;
  fetchError: RequestError;
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
      return { ...state, isFetching: true, fetchError: null };
    case ActionCreator.ALL_WORKS_LOAD:
      return {
        ...state,
        data:
          action.append && state.data
            ? {
                ...action.data,
                works: state.data.works.concat(action.data.works),
              }
            : action.data,
        isFetching: false,
      };
    case ActionCreator.ALL_WORKS_FAILURE:
      return { ...state, isFetching: false, fetchError: action.error };
    default:
      return state;
  }
};
