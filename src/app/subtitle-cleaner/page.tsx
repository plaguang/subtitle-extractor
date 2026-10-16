import type { Metadata } from "next";
import Landing, { type LandingConfig } from "@/components/Landing";

export const metadata: Metadata = {
  title: "Online Subtitle Cleaner, Resync & SRT to TXT Transcript Converter",
  description:
    "Clean SRT, VTT, and ASS subtitle files online. Remove SDH hearing-impaired brackets, strip HTML/ASS tags, shift out-of-sync timestamps by milliseconds, or convert subtitles to plain text (.txt).",
  alternates: { canonical: "/subtitle-cleaner" },
};

const config: LandingConfig = {
  badge: "Strip [SDH] & HTML Tags • Millisecond Time-Shift Sync • Subtitle to Plain Text (.TXT)",
  h1: "Online Subtitle Cleaner, Time Shifter & TXT Converter",
  subtitle:
    "Remove annoying [SDH] sound descriptions, strip HTML/ASS styling tags, fix out-of-sync subtitle delays in milliseconds, or convert any .SRT/.VTT file into a clean readable transcript (.TXT).",
  primaryHint:
    "Drop an .SRT, .VTT, or .ASS file to strip [SDH]/HTML tags, shift timestamps, or convert to plain text (.TXT).",
  defaultExportFormat: "txt",
  whyTitle: "All-in-One Subtitle Hygiene & Transcript Extraction",
  whyItems: [
    {
      title: "Remove [SDH] Hearing-Impaired Clutter",
      body: "Automatically strip bracketed cues like [DRAMATIC MUSIC], (SIGHS), and ♪ lyrics ♪ so viewers can read pure spoken dialogue without distractions.",
    },
    {
      title: "Fix Subtitle Delay (+500ms / -500ms Time Shift)",
      body: "Resynchronize subtitles that drift ahead or behind the audio track without installing desktop subtitle editors like Subtitle Edit or Aegisub.",
    },
    {
      title: "Convert Subtitles to Clean Study Notes (.TXT)",
      body: "Turn lecture, podcast, or documentary .SRT/.VTT files into clean, deduplicated paragraphs ready for Notion, Obsidian, or LLM summarization.",
    },
  ],
  steps: [
    {
      title: "Drop Your Subtitle File",
      body: "Upload any .SRT, .VTT, or .ASS/SSA file from your device.",
    },
    {
      title: "Toggle Cleaning Rules & Time Shift",
      body: "Check 'Strip HTML/ASS Tags' and 'Remove [SDH] Cues', or adjust the millisecond offset.",
    },
    {
      title: "Export Clean .TXT, .SRT or .VTT",
      body: "Download the cleaned file or copy the output directly to your clipboard.",
    },
  ],
  faqs: [
    {
      q: "How do I convert an SRT or VTT file into plain text without timestamps?",
      a: "This page defaults to 'Clean Transcript (.TXT)' mode, which automatically removes all cue numbers and timecodes and merges the dialogue into clean plain text.",
    },
    {
      q: "What does 'Remove [SDH] Hearing-Impaired Cues' remove?",
      a: "It removes text enclosed in square brackets [...] or parentheses (...) such as [DOOR SLAMS] or (LAUGHING), as well as musical note markers (♪), while keeping all spoken dialogue intact.",
    },
    {
      q: "Can I edit individual subtitle lines before downloading?",
      a: "Yes. Every cue in the left-hand Interactive Timeline Editor is an editable text box — any change you type updates the right-hand output preview immediately.",
    },
  ],
  jsonLdName: "Online Subtitle Cleaner & SRT to TXT Converter",
  jsonLdDescription:
    "Clean SDH and HTML tags from subtitles, shift timestamps, and convert SRT/VTT to plain text (.txt) in your browser.",
};

export default function SubtitleCleanerPage() {
  return <Landing config={config} />;
}
