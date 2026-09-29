import { LoginForm } from "@repo/ui/features/login-form";
import { SidebarLayout, SidebarNavItem } from "@repo/ui/features/sidebar-layout";
import { SignupForm } from "@repo/ui/features/signup-form";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";

test("login form sends credentials to its consumer", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<LoginForm onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await screen.getByLabelText("Password").fill("password123");
  await screen.getByRole("button", { name: "Login" }).click();
  expect(onSubmit).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
});

test("login block exposes working links and an optional Google action", async () => {
  const onSignupClick = vi.fn();
  const onForgotPasswordClick = vi.fn();
  const onGoogleLogin = vi.fn();
  const screen = await render(
    <LoginForm
      onSubmit={vi.fn()}
      onSignupClick={onSignupClick}
      onForgotPasswordClick={onForgotPasswordClick}
      onGoogleLogin={onGoogleLogin}
    />,
  );

  await screen.getByRole("button", { name: "Sign up" }).click();
  await screen.getByRole("button", { name: "Forgot your password?" }).click();
  await screen.getByRole("button", { name: "Login with Google" }).click();

  expect(onSignupClick).toHaveBeenCalledOnce();
  expect(onForgotPasswordClick).toHaveBeenCalledOnce();
  expect(onGoogleLogin).toHaveBeenCalledOnce();
});

test("signup form rejects mismatched passwords", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<SignupForm onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Full Name" }).fill("Test User");
  await screen.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await screen.getByLabelText("Password", { exact: true }).fill("password123");
  await screen.getByLabelText("Confirm Password").fill("different123");
  await screen.getByRole("button", { name: "Create Account" }).click();
  await expect.element(screen.getByRole("alert")).toHaveTextContent("Passwords do not match.");
  expect(onSubmit).not.toHaveBeenCalled();
});

test("sidebar toggles without sample navigation", async () => {
  const screen = await render(
    <SidebarLayout navigation={<SidebarNavItem icon={<span>•</span>} label="Home" href="/" />}>
      Content
    </SidebarLayout>,
  );
  const toggle = screen.getByRole("button", { name: /^(Collapse|Expand) sidebar$/ });
  const original = document
    .querySelector('[data-slot="sidebar-trigger"]')
    ?.getAttribute("aria-expanded");
  await toggle.click();
  if (original === "false") {
    await expect.element(screen.getByRole("dialog", { name: "Sidebar" })).toBeVisible();
  } else {
    await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
  }
});

test("theme control switches between dark, light, and system", async () => {
  const screen = await render(
    <ThemeProvider defaultTheme="light" storageKey="projectx-theme-test">
      <ThemeToggle />
    </ThemeProvider>,
  );

  const trigger = screen.getByRole("button", { name: "Choose theme" });
  await trigger.click();
  await screen.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  expect(document.documentElement.classList.contains("dark")).toBe(true);

  await trigger.click();
  await expect
    .element(screen.getByRole("menuitemradio", { name: "Dark" }))
    .toHaveAttribute("aria-checked", "true");
  await screen.getByRole("menuitemradio", { name: "Light" }).click();
  expect(document.documentElement.classList.contains("light")).toBe(true);

  await trigger.click();
  await screen.getByRole("menuitemradio", { name: "System" }).click();
  await trigger.click();
  await expect
    .element(screen.getByRole("menuitemradio", { name: "System" }))
    .toHaveAttribute("aria-checked", "true");
  expect(
    document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("light"),
  ).toBe(true);
});
