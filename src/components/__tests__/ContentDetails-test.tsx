import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";

import ContentDetails from "../ContentDetails";

const item = {
  id: "1",
  group_id: "group",
  type: "news" as const,
  language: "fi",
  title: "Ajankohtaista",
  intro_html: "",
  body_html: "",
  status: "published" as const,
  slug: "ajankohtaista",
};

describe("ContentDetails", () => {
  it("changes published content back to draft", () => {
    let nextStatus;
    const wrapper = mount(
      <ContentDetails
        languages={[{ ...item, available: true, action: "view" }]}
        onBack={() => undefined}
        onView={() => undefined}
        onEdit={() => undefined}
        onChangeStatus={(_, status) => {
          nextStatus = status;
        }}
        onDelete={() => undefined}
        onCreate={() => undefined}
      />
    );

    wrapper
      .find("button")
      .filterWhere((button) => button.text() === "Piilota")
      .simulate("click");

    expect(nextStatus).to.equal("draft");
  });

  it("offers publishing for draft content", () => {
    let nextStatus;
    const wrapper = mount(
      <ContentDetails
        languages={[
          { ...item, status: "draft", available: true, action: "view" },
        ]}
        onBack={() => undefined}
        onView={() => undefined}
        onEdit={() => undefined}
        onChangeStatus={(_, status) => {
          nextStatus = status;
        }}
        onDelete={() => undefined}
        onCreate={() => undefined}
      />
    );

    wrapper
      .find("button")
      .filterWhere((button) => button.text() === "Julkaise")
      .simulate("click");

    expect(nextStatus).to.equal("published");
  });
});
