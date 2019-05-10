import * as React from "react";
import { Store } from "redux";
import * as PropTypes from "prop-types";
import Header from "./Header";
import { State } from "../reducers/index";
import DiagnosticsTabContainer from "./DiagnosticsTabContainer";


export interface DiagnosticsPageContext {
  editorStore: Store<State>;
  csrfToken: string;
}

export interface DiagnosticsPageState {
  tab: string;
}

export default class DiagnosticsPage extends React.Component<{}, DiagnosticsPageState> {
  context: DiagnosticsPageContext;

  static contextTypes: React.ValidationMap<DiagnosticsPageContext> = {
    editorStore: PropTypes.object.isRequired,
    csrfToken: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { tab: "coverage_provider" };
    this.goToTab = this.goToTab.bind(this);
  }

  componentWillMount() {
    document.title = "Circulation Manager - Diagnostics";
  }

  render(): JSX.Element {
    return(
      <div className="diagnostics-page">
        <Header />
        <div className="body">
          <h2>Diagnostics</h2>
          <DiagnosticsTabContainer
            class="service-types"
            store={this.context.editorStore}
            csrfToken={this.context.csrfToken}
            tab={this.state.tab}
            goToTab={this.goToTab}
          />
        </div>
      </div>
    );
  }

  goToTab(tab: string) {
    this.setState({ tab });
  }

}
