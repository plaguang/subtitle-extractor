import Link from "next/link";
import SubtitleWorkspace, { type SubtitleFormat } from "./SubtitleWorkspace";

export interface LandingConfig {
  h1: string;
  badge: string;
  subtitle: string;
  primaryHint: string;
  defaultExportFormat?: SubtitleFormat;
  whyTitle: string;
  whyItems: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  jsonLdName: string;
  jsonLdDescription: string;
}

const NAV_LINKS = [
  { href: "/", label: "Extract Subtitles from Video" },
  { href: "/srt-to-vtt", label: "SRT to VTT" },
  { href: "/vtt-to-srt", label: "VTT to SRT" },
  { href: "/subtitle-cleaner", label: "Subtitle Cleaner & Sync" },
];

export default function Landing({ config }: { config: LandingConfig }) {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: config.jsonLdName,
    description: config.jsonLdDescription,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Client-side subtitle stream extraction from MP4, MKV, and WebM video containers",
      "Instant two-way conversion between SubRip (.SRT), WebVTT (.VTT), ASS/SSA, and Clean Transcript (.TXT)",
      "1-click removal of HTML formatting tags and [SDH] hearing-impaired sound effect cues",
      "Millisecond timestamp shift (+500ms / -500ms) to fix out-of-sync subtitles",
      "100% local in-browser processing with zero video upload wait time",
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-mono">
              SRT
            </span>
            <span>SubStreamLab</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-10 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span>🎬</span>
            <span>{config.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {config.h1}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {config.subtitle}
          </p>
        </section>

        {/* Interactive Subtitle Extractor & Converter Workspace */}
        <section aria-label="Interactive Subtitle Extractor and Converter">
          <SubtitleWorkspace
            defaultExportFormat={config.defaultExportFormat}
            primaryHint={config.primaryHint}
          />
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {config.steps.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Step {idx + 1}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose SubStreamLab */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">{config.whyTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {config.whyItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs"
              >
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {config.faqs.map((f, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 text-sm">{f.q}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 SubStreamLab — 100% Client-Side Video Subtitle Extractor, SRT/VTT Converter &amp; Timeline Sync Tool.
          </div>
          <div className="flex flex-wrap gap-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-slate-800">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
