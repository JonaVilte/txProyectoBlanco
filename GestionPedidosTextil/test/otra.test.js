import React from "react";
import { render } from "@testing-library/react-native";
import MyComponent from "../src/utils/MyComponent";

test("renders correctly", () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText("Component Text")).toBeTruthy();
});
