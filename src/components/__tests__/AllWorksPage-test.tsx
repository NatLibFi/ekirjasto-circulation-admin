import { expect } from "chai";

import { bookDetailsHref } from "../AllWorksPage";

describe("AllWorksPage book details links", () => {
  it("routes an admin work URL to the dedicated admin details page", () => {
    expect(
      bookDetailsHref(
        "library",
        "https://catalog.example/library/admin/works/ISBN/978951"
      )
    ).to.equal("/admin/web/admin-book/library%2FISBN%2F978951");
  });

  it("does not create a details link when the work URL is missing or invalid", () => {
    expect(bookDetailsHref("library")).to.equal(null);
    expect(bookDetailsHref("library", "not-an-admin-work-url")).to.equal(null);
  });
});
