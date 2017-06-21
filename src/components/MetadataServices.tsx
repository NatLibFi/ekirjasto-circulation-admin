import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { MetadataServicesData, MetadataServiceData } from "../interfaces";
import MetadataServiceEditForm from "./MetadataServiceEditForm";

export class MetadataServices extends EditableConfigList<MetadataServicesData, MetadataServiceData> {
  EditForm = MetadataServiceEditForm;
  listDataKey = "metadata_services";
  itemTypeName = "metadata service";
  urlBase = "/admin/web/config/metadata/";
  identifierKey = "id";
  labelKey = "protocol";

  label(item): string {
    for (const protocol of this.props.data.protocols) {
      if (protocol.name === item.protocol) {
        return protocol.label;
      }
    }
    return item.protocol;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.metadataServices && state.editor.metadataServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.metadataServices.fetchError,
    isFetching: state.editor.metadataServices.isFetching || state.editor.metadataServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchMetadataServices()),
    editItem: (data: FormData) => dispatch(actions.editMetadataService(data))
  };
}

const ConnectedMetadataServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(MetadataServices);

export default ConnectedMetadataServices;