import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { getSessionUserFromCookies } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams?: {
    redirectTo?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const existingSession = await getSessionUserFromCookies();
  if (existingSession) {
    redirect("/");
  }

  const redirectTo = searchParams?.redirectTo || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}

