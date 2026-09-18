import { expect } from "chai";

import * as React from "react";
import { mount, shallow } from "enzyme";

import LicensePool from "../bookdetails/LicensePool";
import { CirculationData } from "../../interfaces";

const circulationData: CirculationData = {
  identifier: { identifier: "urn:isbn:9780000000000", type: "isbn" },
  license_pools: [
    {
      availability_time: "2024-01-02T00:00:00Z",
      collection: { id: 1, name: "E-kirjasto" },
      data_source: { id: 2, name: "Overdrive" },
      holds: [
        {
          end: "2024-01-05T12:30:00Z",
          id: 301,
          license_id: 201,
          position: 1,
          start: "2024-01-04T12:30:00Z",
        },
      ],
      pool_id: 101,
      pool_identifier: { identifier: "pool-identifier", type: "text" },
      licenses: [
        {
          checkout_url: "https://example.com/checkout/201",
          checkouts_available: 2,
          checkouts_left: 8,
          currently_available_loans: 1,
          expires: "2024-12-31T00:00:00Z",
          id: 201,
          identifier: "license-identifier",
          is_inactive: false,
          is_loan_limited: true,
          is_missing: false,
          is_perpetual: false,
          is_time_limited: true,
          last_checked: "2024-01-03T00:00:00Z",
          loans: [
            {
              end: "2024-01-10T14:00:00Z",
              id: 401,
              license_id: 201,
              start: "2024-01-03T14:00:00Z",
            },
          ],
          status: "available",
          terms_concurrency: 5,
          total_remaining_loans: 2,
        },
      ],
      licenses_available: 2,
      licenses_owned: 5,
      licenses_reserved: 1,
      open_access: false,
      patrons_in_hold_queue: 1,
      presentation_edition_id: 501,
      suppressed: false,
      unlimited_access: false,
    },
  ],
};

describe("LicensePool", () => {
  it("shows the license pool, license, loan, and hold data", () => {
    const wrapper = mount(<LicensePool data={circulationData} />);

    expect(wrapper.find(".license-pool-information > h2").text()).to.equal(
      "License pool information"
    );
    expect(rowValue(wrapper, "licensepool-created")).to.equal("January 2, 2024");
    expect(rowValue(wrapper, "licenses-owned-(total-concurrency)")).to.equal(
      "5"
    );
    expect(rowValue(wrapper, "licenses-available")).to.equal("2");
    expect(rowValue(wrapper, "holds")).to.equal("1");
    expect(rowValue(wrapper, "holds-to-concurrency-ratio")).to.equal("20.0%");
    expect(rowValue(wrapper, "licenses-reserved-(ready-to-checkout)")).to.equal(
      "1"
    );
    expect(rowValue(wrapper, "open-access")).to.equal("false");
    expect(rowValue(wrapper, "unlimited-access")).to.equal("false");
    expect(rowValue(wrapper, "hidden")).to.equal("false");

    expect(wrapper.find(".license-information-section h2").text()).to.equal(
      "Licenses (1)"
    );
    expect(wrapper.find("caption").map((caption) => caption.text())).to.deep.equal([
      "Hold (1)",
      "License (1)",
      "Loan (1)",
    ]);
    expect(wrapper.find("summary").map((summary) => summary.text())).to.deep.equal([
      "Holds (1)",
      "Show more",
      "Active Loans (1)",
    ]);
    expect(wrapper.find(".license-information").text()).to.contain(
      "available"
    );
    expect(wrapper.find(".license-additional-fields").text()).to.contain(
      "https://example.com/checkout/201"
    );
  });

  it("calculates the holds to concurrency ratio", () => {
    const wrapper = mount(
      <LicensePool
        data={{
          ...circulationData,
          license_pools: [
            {
              ...circulationData.license_pools[0],
              licenses_owned: 8,
              patrons_in_hold_queue: 3,
            },
          ],
        }}
      />
    );

    expect(rowValue(wrapper, "holds-to-concurrency-ratio")).to.equal("37.5%");
  });

  it("shows loading status before circulation data arrives", () => {
    const wrapper = shallow(<LicensePool isFetching={true} />);

    expect(wrapper.text()).to.contain("StatusLoading…");
  });

  it("shows an error status when circulation data cannot be loaded", () => {
    const wrapper = shallow(
      <LicensePool fetchError={{ status: 500, response: "error" } as any} />
    );

    expect(wrapper.text()).to.contain(
      "StatusLicense pool information could not be loaded"
    );
  });

  it("shows an empty state when no license pools are returned", () => {
    const wrapper = shallow(
      <LicensePool
        data={{
          identifier: circulationData.identifier,
          license_pools: [],
        }}
      />
    );

    expect(wrapper.text()).to.contain("License pools—");
  });
});

function rowValue(wrapper, className: string): string {
  return wrapper
    .find("tr")
    .filterWhere((row) => row.hasClass(className))
    .find("td")
    .first()
    .text();
}
