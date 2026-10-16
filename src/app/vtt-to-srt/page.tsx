import type { Metadata } from "next";
import Landing, { type LandingConfig } from "@/components/Landing";

export const metadata: Metadata = {
  title: "VTT to SRT Converter Online Free – Convert WebVTT (.vtt) to SubRip (.srt)",
  description:
    "Convert WebVTT (.vtt) captions to standard SubRip (.srt) subtitle files online in your browser. Automatically strips cue settings, numbers sequences, and formats timestamps for Premiere Pro, DaVinci Resolve, and VLC.",
  alternates: { canonical: "/vtt-to-srt" },
};

const config: LandingConfig = {
  badge: "WebVTT (.VTT) to SubRip (.SRT) Converter • Premiere / DaVinci / VLC Ready",
  h1: "VTT to SRT Converter Online",
  subtitle:
    "Convert WebVTT (.vtt) captions downloaded from YouTube, Vimeo, Zoom, or Coursera into standard SubRip (.srt) files compatible with Premiere Pro, DaVinci Resolve, CapCut, and VLC.",
  primaryHint:
    "Drop any .VTT file below — automatically strips WebVTT headers/cue positioning and formats clean .SRT timestamps.",
  defaultExportFormat: "srt",
  whyTitle: "Why Editors Convert WebVTT to SubRip (.SRT)",
  whyItems: [
    {
      title: "Strips WebVTT Cue Positioning & Header Noise",
      body: "WebVTT files downloaded from streaming platforms often contain inline cue positioning (like 'align:start position:0%') that breaks NLE video editors. Our parser strips those attributes cleanly.",
    },
    {
      title: "Sequential Cue Renumbering",
      body: "Many .vtt files omit cue numbers or use non-numeric identifiers. SubStreamLab automatically generates sequential 1, 2, 3... index headers required by the SubRip specification.",
    },
    {
      title: "Also Export as Clean Plain-Text Script (.TXT)",
      body: "Need lecture notes or a clean interview transcript from a Zoom/YouTube VTT file? Switch Export Format to '.TXT' to strip all timestamps in one click.",
    },
  ],
  steps: [
    {
      title: "Select Your .VTT File",
      body: "Drop any WebVTT (.vtt) caption file from your computer.",
    },
    {
      title: "Clean SDH & Formatting Tags",
      body: "Optionally remove <i>/<b> tags or [SDH] sound descriptions and verify the timeline.",
    },
    {
      title: "Download .SRT or .TXT",
      body: "Click 'Download .SRT' to save a compatible SubRip file for Premiere, DaVinci, or VLC.",
    },
  ],
  faqs: [
    {
      q: "Why does DaVinci Resolve or Premiere Pro fail to import my .VTT file?",
      a: "Many video editors and hardware media players require sequential cue numbers and comma-separated milliseconds (00:00:05,200) found in .SRT files, and choke on WebVTT cue settings like 'line:85%'. Converting VTT to SRT fixes both issues.",
    },
    {
      q: "Can I remove [Music] and [Applause] tags from YouTube VTT captions?",
      a: "Yes. Check 'Remove [SDH] Hearing-Impaired Cues' in the toolbar to strip bracketed sound effects automatically.",
    },
    {
      q: "Is there any limit on file size or number of subtitle lines?",
      a: "No. Even 3-hour movie or lecture subtitle files (5,000+ cues) convert in under 20 milliseconds locally in your browser.",
    },
  ],
  jsonLdName: "VTT to SRT Converter Online",
  jsonLdDescription:
    "Free browser-based WebVTT (.vtt) to SubRip (.srt) and plain-text transcript (.txt) converter.",
};

export default function VttToSrtPage() {
  return <Landing config={config} />;
}
