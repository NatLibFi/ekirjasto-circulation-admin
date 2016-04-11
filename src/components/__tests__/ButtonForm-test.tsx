jest.dontMock("../ButtonForm");

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { ButtonInput } from "react-bootstrap";

import ButtonForm from "../ButtonForm";

describe("ButtonForm", () => {
  let buttonForm;
  let refresh;
  let submit;

  it("shows label", () => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label="label"
        link="link"
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        submit={jest.genMockFunction()}
        />
    );
    let buttonComponent = TestUtils.findRenderedComponentWithType(buttonForm, ButtonInput);
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonComponent, "input");
    expect(button.getAttribute("value")).toBe("label");
  });

  it("renders hidden csrf_token and data fields", () => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label="label"
        link="link"
        csrfToken="token"
        data={{ test: "test" }}
        disabled={false}
        refresh={jest.genMockFunction()}
        submit={jest.genMockFunction()}
        />
    );
    let buttonComponent = TestUtils.findRenderedComponentWithType(buttonForm, ButtonInput);
    let inputs = TestUtils.scryRenderedDOMComponentsWithTag(buttonComponent, "input");
    expect(inputs[0].getAttribute("name")).toBe("csrf_token");
    expect(inputs[0].getAttribute("value")).toBe("token");
    expect(inputs[1].getAttribute("name")).toBe("test");
    expect(inputs[1].getAttribute("value")).toBe("test");
  });

  it("calls provided submit function", () => {
    submit = jest.genMockFunction();
    submit.mockReturnValue(new Promise((resolve, reject) => {
      resolve();
    }));
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label="label"
        link="link"
        csrfToken="token"
        disabled={false}
        refresh={jest.genMockFunction()}
        submit={submit}
        />
    );
    let form = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "form");
    TestUtils.Simulate.submit(form);
    expect(submit.mock.calls.length).toBe(1);
    expect(submit.mock.calls[0][0]).toBe("link");
    expect(submit.mock.calls[0][1].get("csrf_token").value).toBe("token");
  });

  it("refreshes", (done) => {
    submit = jest.genMockFunction();
    submit.mockReturnValue(new Promise((resolve, reject) => {
      resolve();
    }));
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label="label"
        link="link"
        csrfToken="token"
        disabled={false}
        refresh={done}
        submit={submit}
        />
    );

    let form = TestUtils.findRenderedDOMComponentWithTag(buttonForm, "form");
    TestUtils.Simulate.submit(form);
  });

  it("disables", () => {
    buttonForm = TestUtils.renderIntoDocument(
      <ButtonForm
        label="label"
        link="link"
        csrfToken="token"
        disabled={true}
        refresh={jest.genMockFunction()}
        submit={jest.genMockFunction()}
        />
    );

    let buttonComponent = TestUtils.findRenderedComponentWithType(buttonForm, ButtonInput);
    let button = TestUtils.findRenderedDOMComponentWithTag(buttonComponent, "input");
    expect(button.hasAttribute("disabled")).toBeTruthy();
  });
});