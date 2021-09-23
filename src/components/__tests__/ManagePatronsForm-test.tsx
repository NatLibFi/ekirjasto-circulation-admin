import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";

import { mapDispatchToProps, ManagePatronsForm } from "../ManagePatronsForm";
import EditableInput from "../EditableInput";
import ErrorMessage from "../ErrorMessage";
import { Alert } from "react-bootstrap";

import ActionCreator from "../../actions";

const patron = {
  authorization_expires: "",
  username: "User Name",
  personal_name: "Personal Name",
  email_address: "user@email.com",
  authorization_identifier: "1234",
  authorization_identifiers: [""],
  block_reason: "",
  external_type: "",
  fines: "",
  permanent_id: "",
};

describe("ManagePatronsForm", () => {
  let wrapper;
  let store;

  describe("rendering", () => {
    beforeEach(() => {
      store = buildStore();
      wrapper = mount(
        <ManagePatronsForm store={store} csrfToken="token" library="nypl" />
      );
    });

    it("has .manage-patrons-form class", () => {
      expect(wrapper.render().hasClass("manage-patrons-form")).to.equal(true);
    });

    it("shows EditableInput", () => {
      const editableInput = wrapper.find(EditableInput);
      expect(editableInput.length).to.equal(1);
    });

    it("has a form with an input field and a button", () => {
      const form = wrapper.find("form");
      const input = wrapper.find("form input");
      const button = wrapper.find("form button");
      expect(form.length).to.equal(1);
      expect(input.length).to.equal(1);
      expect(button.length).to.equal(1);
    });

    it("doesn't initially show an alert or error message", () => {
      const alert = wrapper.find(Alert);
      const errorMessage = wrapper.find(ErrorMessage);
      expect(alert.length).to.equal(0);
      expect(errorMessage.length).to.equal(0);
    });
  });

  describe("behavior", () => {
    let patronLookup;

    beforeEach(() => {
      patronLookup = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      store = buildStore();
      wrapper = mount(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
          patronLookup={patronLookup}
          library="nypl"
        />
      );
    });

    it("calls patronLookup on dispatch", async () => {
      const form = wrapper.find("form");
      expect(patronLookup.callCount).to.equal(0);
      form.find("button").simulate("click");
      expect(patronLookup.callCount).to.equal(1);
    });

    it("displays an error message if there is an error", () => {
      let errorMessage = wrapper.find(ErrorMessage);
      const fetchError = { status: 400, response: "", url: "" };
      expect(errorMessage.length).to.equal(0);

      wrapper.setProps({ fetchError });

      errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(1);
      expect(errorMessage.props().error).to.equal(fetchError);
    });

    it("should display a no identifier if the input field is blank when searching", async () => {
      const fetchError = {
        status: 400,
        response: "No patron identifier provided",
        url: "",
      };
      patronLookup = stub();
      wrapper = mount(
        <ManagePatronsForm
          store={store}
          csrfToken="token"
          patronLookup={patronLookup}
          library="nypl"
        />
      );

      let errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(0);

      wrapper.setProps({ fetchError });

      errorMessage = wrapper.find(ErrorMessage);
      expect(errorMessage.length).to.equal(1);
      expect(errorMessage.props().error).to.equal(fetchError);
      expect(errorMessage.text()).to.equal(
        "Error: No patron identifier provided"
      );
    });

    it("should display a success alert message when a patron is found", () => {
      let alert = wrapper.find(".alert-success");
      expect(alert.length).to.equal(0);

      wrapper.setProps({ patron });

      alert = wrapper.find(".alert-success");

      expect(alert.length).to.equal(1);
      expect(alert.text()).to.equal(
        `Patron found: ${patron.authorization_identifier}`
      );
    });

    it("should show the PatronInfo list when a patron is found", () => {
      wrapper.setProps({ patron });
      const patronInfo = wrapper.find(".patron-info");
      expect(patronInfo.length).to.equal(1);
    });
  });
});
