import { expect } from "chai";
import { spy } from "sinon";

import ReactDOM from "react-dom";
import { mount } from "enzyme";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import CirculationAdmin from "../index";
import SetupPage from "../components/SetupPage";
import { Router } from "react-router";

describe("CirculationAdmin", () => {
  it("renders Setup", () => {
    const renderSpy = spy(ReactDOM, "render");
    new CirculationAdmin({
      settingUp: true,
      csrfToken: "my-csrf-token",
      showCircEventsDownload: true,
    });
    expect(renderSpy.callCount).to.equal(1);
    const component = renderSpy.args[0][0];
    const wrapper = mount(component);
    const setup = wrapper.find(SetupPage);
    expect(setup.length).to.equal(1);
    renderSpy.restore();
  });

  it("renders Router", () => {
    const renderSpy = spy(ReactDOM, "render");
    new CirculationAdmin({
      settingUp: false,
      csrfToken: "my-csrf-token",
      showCircEventsDownload: true,
    });
    expect(renderSpy.callCount).to.equal(1);
    const component = renderSpy.args[0][0];
    const wrapper = mount(component);
    const router = wrapper.find(Router);
    expect(router.length).to.equal(1);
    renderSpy.restore();
  });
});
