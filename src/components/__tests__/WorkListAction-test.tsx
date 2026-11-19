import * as React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { stub } from "sinon";
import ActionCreator from "../../actions";
import { AllWork } from "../../reducers/allWorks";
import WorkListAction from "../allWorks/WorkListAction";

const selected = { id: 2, name: "Selected", is_owner: true, is_shared: false };
const existing = { id: 1, name: "Existing", is_owner: true, is_shared: false };
const work = (id: number) =>
  ({
    id,
    title: `Book ${id}`,
    admin_url: `/lib/admin/works/ISBN/${id}`,
  } as AllWork);

describe("WorkListAction", () => {
  let wrapper;
  let fetch;
  let edit;
  beforeEach(() => {
    fetch = stub(ActionCreator.prototype, "fetchCustomListsForBook").callsFake(
      () => (() => Promise.resolve({ custom_lists: [existing] })) as any
    );
    edit = stub(ActionCreator.prototype, "editCustomListsForBook").callsFake(
      () => (() => Promise.resolve()) as any
    );
    const store = createStore((state = {}) => state, applyMiddleware(thunk));
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <div>
            <WorkListAction
              work={work(1)}
              customLists={[selected]}
              csrfToken="token"
            />
            <WorkListAction
              work={work(2)}
              customLists={[selected]}
              csrfToken="token"
            />
          </div>
        </Provider>
      );
    });
  });
  afterEach(() => {
    act(() => {
      wrapper.unmount();
    });
    fetch.restore();
    edit.restore();
  });
  function choose(index = 0) {
    act(() => {
      wrapper
        .find("select")
        .at(index)
        .simulate("change", { target: { value: "2" } });
    });
    wrapper.update();
  }
  async function add(index = 0) {
    await act(async () => {
      wrapper.find("button").at(index).simulate("click");
    });
    wrapper.update();
  }

  it("preserves memberships and clears only the successful row's selection", async () => {
    choose(0);
    choose(1);
    await add();
    expect(fetch.firstCall.args[0]).to.equal("/admin/works/ISBN/1/lists");
    expect(JSON.parse(edit.firstCall.args[1].get("lists"))).to.deep.equal([
      existing,
      selected,
    ]);
    expect(wrapper.find("select").at(0).prop("value")).to.equal("");
    expect(wrapper.find("select").at(1).prop("value")).to.equal("2");
  });

  it("does not post an existing membership, including a numeric/string ID match", async () => {
    fetch.callsFake(
      () => (() => Promise.resolve({ custom_lists: [selected] })) as any
    );
    choose();
    await add();
    expect(edit.called).to.equal(false);
    expect(wrapper.find("select").first().prop("value")).to.equal("");
  });

  it("keeps errors local and allows retrying", async () => {
    edit.callsFake(
      () => (() => Promise.reject({ status: 500, response: "Failed" })) as any
    );
    choose();
    await add();
    expect(wrapper.find('[role="alert"]')).to.have.length(1);
    expect(wrapper.find('[role="alert"]').text()).to.contain("(500): Failed");
    expect(wrapper.find("select").first().prop("value")).to.equal("2");
    expect(wrapper.find("button").first().prop("disabled")).to.equal(false);
    edit.callsFake(() => (() => Promise.resolve()) as any);
    await add();
    expect(wrapper.find('[role="alert"]')).to.have.length(0);
  });

  it("tracks simultaneous additions independently", async () => {
    const resolve = [];
    fetch.callsFake(
      () => (() => new Promise((done) => resolve.push(done))) as any
    );
    choose(0);
    choose(1);
    act(() => {
      wrapper.find("button").at(0).simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("button").at(0).prop("disabled")).to.equal(true);
    expect(wrapper.find("button").at(1).prop("disabled")).to.equal(false);
    act(() => {
      wrapper.find("button").at(1).simulate("click");
    });
    wrapper.update();
    expect(wrapper.find("button").at(0).text()).to.equal("Lisätään…");
    expect(wrapper.find("button").at(1).text()).to.equal("Lisätään…");
    await act(async () => {
      resolve[0]({ custom_lists: [] });
    });
    wrapper.update();
    expect(wrapper.find("button").at(1).text()).to.equal("Lisätään…");
    await act(async () => {
      resolve[1]({ custom_lists: [] });
    });
    wrapper.update();
    expect(edit.callCount).to.equal(2);
    expect(
      wrapper.find("select").everyWhere((select) => select.prop("value") === "")
    ).to.equal(true);
  });

  it("reports missing work URLs without starting a request", async () => {
    act(() => {
      wrapper.setProps({
        children: (
          <WorkListAction
            work={{ ...work(1), admin_url: undefined }}
            customLists={[selected]}
          />
        ),
      });
    });
    choose();
    await add();
    expect(fetch.called).to.equal(false);
    expect(wrapper.find('[role="alert"]')).to.have.length(1);
  });
});
