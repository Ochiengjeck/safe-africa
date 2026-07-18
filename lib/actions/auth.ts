"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import type { ActionState } from "@/lib/action-utils";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const callbackUrl = formData.get("callbackUrl");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: typeof callbackUrl === "string" && callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // NEXT_REDIRECT must propagate
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
