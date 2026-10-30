export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Internal tool</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Mailbox Order Manager
        </h1>
        <p className="mt-4 max-w-xl text-slate-600">
          The application foundation is ready. Authentication and order workflows
          are being added in the next implementation slices.
        </p>
      </section>
    </main>
  );
}
