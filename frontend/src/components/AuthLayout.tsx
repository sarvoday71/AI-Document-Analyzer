import type { ReactNode } from "react";

type AuthLayoutProps = { children: ReactNode };

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-2 lg:p-0">
      <section className="hidden bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold shadow-lg shadow-blue-500/30">
              A
            </span>
            <span className="text-lg font-semibold tracking-tight">
              DocuMind
            </span>
          </div>
          <div className="mt-28 max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Document intelligence
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight text-white">
              Understand every document, faster.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Upload, analyze, and find the insights that matter—all in one
              focused workspace.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          © 2026 DocuMind. Built for clearer work.
        </p>
      </section>
      <section className="flex items-center justify-center lg:p-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-9 lg:shadow-none lg:ring-0">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-slate-900">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-600 font-bold text-white">
                A
              </span>
              <span className="font-semibold">DocuMind</span>
            </div>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
