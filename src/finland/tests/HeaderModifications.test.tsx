import * as React from "react";
import * as PropTypes from "prop-types";

import { fireEvent, render, screen } from "@testing-library/react";

import { Header } from "../../components/Header";

// This test set is for testing E-kirjasto modifications in Header component.
// The component itself is tested in src/components/__tests__/Header-test.tsx

jest.mock(
  "../../images/PalaceCollectionManagerLogo.svg",
  () => "mocked-image-url"
);

const testLibraryData = {
  uuid: "test_library",
  name: "test_library",
  short_name: "test_library",
};

class ContextWrapper extends React.Component<{
  hasLibrary: boolean;
  isEkirjastoUser: boolean;
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
        email: "test@example.com",
        isLibraryManager: () => true,
        isSystemAdmin: () => true,
        isLibraryManagerOfSomeLibrary: () => true,
        isEkirjastoUser: () => this.props.isEkirjastoUser,
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

describe("Header Modifications", () => {
  it("renders the 'Tilastot' link if a library is selected", () => {
    render(
      <ContextWrapper hasLibrary isEkirjastoUser>
        <Header />
      </ContextWrapper>
    );
    const linkElement = screen.queryByText("Tilastot");
    expect(linkElement).toBeInTheDocument();
  });

  it("does not render the 'Tilastot' link if library is not selected", () => {
    render(
      <ContextWrapper hasLibrary={false} isEkirjastoUser={false}>
        <Header />
      </ContextWrapper>
    );
    const linkElement = screen.queryByText("Tilastot");
    expect(linkElement).not.toBeInTheDocument();
  });

  it("does not render hidden Dashboard and Patrons links in E-kirjasto", () => {
    render(
      <ContextWrapper hasLibrary isEkirjastoUser>
        <Header />
      </ContextWrapper>
    );
    const linkElement = screen.queryByText("Dashboard");
    expect(linkElement).not.toBeInTheDocument();

    const linkElement2 = screen.queryByText("Patrons");
    expect(linkElement2).not.toBeInTheDocument();
  });

  it("does not render 'Change password' link for E-kirjasto user", () => {
    render(
      <ContextWrapper hasLibrary isEkirjastoUser>
        <Header isEkirjasto={true} />
      </ContextWrapper>
    );

    fireEvent.click(screen.queryByText("test@example.com"));
    expect(screen.queryByText("Sign out")).toBeInTheDocument();
    expect(screen.queryByText("Change password")).not.toBeInTheDocument();
  });

  it("renders 'Change password' link for password based user", () => {
    render(
      <ContextWrapper hasLibrary isEkirjastoUser={false}>
        <Header isEkirjasto={true} />
      </ContextWrapper>
    );

    fireEvent.click(screen.queryByText("test@example.com"));
    expect(screen.queryByText("Change password")).toBeVisible();
  });

  it("renders Dashboard and Patrons links if not in E-kirjasto", () => {
    render(
      <ContextWrapper hasLibrary isEkirjastoUser>
        <Header isEkirjasto={false} />
      </ContextWrapper>
    );

    const linkElement = screen.queryByText("Dashboard");
    expect(linkElement).toBeInTheDocument();

    const linkElement2 = screen.queryByText("Patrons");
    expect(linkElement2).toBeInTheDocument();
  });
});
