import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-zinc-50 px-6 font-sans dark:bg-black">
      <div className="min-h-screen bg-white w-full max-w-4xl flex flex-col items-center justify-center py-20 shadow-lg">
        <header className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kaira SaaS Starter
          </h1>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This is a starter project by Kaira for only the coolest SaaS
            projects.
          </p>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Sign in or create an account to get started.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign up
            </Link>
          </div>
        </main>

        <footer className="w-full max-w-2xl text-center text-sm text-zinc-500 dark:text-zinc-400">
          Built by Kaira
        </footer>
      </div>
    </div>
  );
}
