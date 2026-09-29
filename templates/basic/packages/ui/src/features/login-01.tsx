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
import { cn } from "@repo/ui/lib/utils";
import { useId, type FormEvent } from "react";

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
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
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
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
                  {forgotPasswordHref && (
                    <a
                      href={forgotPasswordHref}
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  id={`${id}-password`}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                />
              </Field>
              <Field>
                {error && <FieldError>{error}</FieldError>}
                <Button type="submit" disabled={pending}>
                  Login
                </Button>
                {signupHref && (
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href={signupHref}>Sign up</a>
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
