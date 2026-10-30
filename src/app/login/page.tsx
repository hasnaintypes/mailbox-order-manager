import { InboxIcon, ShieldCheckIcon, ZapIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

import { auth, signIn } from "@/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if ((await auth())?.user) {
    redirect("/")
  }

  const { error } = await searchParams

  async function login(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      })
    } catch (caught) {
      if (caught instanceof AuthError) {
        redirect("/login?error=1")
      }
      throw caught
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <span className="flex items-center gap-2 font-medium">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <InboxIcon className="size-4" />
            </span>
            Mailbox Orders
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm action={login} error={Boolean(error)} />
          </div>
        </div>
      </div>

      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <InboxIcon className="size-4" />
          </span>
          Mailbox Orders
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">
            Pre-warmed mailboxes,
            <br />
            ordered and tracked in one place.
          </h2>
          <ul className="space-y-3 text-primary-foreground/85">
            <li className="flex items-center gap-3">
              <ZapIcon className="size-4" /> Background provisioning for Google and Microsoft
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheckIcon className="size-4" /> Full audit trail for every status change
            </li>
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">Internal tool</p>
      </aside>
    </div>
  )
}
