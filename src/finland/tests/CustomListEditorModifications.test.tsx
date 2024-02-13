import * as React from "react";
import { render, screen } from "@testing-library/react";
import { stub } from "sinon";
import CustomListEditor from "../../components/CustomListEditor";

// This test set is for testing E-kirjasto modifications in CustomListEditor component.
// The component itself is tested in src/components/__tests__/CustomListEditor-test.tsx

function doNothing() {
  /* do nothing */
}

const editorProps = {
  collections: [
    {
      id: 1,
      name: "collection 1",
      protocol: "protocol",
      libraries: [{ short_name: "library" }],
    },
  ],
  entries: {
    baseline: [],
    baselineTotalCount: 0,
    added: {},
    removed: {},
    current: [],
    currentTotalCount: 0,
  },
  entryPoints: ["Book", "Audio"],
  isFetchingMoreCustomListEntries: false,
  isFetchingSearchResults: false,
  isFetchingMoreSearchResults: false,
  languages: undefined,
  library: undefined,
  listId: "1",
  loadMoreEntries: doNothing,
  loadMoreSearchResults: doNothing,
  properties: {
    name: "test",
    collections: [1],
    autoUpdate: false,
  },
  save: doNothing,
  search: doNothing,
  share: stub(),
  searchParams: {
    entryPoint: "All",
    terms: "",
    sort: null,
    language: "all",
    advanced: {
      include: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
      exclude: {
        query: null,
        selectedQueryId: null,
        clearFilters: null,
      },
    },
  },
};

describe("CustomListEditor Modifications", () => {
  Element.prototype.scrollTo = doNothing;

  it("renders Sharing and Add from collections sections when not in E-kirjasto", () => {
    render(<CustomListEditor isEkirjasto={false} {...editorProps} />);
    const sharingElement = screen.queryByText("Sharing");
    expect(sharingElement).toBeInTheDocument();
    const collectionElement = screen.queryByText("Add from collections");
    expect(collectionElement).toBeInTheDocument();
  });

  it("does not render Sharing and Add from collections sections in E-kirjasto", () => {
    render(<CustomListEditor {...editorProps} />);
    const sharingElement = screen.queryByText("Sharing");
    expect(sharingElement).not.toBeInTheDocument();
    const collectionElement = screen.queryByText("Add from collections");
    expect(collectionElement).not.toBeInTheDocument();
  });
});
