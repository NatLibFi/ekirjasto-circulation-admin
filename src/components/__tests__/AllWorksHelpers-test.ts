import { expect } from "chai";
import { AllWork } from "../../reducers/allWorks";
import {
  apiMetadataFilters,
  metadataValue,
  bookListsUrl,
  serializeWorkQuery,
  workQueryKey,
  workColumns,
} from "../../utils/allWorks";

describe("All Works helpers", () => {
  it("converts duration bounds from hours without mutating input", () => {
    const filters = { duration_min: "1.5", duration_max: "", title: "Book" };
    expect(apiMetadataFilters(filters)).to.deep.equal({
      duration_min: "5400",
      duration_max: "",
      title: "Book",
    });
    expect(filters.duration_min).to.equal("1.5");
  });

  it("formats missing, zero, boolean, list and duration metadata", () => {
    const work = {
      duration: 5400,
      fiction: false,
      licenses_owned: 0,
      keywords: ["one", "two"],
      series: "Series",
      series_position: 0,
      published_year: null,
    } as AllWork;
    expect(metadataValue(work, "duration")).to.equal("1 h 30 min");
    expect(metadataValue(work, "fiction")).to.equal("Tietokirjallisuus");
    expect(metadataValue(work, "licenses_owned")).to.equal("0");
    expect(metadataValue(work, "keywords")).to.equal("one, two");
    expect(metadataValue(work, "series")).to.equal("Series #0");
    expect(metadataValue(work, "published_year")).to.equal("");
  });

  it("constructs list URLs and rejects unrelated URLs", () => {
    expect(
      bookListsUrl("https://example.org/lib/admin/works/ISBN/123/")
    ).to.equal("/admin/works/ISBN/123/lists");
    expect(bookListsUrl()).to.equal(null);
    expect(bookListsUrl("/unrelated")).to.equal(null);
  });

  it("encodes query values, skips empty parameters and retains zero", () => {
    expect(
      serializeWorkQuery({
        title: "A & B",
        author: "",
        offset: 0,
        format: undefined,
      })
    ).to.equal("offset=0&title=A%20%26%20B");
  });

  it("keys totals by library and query, independently of pagination", () => {
    expect(
      workQueryKey("lib", { title: "A", offset: 0, include_total: 1 })
    ).to.equal(
      workQueryKey("lib", { offset: 20, include_total: 0, title: "A" })
    );
    expect(workQueryKey("other", { title: "A" })).not.to.equal(
      workQueryKey("lib", { title: "A" })
    );
    expect(workQueryKey("lib", { title: "B" })).not.to.equal(
      workQueryKey("lib", { title: "A" })
    );
  });

  it("defines status mapping and distinct date and duration filters", () => {
    expect(
      workColumns.find((column) => column.key === "license_pool_status")
        .filterKey
    ).to.equal("status");
    expect(
      workColumns.find((column) => column.key === "title_created_date")
        .filterKind
    ).to.equal("dateRange");
    expect(
      workColumns.find((column) => column.key === "duration").filterKind
    ).to.equal("numberRange");
  });
});
