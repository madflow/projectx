"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useId, useState, type FormEvent } from "react";

export type SignupValues = { name: string; email: string; password: string };

export function Signup01({
  onSubmit,
  pending = false,
  error,
  loginHref,
  onLoginClick,
  className,
}: {
  onSubmit: (values: SignupValues) => void | Promise<void>;
  pending?: boolean;
  error?: string | null;
  loginHref?: string;
  onLoginClick?: () => void;
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your information below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>Full Name</FieldLabel>
              <Input
                id={`${id}-name`}
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                disabled={pending}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
              <Input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pending}
              />
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            </Field>
            <Field data-invalid={!!validationError}>
              <FieldLabel htmlFor={`${id}-confirm`}>Confirm Password</FieldLabel>
              <Input
                id={`${id}-confirm`}
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pending}
                aria-invalid={!!validationError}
                onChange={() => setValidationError(null)}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <Field>
              {(validationError || error) && <FieldError>{validationError || error}</FieldError>}
              <Button type="submit" disabled={pending}>
                Create Account
              </Button>
              {(loginHref || onLoginClick) && (
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  {loginHref ? (
                    <a href={loginHref}>Sign in</a>
                  ) : (
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={onLoginClick}
                    >
                      Sign in
                    </button>
                  )}
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
