"use client";

import { useId, type FormEvent } from "react";
import "./features.css";

export type LoginValues = { email: string; password: string };

export function Login01({
  onSubmit,
  pending = false,
  error,
  signupHref,
  forgotPasswordHref,
  className,
}: {
  onSubmit: (values: LoginValues) => void | Promise<void>;
  pending?: boolean;
  error?: string | null;
  signupHref?: string;
  forgotPasswordHref?: string;
  className?: string;
}) {
  const id = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onSubmit({ email: String(data.get("email")), password: String(data.get("password")) });
  }

  return (
    <div className={`ui-feature-auth ${className ?? ""}`}>
      <div className="ui-feature-card">
        <div className="ui-feature-card-header">
          <h2>Login to your account</h2>
          <p>Enter your email below to login to your account</p>
        </div>
        <form className="ui-feature-form" onSubmit={submit}>
          <div className="ui-feature-field">
            <label htmlFor={`${id}-email`}>Email</label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              required
              disabled={pending}
            />
          </div>
          <div className="ui-feature-field">
            <div className="ui-feature-field-heading">
              <label htmlFor={`${id}-password`}>Password</label>
              {forgotPasswordHref && <a href={forgotPasswordHref}>Forgot your password?</a>}
            </div>
            <input
              id={`${id}-password`}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
            />
          </div>
          {error && (
            <p className="ui-feature-error" role="alert">
              {error}
            </p>
          )}
          <button className="ui-feature-primary" type="submit" disabled={pending}>
            Login
          </button>
          {signupHref && (
            <p className="ui-feature-hint">
              Don&apos;t have an account? <a href={signupHref}>Sign up</a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
