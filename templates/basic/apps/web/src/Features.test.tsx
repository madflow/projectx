import { Login01 } from "@repo/ui/features/login-01";
import { Signup01 } from "@repo/ui/features/signup-01";
import { Sidebar07, Sidebar07Item } from "@repo/ui/features/sidebar-07";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

test("login form sends credentials to its consumer", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<Login01 onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await screen.getByLabelText("Password").fill("password123");
  await screen.getByRole("button", { name: "Login" }).click();
  expect(onSubmit).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
});

test("signup form rejects mismatched passwords", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<Signup01 onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Full Name" }).fill("Test User");
  await screen.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await screen.getByLabelText("Password", { exact: true }).fill("password123");
  await screen.getByLabelText("Confirm Password").fill("different123");
  await screen.getByRole("button", { name: "Create Account" }).click();
  await expect.element(screen.getByRole("alert")).toHaveTextContent("Passwords do not match.");
  expect(onSubmit).not.toHaveBeenCalled();
});

test("sidebar can collapse without sample navigation", async () => {
  const screen = await render(
    <Sidebar07 navigation={<Sidebar07Item icon={<span>•</span>} label="Home" href="/" />}>
      Content
    </Sidebar07>,
  );
  await screen.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect.element(screen.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
});
