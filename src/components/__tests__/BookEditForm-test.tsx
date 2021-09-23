import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import BookEditForm from "../BookEditForm";
import EditableInput from "../EditableInput";
import WithRemoveButton from "../WithRemoveButton";
import Contributors from "../Contributors";
import LanguageField from "../LanguageField";
import { Form } from "library-simplified-reusable-components";
import {
  BookData,
  RolesData,
  MediaData,
  LanguagesData,
} from "../../interfaces";

describe("BookEditForm", () => {
  const roles: RolesData = {
    aut: "Author",
    nar: "Narrator",
  };

  const media: MediaData = {
    "http://schema.org/AudioObject": "Audio",
    "http://schema.org/Book": "Book",
  };

  const languages: LanguagesData = {
    eng: ["English"],
    spa: ["Spanish", "Castilian"],
  };

  const bookData: BookData = {
    id: "id",
    title: "title",
    subtitle: "subtitle",
    authors: [{ name: "An Author", role: "aut" }],
    contributors: [
      { name: "A Narrator", role: "nar" },
      { name: "Another Narrator", role: "nar" },
    ],
    fiction: true,
    audience: "Young Adult",
    targetAgeRange: ["12", "16"],
    summary: "summary",
    series: "series",
    seriesPosition: 3,
    medium: "http://schema.org/AudioObject",
    language: "eng",
    publisher: "publisher",
    imprint: "imprint",
    issued: "2017-04-03",
    rating: 4,
    editLink: {
      href: "href",
      rel: "edit",
    },
  };

  let wrapper;
  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    return inputs.filterWhere((input) => input.props().name === name);
  };
  const editableInputByValue = (value) => {
    const inputs = wrapper.find(EditableInput);
    return inputs.filterWhere((input) => input.props().value === value);
  };

  describe("rendering", () => {
    beforeEach(() => {
      wrapper = mount(
        <BookEditForm
          {...bookData}
          roles={roles}
          media={media}
          languages={languages}
          disabled={false}
          refresh={stub()}
          editBook={stub()}
        />
      );
    });

    it("shows editable input with title", () => {
      const input = editableInputByName("title");
      expect(input.props().label).to.equal("Title");
      expect(input.props().value).to.equal("title");
    });

    it("shows editable input with subtitle", () => {
      const input = editableInputByName("subtitle");
      expect(input.props().label).to.equal("Subtitle");
      expect(input.props().value).to.equal("subtitle");
    });

    it("shows authors and contributors", () => {
      const contributorNames = editableInputByName("contributor-name");
      const contributorRoles = editableInputByName("contributor-role");
      expect(contributorNames.length).to.equal(4);
      expect(contributorRoles.length).to.equal(4);
      expect(contributorNames.at(0).props().value).to.equal("An Author");
      expect(contributorRoles.at(0).props().value).to.equal("Author");
      expect(contributorNames.at(1).props().value).to.equal("A Narrator");
      expect(contributorRoles.at(1).props().value).to.equal("Narrator");
      expect(contributorNames.at(2).props().value).to.equal("Another Narrator");
      expect(contributorRoles.at(2).props().value).to.equal("Narrator");

      // The last inputs are for adding a new contributor.
      expect(contributorNames.at(3).props().value).to.be.undefined;
      expect(contributorRoles.at(3).props().value).to.equal("Author");
      const addButton = wrapper.find("button.add-contributor");
      expect(addButton.length).to.equal(1);

      // Existing authors and contributors are removable.
      const removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(3);

      // All roles inputs have the same options.
      let roles = contributorRoles.at(1).find("option");
      expect(roles.length).to.equal(2);
      expect(roles.at(0).props().value).to.equal("Author");
      expect(roles.at(1).props().value).to.equal("Narrator");
      roles = contributorRoles.at(3).find("option");
      expect(roles.length).to.equal(2);
      expect(roles.at(0).props().value).to.equal("Author");
      expect(roles.at(1).props().value).to.equal("Narrator");
    });

    it("shows editable input with series", () => {
      const input = editableInputByName("series");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("series");
    });

    it("shows editable input with series position", () => {
      const input = editableInputByName("series_position");
      expect(input.props().label).not.to.be.ok;
      expect(input.props().value).to.equal("3");
    });

    it("shows editable input with medium", () => {
      const input = editableInputByName("medium");
      expect(input.props().label).to.equal("Medium");
      expect(input.props().value).to.equal("Audio");
    });

    it("shows a language field", () => {
      let languageField = wrapper.find(LanguageField);
      expect(languageField.prop("name")).to.equal("language");
      expect(languageField.prop("label")).to.equal("Language");
      expect(languageField.prop("value")).to.equal("eng");
      expect(languageField.prop("languages")).to.equal(
        wrapper.prop("languages")
      );

      wrapper.setProps({ language: "fre" });
      languageField = wrapper.find(LanguageField);
      expect(languageField.prop("value")).to.equal("fre");
    });

    it("shows editable input with publisher", () => {
      const input = editableInputByName("publisher");
      expect(input.props().label).to.equal("Publisher");
      expect(input.props().value).to.equal("publisher");
    });

    it("shows editable input with imprint", () => {
      const input = editableInputByName("imprint");
      expect(input.props().label).to.equal("Imprint");
      expect(input.props().value).to.equal("imprint");
    });

    it("shows editable input with publication date", () => {
      const input = editableInputByName("issued");
      expect(input.props().label).to.equal("Publication Date");
      expect(input.props().value).to.equal("2017-04-03");
    });

    it("shows editable input with rating", () => {
      const input = editableInputByName("rating");
      expect(input.props().label).to.contain("Rating");
      expect(input.props().value).to.equal("4");
    });

    it("shows editable textarea with summary", () => {
      const editor = wrapper.find(".editor");
      expect(editor.find("label").text()).to.equal("Summary");
      expect(editor.find(".DraftEditor-root").text()).to.equal("summary");
    });
  });

  it("removes a contributor", () => {
    const editBook = stub();
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);
    const firstNarrator = removables.at(1);
    const onRemove = firstNarrator.prop("onRemove");

    onRemove();
    wrapper.update();

    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    const contributorNames = editableInputByName("contributor-name");
    const contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(3);
    expect(contributorRoles.length).to.equal(3);
    expect(contributorNames.at(0).props().value).to.equal("An Author");
    expect(contributorRoles.at(0).props().value).to.equal("Author");
    expect(contributorNames.at(1).props().value).to.equal("Another Narrator");
    expect(contributorRoles.at(1).props().value).to.equal("Narrator");
    expect(contributorNames.at(2).props().value).to.be.undefined;
    expect(contributorRoles.at(2).props().value).to.equal("Author");
  });

  it("adds a contributor", () => {
    const editBook = stub();
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    let contributorNames = editableInputByName("contributor-name");
    let contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(4);
    expect(contributorRoles.length).to.equal(4);

    const addContributorName = contributorNames.at(3);
    const addContributorRole = contributorRoles.at(3);
    const addButton = wrapper.find("button.add-contributor");

    addContributorName.at(0).setState({ value: "New Author" });
    addContributorRole.at(0).setState({ value: "Author" });
    wrapper.find(Contributors).setState({ disabled: false });
    addButton.simulate("click");

    contributorNames = editableInputByName("contributor-name");
    contributorRoles = editableInputByName("contributor-role");
    expect(contributorNames.length).to.equal(5);
    expect(contributorRoles.length).to.equal(5);

    expect(contributorNames.at(0).props().value).to.equal("An Author");
    expect(contributorRoles.at(0).props().value).to.equal("Author");
    expect(contributorNames.at(1).props().value).to.equal("A Narrator");
    expect(contributorRoles.at(1).props().value).to.equal("Narrator");
    expect(contributorNames.at(2).props().value).to.equal("Another Narrator");
    expect(contributorRoles.at(2).props().value).to.equal("Narrator");
    expect(contributorNames.at(3).props().value).to.equal("New Author");
    expect(contributorRoles.at(3).props().value).to.equal("Author");
    expect(contributorNames.at(4).props().value).to.be.undefined;
    expect(contributorRoles.at(4).props().value).to.equal("Author");
  });

  it("calls editBook on submit", () => {
    const editBook = stub().returns(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={stub()}
        editBook={editBook}
      />
    );

    const form = wrapper.find(Form);
    form.prop("onSubmit")(new (window as any).FormData(form.getDOMNode()));

    expect(editBook.callCount).to.equal(1);
    expect(editBook.args[0][0]).to.equal("href");
    expect(editBook.args[0][1].get("title")).to.equal(bookData.title);
    expect(editBook.args[0][1].get("subtitle")).to.equal(bookData.subtitle);

    // The last contributor field is the empty one for adding a new contributor.
    // If the user had filled it in without clicking "Add", it would still be submitted.

    expect(editBook.args[0][1].getAll("contributor-name")).to.deep.equal([
      "An Author",
      "A Narrator",
      "Another Narrator",
      "",
    ]);
    expect(editBook.args[0][1].getAll("contributor-role")).to.deep.equal([
      "Author",
      "Narrator",
      "Narrator",
      "Author",
    ]);

    expect(editBook.args[0][1].get("series")).to.equal(bookData.series);
    expect(editBook.args[0][1].get("series_position")).to.equal(
      String(bookData.seriesPosition)
    );
    expect(editBook.args[0][1].get("medium")).to.equal("Audio");
    expect(editBook.args[0][1].get("language")).to.equal("English");
    expect(editBook.args[0][1].get("publisher")).to.equal(bookData.publisher);
    expect(editBook.args[0][1].get("imprint")).to.equal(bookData.imprint);
    expect(editBook.args[0][1].get("issued")).to.equal(bookData.issued);
    expect(editBook.args[0][1].get("rating")).to.equal("4");
    expect(editBook.args[0][1].get("summary")).to.contain(bookData.summary);
  });

  it("refreshes book after editing", async () => {
    const editBook = stub().returns(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    const refreshStub = stub().returns(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={refreshStub}
        editBook={editBook}
      />
    );

    const form = wrapper.find(Form);
    await form.prop("onSubmit")(
      new (window as any).FormData(form.getDOMNode())
    );
    expect(refreshStub.callCount).to.equal(1);
  });

  it("only adds updated summary content if it's not empty", async () => {
    const editBook = stub().returns(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    const refreshStub = stub().returns(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    // Since we are adding an empty string, there should be no `summary` value
    // in the FormData object that gets passed to the `editBook` function.
    const emptySummaryData = { ...bookData, summary: "<p></p>" };

    wrapper = mount(
      <BookEditForm
        {...emptySummaryData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={false}
        refresh={refreshStub}
        editBook={editBook}
        editLink={{ href: "test-url", rel: "something" }}
      />
    );

    const form = wrapper.find(Form);
    const data = new (window as any).FormData(form.getDOMNode());
    await form.prop("onSubmit")(data);

    expect(editBook.args[0][1].get("summary")).to.equal(null);
  });

  it("disables all inputs", () => {
    wrapper = mount(
      <BookEditForm
        {...bookData}
        roles={roles}
        media={media}
        languages={languages}
        disabled={true}
        refresh={stub()}
        editBook={stub()}
      />
    );
    const inputs = wrapper.find(EditableInput);
    inputs.forEach((input) => {
      expect(input.prop("disabled")).to.equal(true);
    });
    const languageField = wrapper.find(LanguageField);
    expect(languageField.prop("disabled")).to.equal(true);
  });
});
