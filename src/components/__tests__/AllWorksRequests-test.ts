import { expect } from "chai";
import { stub } from "sinon";
import ActionCreator from "../../actions";
import allWorks from "../../reducers/allWorks";

describe("All Works requests", () => {
  it("keeps newer results when requests complete in reverse order", async () => {
    const resolvers = [];
    const fetcher = {
      fetch: () => new Promise((resolve) => resolvers.push(resolve)),
    };
    const actions = new ActionCreator(fetcher as any);
    let state = allWorks(undefined, { type: "init" });
    const dispatch = (action) => {
      state = allWorks(state, action);
    };
    const first = actions.fetchAllWorks("lib", { title: "A" })(dispatch);
    const second = actions.fetchAllWorks("lib", { title: "AB" })(dispatch);
    resolvers[1]({
      ok: true,
      json: () => Promise.resolve({ works: [{ title: "AB" }], total: 1 }),
    });
    await second;
    resolvers[0]({
      ok: true,
      json: () => Promise.resolve({ works: [{ title: "A" }], total: 2 }),
    });
    await first;
    expect(state.data.works[0].title).to.equal("AB");
    expect(state.data.total).to.equal(1);
  });

  it("preserves HTTP status and response for ErrorMessage", async () => {
    const fetcher = {
      fetch: () =>
        Promise.resolve({
          ok: false,
          status: 401,
          text: () => Promise.resolve("Please sign in"),
        }),
    };
    const dispatch = stub();
    try {
      await new ActionCreator(fetcher as any).fetchAllWorks(
        "lib",
        {}
      )(dispatch);
      expect.fail("expected rejection");
    } catch (error) {
      expect(error.status).to.equal(401);
      expect(error.response).to.equal("Please sign in");
      expect(dispatch.lastCall.args[0].error).to.equal(error);
    }
  });

  it("normalizes network errors", async () => {
    const fetcher = { fetch: () => Promise.reject(new Error("Offline")) };
    const dispatch = stub();
    try {
      await new ActionCreator(fetcher as any).fetchAllWorks(
        "lib",
        {}
      )(dispatch);
      expect.fail("expected rejection");
    } catch (error) {
      expect(error.status).to.equal(null);
      expect(error.response).to.equal("Offline");
    }
  });
});
