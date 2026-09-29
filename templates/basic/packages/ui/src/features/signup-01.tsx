"use client";

import { useId, useState, type FormEvent } from "react";
import "./features.css";

export type SignupValues = { name: string; email: string; password: string };

export function Signup01({
  onSubmit,
  pending = false,
  error,
  loginHref,
  className,
}: {
  onSubmit: (values: SignupValues) => void | Promise<void>;
  pending?: boolean;
  error?: string | null;
  loginHref?: string;
  className?: string;
}) {
  const id = useId();
  const [validationError, setValidationError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm-password")) {
      setValidationError("Passwords do not match.");
      return;
    }
    setValidationError(null);
    void onSubmit({ name: String(data.get("name")), email: String(data.get("email")), password });
  }

  return (
    <div className={`ui-feature-auth ${className ?? ""}`}>
      <div className="ui-feature-card">
        <div className="ui-feature-card-header">
          <h2>Create an account</h2>
          <p>Enter your information below to create your account</p>
        </div>
        <form className="ui-feature-form" onSubmit={submit}>
          <div className="ui-feature-field">
            <label htmlFor={`${id}-name`}>Full Name</label>
            <input
              id={`${id}-name`}
              name="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              required
              disabled={pending}
            />
          </div>
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
            <p>
              We&apos;ll use this to contact you. We will not share your email with anyone else.
            </p>
          </div>
          <div className="ui-feature-field">
            <label htmlFor={`${id}-password`}>Password</label>
            <input
              id={`${id}-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={pending}
            />
            <p>Must be at least 8 characters long.</p>
          </div>
          <div className="ui-feature-field">
            <label htmlFor={`${id}-confirm`}>Confirm Password</label>
            <input
              id={`${id}-confirm`}
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={pending}
              onChange={() => setValidationError(null)}
            />
          </div>
          {(validationError || error) && (
            <p className="ui-feature-error" role="alert">
              {validationError || error}
            </p>
          )}
          <button className="ui-feature-primary" type="submit" disabled={pending}>
            Create Account
          </button>
          {loginHref && (
            <p className="ui-feature-hint">
              Already have an account? <a href={loginHref}>Sign in</a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
