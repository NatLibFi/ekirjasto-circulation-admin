import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { CatalogServices } from "../CatalogServices";

describe("CatalogServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  const data = {
    catalog_services: [
      {
        id: 2,
        protocol: "test protocol",
        settings: {
          test_setting: "test setting",
        },
        libraries: [
          {
            short_name: "nypl",
            test_library_setting: "test library setting",
          },
        ],
        name: "nypl catalog",
      },
    ],
    protocols: [
      {
        name: "test protocol",
        label: "test protocol label",
        settings: [],
      },
    ],
    allLibraries: [
      {
        short_name: "nypl",
      },
    ],
  };

  const pause = () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );

    wrapper = mount(
      <CatalogServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />
    );
  });

  it("shows catalog service list", () => {
    const catalogService = wrapper.find("li");
    expect(catalogService.length).to.equal(1);
    expect(catalogService.at(0).text()).to.contain(
      "nypl catalog: test protocol label"
    );
    const editLink = catalogService.at(0).find("a").at(0);
    expect(editLink.props().href).to.equal(
      "/admin/web/config/catalogServices/edit/2"
    );
  });
});
