import { InboxIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { auth, signIn } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if ((await auth())?.user) {
    redirect("/");
  }

  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/",
      });
    } catch (caught) {
      if (caught instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw caught;
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <InboxIcon className="size-4" />
          </span>
          Mailbox Orders
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Pre-warmed mailboxes,<br />ordered and tracked in one place.
          </h2>
          <ul className="space-y-3 text-primary-foreground/85">
            <li className="flex items-center gap-3"><ZapIcon className="size-4" /> Background provisioning for Google and Microsoft</li>
            <li className="flex items-center gap-3"><ShieldCheckIcon className="size-4" /> Full audit trail for every status change</li>
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">Internal tool</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in with your account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>Invalid email or password.</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" size="lg" className="w-full">Sign in</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
