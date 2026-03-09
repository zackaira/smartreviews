import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeRelativePath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash =
    searchParams.get("token_hash") ?? searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRelativePath(searchParams.get("next"));

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-confirmation-link", request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-confirmation-link", request.url)
    );
  }

  // Mark recovery sessions so /reset-password can verify the user
  // arrived via the password-reset email, not just any active session.
  if (type === "recovery") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("sb-recovery-active", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/reset-password",
      maxAge: 600,
    });
  }

  return NextResponse.redirect(new URL(next, request.url));
}
