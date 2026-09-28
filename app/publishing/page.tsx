import Link from "next/link";

export default function PublishingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight"
          >
            Ray&apos;sStream
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 font-semibold hover:bg-white/20"
          >
            Back to Ray&apos;sStream
          </Link>
        </header>

        <section className="rounded-3xl border border-purple-400/20 bg-white/10 p-7 shadow-2xl backdrop-blur sm:p-12">
          <p className="font-bold uppercase tracking-widest text-purple-300">
            Coming Soon
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-6xl">
            Ray&apos;sStream Publishing
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
            We are exploring music-publishing
            administration services for selected
            songwriters and independent creators.
          </p>

          <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
            <h2 className="text-2xl font-black text-emerald-300">
              Our planned approach
            </h2>

            <p className="mt-3 leading-7 text-slate-200">
              Songwriters would keep ownership of their
              copyrights while Ray&apos;sStream helps
              administer compositions and collect eligible
              publishing royalties under a clear written
              agreement.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <div className="text-4xl">✍️</div>

            <h2 className="mt-4 text-xl font-black">
              Keep Your Copyright
            </h2>

            <p className="mt-2 leading-7 text-slate-300">
              Our planned administration model lets
              songwriters retain ownership of their songs.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <div className="text-4xl">🎼</div>

            <h2 className="mt-4 text-xl font-black">
              Song Administration
            </h2>

            <p className="mt-2 leading-7 text-slate-300">
              Ray&apos;sStream would help manage composition
              information, registrations, and royalty
              administration.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <div className="text-4xl">📊</div>

            <h2 className="mt-4 text-xl font-black">
              Clear Accounting
            </h2>

            <p className="mt-2 leading-7 text-slate-300">
              Agreements would explain the administration
              fee, term, territory, statements, and payment
              schedule.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-7 sm:p-10">
          <h2 className="text-3xl font-black">
            What publishing covers
          </h2>

          <p className="mt-4 leading-8 text-slate-200">
            Music publishing covers the underlying song or
            composition, including its lyrics and melody.
            The sound recording, sometimes called the
            master, is a separate right and would require
            separate permission.
          </p>
        </section>

        <section className="mt-8 rounded-3xl bg-purple-600 p-7 text-center shadow-xl sm:p-10">
          <h2 className="text-3xl font-black">
            Interested in future opportunities?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-purple-100">
            Ray&apos;sStream is developing this program.
            Applications and publishing agreements are not
            available yet.
          </p>

          <p className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-purple-700">
            More details coming soon
          </p>
        </section>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-slate-400">
          This page describes a planned service and is not
          an offer or publishing agreement. Final terms
          should be reviewed by qualified music counsel.
        </p>
      </div>
    </main>
  );
} 
