import Link from "next/link";

export default function PublishingPage() {
  return (
    <main className="publishing-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .publishing-page {
          min-height: 100vh;
          padding: 40px 20px;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(
              circle at top left,
              #581c87,
              transparent 40%
            ),
            linear-gradient(
              135deg,
              #1e1b4b,
              #020617 55%,
              #000000
            );
        }

        .publishing-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .publishing-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 48px;
        }

        .publishing-logo {
          color: white;
          font-size: 30px;
          font-weight: 900;
          text-decoration: none;
        }

        .back-button {
          padding: 12px 20px;
          color: white;
          font-weight: 700;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 999px;
        }

        .hero {
          padding: 48px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(192, 132, 252, 0.25);
          border-radius: 30px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
        }

        .coming-soon {
          margin: 0;
          color: #d8b4fe;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 14px 0 0;
          font-size: clamp(42px, 7vw, 72px);
          line-height: 1;
        }

        .hero-description {
          max-width: 760px;
          margin: 24px 0 0;
          color: #e2e8f0;
          font-size: 20px;
          line-height: 1.7;
        }

        .approach {
          margin-top: 32px;
          padding: 26px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.35);
          border-radius: 24px;
        }

        .approach h2 {
          margin: 0;
          color: #6ee7b7;
          font-size: 28px;
        }

        .approach p {
          margin: 12px 0 0;
          color: #e2e8f0;
          font-size: 17px;
          line-height: 1.7;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 30px;
        }

        .feature-card {
          padding: 26px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 26px;
        }

        .feature-icon {
          font-size: 40px;
        }

        .feature-card h2 {
          margin: 18px 0 0;
          font-size: 24px;
        }

        .feature-card p {
          margin: 12px 0 0;
          color: #cbd5e1;
          line-height: 1.7;
        }

        .information-section {
          margin-top: 30px;
          padding: 38px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 28px;
        }

        .information-section h2 {
          margin: 0;
          font-size: 32px;
        }

        .information-section p {
          margin: 16px 0 0;
          color: #e2e8f0;
          font-size: 17px;
          line-height: 1.8;
        }

        .interest-section {
          margin-top: 30px;
          padding: 42px;
          text-align: center;
          background: linear-gradient(
            135deg,
            #7e22ce,
            #9333ea
          );
          border-radius: 28px;
          box-shadow: 0 22px 50px rgba(88, 28, 135, 0.4);
        }

        .interest-section h2 {
          margin: 0;
          font-size: 34px;
        }

        .interest-section p {
          max-width: 680px;
          margin: 15px auto 0;
          color: #f3e8ff;
          font-size: 17px;
          line-height: 1.7;
        }

        .coming-badge {
          display: inline-block;
          margin-top: 26px;
          padding: 14px 24px;
          color: #6b21a8;
          font-weight: 900;
          background: white;
          border-radius: 999px;
        }

        .disclaimer {
          max-width: 780px;
          margin: 30px auto 0;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }

        @media (max-width: 800px) {
          .publishing-page {
            padding: 28px 16px;
          }

          .publishing-header {
            margin-bottom: 30px;
          }

          .hero {
            padding: 28px 22px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .information-section,
          .interest-section {
            padding: 28px 22px;
          }
        }
      `}</style>

      <div className="publishing-container">
        <header className="publishing-header">
          <Link
            href="/"
            className="publishing-logo"
          >
            Ray&apos;sStream
          </Link>

          <Link
            href="/"
            className="back-button"
          >
            Back to Ray&apos;sStream
          </Link>
        </header>

        <section className="hero">
          <p className="coming-soon">
            Coming Soon
          </p>

          <h1>
            Ray&apos;sStream Publishing
          </h1>

          <p className="hero-description">
            We are exploring music-publishing
            administration services for selected
            songwriters and independent creators.
          </p>

          <div className="approach">
            <h2>Our planned approach</h2>

            <p>
              Songwriters would keep ownership of their
              copyrights while Ray&apos;sStream helps
              administer compositions and collect eligible
              publishing royalties under a clear written
              agreement.
            </p>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">
              ✍️
            </div>

            <h2>Keep Your Copyright</h2>

            <p>
              Our planned administration model lets
              songwriters retain ownership of their songs.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              🎼
            </div>

            <h2>Song Administration</h2>

            <p>
              Ray&apos;sStream would help manage
              composition information, registrations, and
              royalty administration.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              📊
            </div>

            <h2>Clear Accounting</h2>

            <p>
              Agreements would explain the administration
              fee, term, territory, statements, and payment
              schedule.
            </p>
          </article>
        </section>

        <section className="information-section">
          <h2>What publishing covers</h2>

          <p>
            Music publishing covers the underlying song or
            composition, including its lyrics and melody.
            The sound recording, sometimes called the
            master, is a separate right and would require
            separate permission.
          </p>
        </section>

        <section className="interest-section">
          <h2>
            Interested in future opportunities?
          </h2>

          <p>
            Ray&apos;sStream is developing this program.
            Applications and publishing agreements are not
            available yet.
          </p>

          <span className="coming-badge">
            More details coming soon
          </span>
        </section>

        <p className="disclaimer">
          This page describes a planned service and is not
          an offer or publishing agreement. Final terms
          should be reviewed by qualified music counsel.
        </p>
      </div>
    </main>
  );
} 
