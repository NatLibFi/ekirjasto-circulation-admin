import * as React from "react";
import { expect } from "chai";
import { mount, shallow } from "enzyme";
import { stub } from "sinon";
import { AllWork, AllWorksData } from "../../reducers/allWorks";
import { workColumns } from "../../utils/allWorks";
import AllWorksColumnFilter from "../allWorks/AllWorksColumnFilter";
import AllWorksTable from "../allWorks/AllWorksTable";
import AllWorksPagination from "../allWorks/AllWorksPagination";

const column = (key) => workColumns.find((item) => item.key === key);
const filterProps = {
  filters: {},
  rows: [],
  languages: {},
  genreTree: {},
  genreOptions: [],
  onFilter: () => undefined,
};

describe("All Works table controls", () => {
  it("reports text, dropdown and range changes with the appropriate debounce", () => {
    const onFilter = stub();
    const text = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("title")}
        onFilter={onFilter}
      />
    );
    text.find("input").simulate("change", { target: { value: "Book" } });
    expect(onFilter.lastCall.args).to.deep.equal(["title", "Book", true]);
    const select = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("license_pool_status")}
        onFilter={onFilter}
      />
    );
    select.find("select").simulate("change", { target: { value: "active" } });
    expect(onFilter.lastCall.args).to.deep.equal(["status", "active", false]);
    const numeric = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("duration")}
        onFilter={onFilter}
      />
    );
    numeric
      .find("input")
      .first()
      .simulate("change", { target: { value: "2" } });
    expect(onFilter.lastCall.args).to.deep.equal(["duration_min", "2", true]);
    const date = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("title_created_date")}
        onFilter={onFilter}
      />
    );
    date
      .find("input")
      .last()
      .simulate("change", { target: { value: "2026-01-01" } });
    expect(onFilter.lastCall.args).to.deep.equal([
      "title_created_date_max",
      "2026-01-01",
      false,
    ]);
    expect(date.find("input").first().prop("aria-label")).not.to.contain(
      "tuntia"
    );
    const pages = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("number_of_pages")}
      />
    );
    expect(pages.find("input").first().prop("aria-label")).not.to.contain(
      "tuntia"
    );
  });

  it("aligns visible headers and cells and exposes current sorting", () => {
    const onSort = stub();
    const work = {
      id: 1,
      title: "Book",
      author: "Author",
      duration: 5400,
      admin_url: "/lib/admin/works/ISBN/123",
    } as AllWork;
    const wrapper = mount(
      <AllWorksTable
        {...filterProps}
        library="lib"
        columns={[column("title"), column("author"), column("duration")]}
        rows={[work]}
        sort="duration"
        direction="desc"
        onSort={onSort}
        renderListAction={() => <span>Lists</span>}
      />
    );
    expect(wrapper.find("th")).to.have.length(4);
    expect(wrapper.find("tbody td")).to.have.length(4);
    expect(wrapper.find("tbody td").at(2).text()).to.equal("1 h 30 min");
    expect(wrapper.find("a").prop("href")).to.equal(
      "/admin/web/admin-book/lib%2FISBN%2F123"
    );
    expect(wrapper.find("th").at(2).prop("aria-sort")).to.equal("descending");
    wrapper.find("button").first().simulate("click");
    expect(onSort.lastCall.args).to.deep.equal(["title"]);
    wrapper.unmount();
  });

  it("keeps genre and keyword filters without sort buttons", () => {
    const wrapper = mount(
      <AllWorksTable
        {...filterProps}
        library="lib"
        columns={[column("genres"), column("keywords")]}
        rows={[]}
        sort="title"
        direction="asc"
        onSort={() => undefined}
        renderListAction={() => null}
      />
    );
    const headers = wrapper.find("thead th");
    expect(headers.at(0).find("button")).to.have.length(0);
    expect(headers.at(0).find("select")).to.have.length(1);
    expect(headers.at(1).find("button")).to.have.length(0);
    expect(headers.at(1).find("input")).to.have.length(1);
    wrapper.unmount();
  });

  it("uses identical paging behavior at the top and bottom", () => {
    const data = {
      offset: 20,
      limit: 20,
      total: 60,
      has_more: true,
    } as AllWorksData;
    ["top", "bottom"].forEach((position: "top" | "bottom") => {
      const onPage = stub();
      const wrapper = shallow(
        <AllWorksPagination
          data={data}
          isFetching={false}
          position={position}
          onPage={onPage}
        />
      );
      expect(wrapper.find("span").text()).to.equal("Sivu 2 / 3");
      wrapper.find("button").first().simulate("click");
      expect(onPage.lastCall.args).to.deep.equal([0]);
      wrapper.find("button").last().simulate("click");
      expect(onPage.lastCall.args).to.deep.equal([40]);
      wrapper.setProps({ isFetching: true });
      expect(
        wrapper.find("button").everyWhere((button) => button.prop("disabled"))
      ).to.equal(true);
      wrapper.setProps({
        isFetching: false,
        data: { ...data, offset: 0, has_more: false },
      });
      expect(
        wrapper.find("button").everyWhere((button) => button.prop("disabled"))
      ).to.equal(true);
    });
  });

  it("keeps genre groups while using API genre identifiers", () => {
    const wrapper = shallow(
      <AllWorksColumnFilter
        {...filterProps}
        column={column("genres")}
        genreTree={{
          Fiction: { Mystery: { name: "Mystery", parents: [], subgenres: [] } },
        }}
        genreOptions={[{ value: "mystery-id", label: "Mystery" }]}
      />
    );
    expect(wrapper.find("optgroup").prop("label")).to.equal("Fiction");
    expect(wrapper.find("option").last().prop("value")).to.equal("mystery-id");
  });
});
