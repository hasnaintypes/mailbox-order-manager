import { InboxIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

import { auth, signIn } from "@/auth"
import { LoginBanner } from "@/components/login-banner"
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

      <LoginBanner />
    </div>
  )
}
