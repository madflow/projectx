import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "./App";

test("increments the counter when clicked", async () => {
  const screen = await render(<App />);
  const counter = screen.getByRole("button", { name: "Count is 0" });

  await counter.click();

  await expect.element(screen.getByRole("button", { name: "Count is 1" })).toBeVisible();
});
