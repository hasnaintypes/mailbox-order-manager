"use client"

import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type LoginFormProps = Omit<React.ComponentProps<"form">, "action"> & {
  action: (formData: FormData) => void | Promise<void>
  error?: boolean
}

// Seeded demo accounts (see README); quick-fill for reviewers.
const DEMO_ACCOUNTS = [
  { label: "Customer", email: "customer@example.test" },
  { label: "Admin", email: "admin@example.test" },
]
const DEMO_PASSWORD = "ChangeMe123!"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="h-10 w-full" disabled={pending}>
      {pending ? <Loader2Icon className="animate-spin" /> : null}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  )
}

export function LoginForm({ className, action, error, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)

  return (
    <form action={action} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Sign in to manage your mailbox orders
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.test"
              autoComplete="username"
              className="h-10 pl-9"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-10 px-9"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </Field>

        {error ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>Invalid email or password. Please try again.</AlertDescription>
          </Alert>
        ) : null}

        <Field>
          <SubmitButton />
        </Field>

        <FieldSeparator>Demo accounts</FieldSeparator>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.label}
              type="button"
              variant="outline"
              onClick={() => {
                setEmail(account.email)
                setPassword(DEMO_PASSWORD)
              }}
            >
              {account.label}
            </Button>
          ))}
        </div>
        <p className="text-left text-xs text-muted-foreground">
          Fills the seeded credentials — then press Sign in.
        </p>
      </FieldGroup>
    </form>
  )
}
