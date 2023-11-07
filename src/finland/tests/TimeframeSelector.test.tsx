import * as React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { TimeframeSelector } from "../components/TimeframeSelector";

function doNothing() {
  /* do nothing */
}

afterAll(() => {
  jest.resetAllMocks();
});

describe("TimeframeSelector", () => {
  it("renders without errors", () => {
    render(
      <TimeframeSelector
        handleTimeframeClick={doNothing}
        activeTimeframe="month"
        handleOffsetChange={doNothing}
      />
    );
    expect(screen.getByTestId("timeframe-selector")).toBeInTheDocument();
  });

  it("calls handleTimeframeClick when a button is clicked", () => {
    const mockHandleTimeframeClick = jest.fn();
    const { getByText } = render(
      <TimeframeSelector
        handleTimeframeClick={mockHandleTimeframeClick}
        activeTimeframe="month"
        handleOffsetChange={doNothing}
      />
    );

    const button = getByText("vko");
    fireEvent.click(button);

    expect(mockHandleTimeframeClick).toHaveBeenCalledWith("week");
  });

  it("displays active button with correct class", () => {
    const { getByText } = render(
      <TimeframeSelector
        handleTimeframeClick={doNothing}
        activeTimeframe="month"
        handleOffsetChange={doNothing}
      />
    );

    const button = getByText("kk");
    expect(button).toHaveClass("active");
  });

  it("displays back and forth buttons when there is an active timeframe", () => {
    const { queryByText } = render(
      <TimeframeSelector
        handleTimeframeClick={doNothing}
        activeTimeframe="month"
        handleOffsetChange={doNothing}
      />
    );

    const backButton = queryByText("－");
    const forwardButton = queryByText("＋");

    expect(backButton).not.toBeNull();
    expect(forwardButton).not.toBeNull();
  });

  it("does not display back and forth buttons when there is no active timeframe", () => {
    const { queryByText } = render(
      <TimeframeSelector
        handleTimeframeClick={doNothing}
        activeTimeframe={null}
        handleOffsetChange={doNothing}
      />
    );

    const backButton = queryByText("－");
    const forwardButton = queryByText("＋");

    expect(backButton).toBeNull();
    expect(forwardButton).toBeNull();
  });
});
