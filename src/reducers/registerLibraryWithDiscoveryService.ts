import { RequestError } from "@natlibfi/ekirjasto-web-opds-client/lib/DataFetcher";
import ActionCreator from "../actions";
import createRegisterLibraryReducer from "./createRegisterLibraryReducer";

export default createRegisterLibraryReducer(
  ActionCreator.REGISTER_LIBRARY_WITH_DISCOVERY_SERVICE
);
