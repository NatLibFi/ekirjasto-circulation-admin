import * as React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { stub, useFakeTimers } from "sinon";
import ActionCreator from "../../actions";
import allWorks from "../../reducers/allWorks";
import useAllWorksQuery, {
  initialQueryState,
  queryReducer,
} from "../allWorks/useAllWorksQuery";

const response = (total = 40) => ({
  works: [],
  offset: 0,
  limit: 20,
  has_more: true,
  total,
});

describe("All Works query transitions", () => {
  it("clears hidden column bounds and resets its sort atomically", () => {
    let state = queryReducer(initialQueryState, {
      type: "column",
      key: "duration",
    });
    state = queryReducer(state, {
      type: "filter",
      key: "duration_min",
      value: "2",
      debounce: true,
    });
    expect(state.request.params.duration_min).to.equal("7200");
    state = queryReducer(state, { type: "sort", key: "duration" });
    state = queryReducer(state, { type: "column", key: "duration" });
    expect(state.filters).to.deep.equal({});
    expect(state.request.params).to.deep.equal({
      sort: "title",
      direction: "asc",
      offset: 0,
      include_total: 1,
    });
  });

  it("resets pagination on filtering and sorting, but does not fetch when showing a column", () => {
    const shown = queryReducer(initialQueryState, {
      type: "column",
      key: "awards",
    });
    expect(shown.request).to.equal(initialQueryState.request);
    const page = queryReducer(shown, { type: "page", offset: 20 });
    expect(page.request.params.include_total).to.equal(0);
    const sorted = queryReducer(page, { type: "sort", key: "title" });
    expect(sorted.direction).to.equal("desc");
    expect(sorted.request.params.offset).to.equal(0);
    expect(sorted.request.params.include_total).to.equal(1);
  });
});

describe("All Works request reducer", () => {
  it("ignores old successes and failures while a newer request is pending", () => {
    let state = allWorks(undefined, {
      type: ActionCreator.ALL_WORKS_REQUEST,
      requestId: 1,
      library: "lib",
    });
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_REQUEST,
      requestId: 2,
      library: "lib",
    });
    expect(
      allWorks(state, {
        type: ActionCreator.ALL_WORKS_LOAD,
        requestId: 1,
        data: response(),
      })
    ).to.equal(state);
    expect(
      allWorks(state, {
        type: ActionCreator.ALL_WORKS_FAILURE,
        requestId: 1,
        error: {},
      })
    ).to.equal(state);
    expect(state.isFetching).to.equal(true);
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_LOAD,
      requestId: 2,
      queryKey: "lib?q",
      data: response(),
    });
    expect(state.isFetching).to.equal(false);
    expect(state.data.total).to.equal(40);
  });

  it("preserves totals only for the same query and clears another library's data", () => {
    let state = allWorks(undefined, {
      type: ActionCreator.ALL_WORKS_REQUEST,
      requestId: 1,
      library: "lib",
    });
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_LOAD,
      requestId: 1,
      queryKey: "lib?q",
      data: response(),
    });
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_REQUEST,
      requestId: 2,
      library: "lib",
    });
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_LOAD,
      requestId: 2,
      queryKey: "lib?q",
      data: { ...response(), total: undefined },
    });
    expect(state.data.total).to.equal(40);
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_REQUEST,
      requestId: 3,
      library: "lib",
    });
    state = allWorks(state, {
      type: ActionCreator.ALL_WORKS_LOAD,
      requestId: 3,
      queryKey: "lib?other",
      data: { ...response(), total: undefined },
    });
    expect(state.data.total).to.equal(0);
    expect(
      allWorks(state, {
        type: ActionCreator.ALL_WORKS_REQUEST,
        requestId: 4,
        library: "other",
      }).data
    ).to.equal(null);
  });
});

describe("useAllWorksQuery", () => {
  let wrapper;
  let fetch;
  let clock;
  let query: ReturnType<typeof useAllWorksQuery>;
  function Harness({ library }) {
    query = useAllWorksQuery(library);
    return null;
  }
  beforeEach(() => {
    clock = useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    fetch = stub(ActionCreator.prototype, "fetchAllWorks").callsFake(
      () => (() => Promise.resolve(response())) as any
    );
    const store = createStore(
      (state: any, action) => ({
        editor: { allWorks: allWorks(state?.editor.allWorks, action) },
      }),
      applyMiddleware(thunk)
    );
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <Harness library="lib" />
        </Provider>
      );
    });
  });
  afterEach(() => {
    act(() => {
      if (wrapper.length) wrapper.unmount();
    });
    fetch.restore();
    clock.restore();
  });

  it("debounces inputs, applies dropdowns immediately and cancels timers on unmount", () => {
    act(() => query.updateFilter("title", "A", true));
    act(() => {
      clock.tick(200);
    });
    act(() => query.updateFilter("title", "AB", true));
    act(() => {
      clock.tick(249);
    });
    expect(fetch.callCount).to.equal(1);
    act(() => {
      clock.tick(1);
    });
    expect(fetch.lastCall.args[1].title).to.equal("AB");
    act(() => query.updateFilter("language", "fin"));
    expect(fetch.callCount).to.equal(3);
    act(() => query.updateFilter("title", "ABC", true));
    act(() => {
      if (wrapper.length) wrapper.unmount();
    });
    act(() => {
      clock.tick(300);
    });
    expect(fetch.callCount).to.equal(3);
  });

  it("applies sorting immediately with pending input and cancels the old timer", () => {
    act(() => query.updateFilter("title", "Pending", true));
    act(() => query.changeSort("author"));
    expect(fetch.lastCall.args[1].title).to.equal("Pending");
    expect(fetch.lastCall.args[1].sort).to.equal("author");
    const count = fetch.callCount;
    act(() => {
      clock.tick(300);
    });
    expect(fetch.callCount).to.equal(count);
  });

  it("reloads for a library change with offset zero and a fresh total", () => {
    act(() => query.loadPage(20));
    expect(fetch.lastCall.args[1].offset).to.equal(20);
    expect(fetch.lastCall.args[1].include_total).to.equal(0);
    act(() => {
      wrapper.setProps({ children: <Harness library="other" /> });
    });
    expect(fetch.lastCall.args[0]).to.equal("other");
    expect(fetch.lastCall.args[1].offset).to.equal(0);
    expect(fetch.lastCall.args[1].include_total).to.equal(1);
  });
});
