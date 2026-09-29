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
import { cn } from "cn";
import { useId, type FormEvent } from "react";

export type LoginValues = { email: string; password: string };

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit: (values: LoginValues) => void | Promise<void>;
  pending?: boolean;
  error?: string | null;
  signupHref?: string;
  forgotPasswordHref?: string;
  onSignupClick?: () => void;
  onForgotPasswordClick?: () => void;
  onGoogleLogin?: () => void | Promise<void>;
};

export function LoginForm({
  onSubmit,
  pending = false,
  error,
  signupHref,
  forgotPasswordHref,
  onSignupClick,
  onForgotPasswordClick,
  onGoogleLogin,
  className,
  ...props
}: LoginFormProps) {
  const id = useId();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onSubmit({ email: String(data.get("email")), password: String(data.get("password")) });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                  {!forgotPasswordHref && onForgotPasswordClick && (
                    <button
                      type="button"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      onClick={onForgotPasswordClick}
                    >
                      Forgot your password?
                    </button>
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
                {onGoogleLogin && (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={pending}
                    onClick={onGoogleLogin}
                  >
                    Login with Google
                  </Button>
                )}
                {(signupHref || onSignupClick) && (
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    {signupHref ? (
                      <a href={signupHref}>Sign up</a>
                    ) : (
                      <button
                        type="button"
                        className="underline underline-offset-4 hover:text-primary"
                        onClick={onSignupClick}
                      >
                        Sign up
                      </button>
                    )}
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
