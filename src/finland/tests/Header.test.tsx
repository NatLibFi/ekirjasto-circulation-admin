import * as React from "react";
import { render, screen } from "@testing-library/react";
import * as PropTypes from "prop-types";
import { Provider } from "react-redux";
import { Router, Route, browserHistory } from "react-router";
import configureStore from "redux-mock-store";
import Header from "../../components/Header";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const initialState = {
  editor: {
    libraries: {
      isFetching: true,
    },
  },
};
const store = mockStore(initialState);

jest.mock(
  "../../images/PalaceCollectionManagerLogo.svg",
  () => "mocked-image-url"
);

const testLibraryData = {
  uuid: "test_library",
  name: "test_library",
  short_name: "test_library",
};

class TestRouterContextWrapper extends React.Component<{
  hasLibrary: boolean;
}> {
  getChildContext() {
    return {
      editorStore: {
        isFetching: true,
        data: {
          libraries: [testLibraryData],
        },
      },
      library: () => (this.props.hasLibrary ? testLibraryData : null),
      admin: {
        isLibraryManager: () => true,
        isSystemAdmin: () => false,
        isLibraryManagerOfSomeLibrary: () => true,
      },
    };
  }
  static childContextTypes = {
    editorStore: PropTypes.object.isRequired,
    admin: PropTypes.object.isRequired,
    library: PropTypes.object.isRequired,
  };

  render() {
    return this.props.children;
  }
}

describe("Header Component", () => {
  it("renders the 'Tilastot' link if a library is selected", () => {
    render(
      <TestRouterContextWrapper hasLibrary>
        <Provider store={store}>
          <Router history={browserHistory} location="/admin">
            <Route path="/" component={Header} />
          </Router>
        </Provider>
      </TestRouterContextWrapper>
    );
    const statsLinkElement = screen.queryByText("Tilastot");
    expect(statsLinkElement).toBeInTheDocument();
  });

  it("does not render the 'Tilastot' link if library is not selected", () => {
    render(
      <TestRouterContextWrapper hasLibrary={false}>
        <Provider store={store}>
          <Router history={browserHistory} location="/admin">
            <Route path="/" component={Header} />
          </Router>
        </Provider>
      </TestRouterContextWrapper>
    );
    const statsLinkElement = screen.queryByText("Tilastot");
    expect(statsLinkElement).not.toBeInTheDocument();
  });
});
