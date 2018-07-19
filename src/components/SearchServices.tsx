import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { SearchServicesData, SearchServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for search services on the system configuration page.
    Shows a list of current search services and allows creating a new
    service or editing or deleting an existing service. */
export class SearchServices extends EditableConfigList<SearchServicesData, SearchServiceData> {
  EditForm = ServiceEditForm;
  AdditionalContent = null;
  listDataKey = "search_services";
  itemTypeName = "search service";
  urlBase = "/admin/web/config/search/";
  identifierKey = "id";
  labelKey = "protocol";
  limitOne = true;
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.searchServices && state.editor.searchServices.data || {});
  return {
    data: data,
    editedIdentifier: state.editor.searchServices && state.editor.searchServices.editedIdentifier,
    fetchError: state.editor.searchServices.fetchError,
    isFetching: state.editor.searchServices.isFetching || state.editor.searchServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchSearchServices()),
    editItem: (data: FormData) => dispatch(actions.editSearchService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteSearchService(identifier))
  };
}

const ConnectedSearchServices = connect<EditableConfigListStateProps<SearchServicesData>, EditableConfigListDispatchProps<SearchServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SearchServices);

export default ConnectedSearchServices;
