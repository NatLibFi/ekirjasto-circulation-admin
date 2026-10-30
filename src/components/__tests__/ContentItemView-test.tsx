import { expect } from "chai";
import * as React from "react";
import { shallow } from "enzyme";

import ContentItemView from "../ContentItemView";

describe("ContentItemView", () => {
  const props = {
    onBack: () => undefined,
    onEdit: () => undefined,
  };

  it("does not render the intro for banners", () => {
    const wrapper = shallow(
      <ContentItemView
        {...props}
        item={{
          type: "banner",
          intro_html: "<p>Intro</p>",
          body_html: "<p>Body</p>",
        }}
      />
    );

    expect(wrapper.find("h3").map((heading) => heading.text())).to.deep.equal([
      "Sisältöteksti",
    ]);
    expect(wrapper.html()).to.not.contain("Intro");
  });
});
