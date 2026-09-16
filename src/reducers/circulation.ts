import { CirculationData } from "../interfaces";
import { RequestError } from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";

export interface CirculationState {
  data: CirculationData;
  isFetching: boolean;
  fetchError: RequestError;
}

const initialState: CirculationState = {
  data: null,
  isFetching: false,
  fetchError: null,
};

export default (
  state: CirculationState = initialState,
  action
): CirculationState => {
  switch (action.type) {
    case ActionCreator.CIRCULATION_REQUEST:
      return Object.assign({}, state, {
        data: null,
        isFetching: true,
        fetchError: null,
      });

    case ActionCreator.CIRCULATION_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
      });

    case ActionCreator.CIRCULATION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        fetchError: action.error,
      });

    default:
      return state;
  }
};
