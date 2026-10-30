import { auth } from "@/auth";
import { Errors } from "@/lib/errors";

export type Actor = {
  id: string;
  role: "customer" | "admin";
};

export async function requireActor(): Promise<Actor> {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    throw Errors.unauthenticated();
  }

  return { id: session.user.id, role: session.user.role };
}

export async function requireCustomer(): Promise<Actor> {
  const actor = await requireActor();

  if (actor.role !== "customer") {
    throw Errors.forbidden();
  }

  return actor;
}

export async function requireAdmin(): Promise<Actor> {
  const actor = await requireActor();

  if (actor.role !== "admin") {
    throw Errors.forbidden();
  }

  return actor;
}
