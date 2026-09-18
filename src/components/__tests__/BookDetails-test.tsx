import { expect } from "chai";
import { spy } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import BookDetails from "../bookdetails/BookDetails";
import BookCoverContainer from "../bookdetails/BookCoverContainer";
import BookDetailsTableSection from "../bookdetails/BookDetailsTableSection";
import LicensePool from "../bookdetails/LicensePool";
import SummaryContainer from "../SummaryContainer";
import { BookData } from "@natlibfi/ekirjasto-web-opds-client/lib/interfaces";
import { CirculationData } from "../../interfaces";

const book: BookData = {
  id: "urn:isbn:9780000000000",
  url: "http://circulation.librarysimplified.org/works/ISBN/11111111",
  title: "The Mayan Secrets",
  subtitle: "A Fargo Adventure",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: [{ name: "contributor 1", role: "nrt" }],
  summary: "<p>A summary of the book.</p>",
  imageUrl: "https://example.com/cover.jpg",
  openAccessLinks: [{ url: "secrets.epub", type: "application/epub+zip" }],
  publisher: "Penguin Publishing Group",
  published: "February 29, 2016",
  language: "en",
  raw: {
    category: [
      {
        $: {
          scheme: { value: "http://schema.org/audience" },
          label: { value: "Children" },
        },
      },
      {
        $: {
          scheme: { value: "http://schema.org/typicalAgeRange" },
          label: { value: "10-12" },
        },
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/fiction/" },
          label: { value: "Fiction" },
        },
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/",
          },
          label: { value: "Adventure" },
        },
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/",
          },
          label: { value: "Fantasy" },
        },
      },
    ],
    "bibframe:distribution": [
      {
        $: {
          "bibframe:ProviderName": { value: "Overdrive" },
        },
      },
    ],
    link: [],
  },
};

const circulationData: CirculationData = {
  identifier: { identifier: "book", type: "uri" },
  license_pools: [],
};

describe("BookDetails", () => {
  it("renders the book header and the new metadata components", () => {
    const wrapper = shallow(<BookDetails book={book} />);

    expect(wrapper.find(".custom-book-details").prop("lang")).to.equal("en");
    expect(wrapper.find("h1.title").text()).to.equal("The Mayan Secrets");
    expect(wrapper.find("p.subtitle").text()).to.equal("A Fargo Adventure");
    expect(wrapper.find(BookCoverContainer).prop("book")).to.equal(book);
    expect(wrapper.find(BookDetailsTableSection)).to.have.length(6);
    expect(wrapper.find(LicensePool)).to.have.length(1);
    expect(wrapper.find(".circulation-links").text()).to.equal("");
  });

  it("passes the book data into the titled table sections", () => {
    const bookWithDetails = Object.assign({}, book, {
      updated: "2023-01-02T00:00:00Z",
      issued: "2022-12-01",
      targetAgeRange: ["13-15"],
      copies: { total: 4, available: 2 },
      holds: { total: 3 },
      raw: Object.assign({}, book.raw, {
        "simplified:selected_by_patrons": "7",
        $: { "schema:additionalType": { value: "http://schema.org/EBook" } },
      }),
    });
    const wrapper = shallow(<BookDetails book={bookWithDetails} />);
    const sections = wrapper.find(BookDetailsTableSection);

    expect(sections.at(0).prop("title")).to.equal("Basic information");
    expect(sections.at(0).prop("rows")[0]).to.deep.equal([
      "Title",
      "The Mayan Secrets",
    ]);
    expect(sections.at(0).prop("rows")[2]).to.deep.equal([
      "ISBN",
      "9780000000000",
    ]);
    expect(sections.at(1).prop("rows")[0][1]).to.equal(null);
    expect(sections.at(1).prop("rows")[1][1]).to.deep.equal([
      "application/epub+zip",
    ]);
    expect(sections.at(2).prop("rows")[0][1]).to.deep.equal([
      "Adventure",
      "Fantasy",
    ]);
    expect(sections.at(2).prop("rows")[1][1]).to.equal("Children");
    expect(sections.at(2).prop("rows")[2][1]).to.deep.equal(["13-15"]);
    expect(sections.at(4).prop("rows")[0][1]).to.equal(7);
    expect(sections.at(5).prop("rows").map((row) => row[1])).to.deep.equal([
      4,
      2,
      3,
    ]);
  });

  it("renders the summary inside the basic information table", () => {
    const wrapper = shallow(<BookDetails book={book} />);
    const basicInformation = wrapper.find(BookDetailsTableSection).at(0).dive();

    expect(basicInformation.find(SummaryContainer)).to.have.length(1);
    expect(basicInformation.find(SummaryContainer).prop("summary")).to.equal(
      book.summary
    );
    expect(basicInformation.find(SummaryContainer).prop("language")).to.equal(
      book.language
    );
  });

  it("renders the cover through the cover component", () => {
    const wrapper = shallow(<BookDetails book={book} />);
    const cover = wrapper.find(BookCoverContainer).dive();

    expect(cover.find("img").prop("src")).to.equal(book.imageUrl);
    expect(cover.find("img").hasClass("custom-book-cover-image")).to.equal(
      true
    );
  });

  it("uses work entry data for accessibility and popularity values", () => {
    const workEntry = Object.assign({}, book, {
      accessibility: {
        conformance: { conformsTo: "WCAG 2.1 AA" },
        waysOfReading: { features: ["alternative text"] },
      },
      raw: { "simplified:selected_by_patrons": "11" },
    });
    const wrapper = shallow(<BookDetails book={book} workEntry={workEntry} />);
    const sections = wrapper.find(BookDetailsTableSection);

    expect(sections.at(3).prop("rows")).to.deep.equal([
      ["Conformance", "WCAG 2.1 AA"],
      ["Ways of reading", ["alternative text"]],
    ]);
    expect(sections.at(4).prop("rows")).to.deep.equal([
      ["Selected by patrons", 11],
    ]);
  });

  it("passes circulation state to the license pool component", () => {
    const fetchError = { status: 500, response: "error" } as any;
    const wrapper = shallow(
      <BookDetails
        book={book}
        circulationData={circulationData}
        circulationIsFetching={true}
        circulationFetchError={fetchError}
      />
    );
    const licensePool = wrapper.find(LicensePool);

    expect(licensePool.prop("data")).to.equal(circulationData);
    expect(licensePool.prop("isFetching")).to.equal(true);
    expect(licensePool.prop("fetchError")).to.equal(fetchError);
  });

  it("fetches circulation data on mount and when the book URL changes", () => {
    const fetchCirculationData = spy();
    const wrapper = shallow(
      <BookDetails
        book={book}
        bookUrl="http://example.com/works/ISBN/11111111"
        fetchCirculationData={fetchCirculationData}
      />
    );

    expect(fetchCirculationData.calledWith(
      "http://example.com/admin/works/ISBN/11111111/circulation_data"
    )).to.equal(true);

    wrapper.setProps({
      bookUrl: "http://example.com/works/3M/other-book",
    });
    expect(fetchCirculationData.calledWith(
      "http://example.com/admin/works/3M/other-book/circulation_data"
    )).to.equal(true);
  });

});
