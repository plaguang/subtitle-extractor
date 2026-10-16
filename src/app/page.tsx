import type { Metadata } from "next";
import Landing, { type LandingConfig } from "@/components/Landing";

export const metadata: Metadata = {
  title: "Extract Subtitles from Video Online Free – Rip MP4 & MKV to SRT, VTT or TXT",
  description:
    "Extract embedded subtitle streams from MP4, MKV, and WebM videos directly in your browser without uploading multi-gigabyte video files. Export clean .SRT, .VTT, or .TXT transcripts in milliseconds.",
  alternates: { canonical: "/" },
};

const config: LandingConfig = {
  badge: "100% Client-Side • Zero Video Upload • MP4 / MKV / SRT / VTT / ASS",
  h1: "Extract Subtitles from Video Online",
  subtitle:
    "Rip embedded soft-subtitle tracks from MP4, MKV, and WebM video containers or convert existing caption files into clean .SRT, .VTT, or plain-text transcripts. Runs 100% locally in your browser with zero gigabyte upload queues.",
  primaryHint:
    "Drop an MP4/MKV video with embedded subtitles or any .SRT / .VTT / .ASS caption file — zero server upload.",
  defaultExportFormat: "srt",
  whyTitle: "Why Video Editors, Translators & Researchers Use SubStreamLab",
  whyItems: [
    {
      title: "No Multi-Gigabyte Video Uploads",
      body: "Traditional cloud subtitle extractors force you to upload a 2 GB MP4 or MKV file over your internet connection before extracting a 40 KB text track. SubStreamLab scans your file directly in local browser memory in milliseconds.",
    },
    {
      title: "1-Click HTML & [SDH] Hearing-Impaired Cleaner",
      body: "Strip annoying <i>, <b>, and {\\an8} styling tags or remove [MUSIC PLAYING] and (ALARM BEEPING) hearing-impaired cues before exporting your clean SRT or study transcript.",
    },
    {
      title: "Instant Millisecond Time-Shift Sync",
      body: "Are your extracted subtitles 0.5s or 2s ahead of the spoken dialogue? Shift the entire subtitle timeline forward or backward in 500ms steps and preview every cue live.",
    },
  ],
  steps: [
    {
      title: "Drop Your Video or Caption File",
      body: "Select an MP4/MKV file containing embedded soft subtitles, or drop any .SRT, .VTT, or .ASS subtitle file.",
    },
    {
      title: "Clean Tags & Sync Timing",
      body: "Toggle 'Strip HTML/ASS Tags' or 'Remove [SDH] Cues', edit dialogue lines inline, and adjust timestamp offset if needed.",
    },
    {
      title: "Download .SRT, .VTT or .TXT",
      body: "Export standards-compliant SubRip (.srt), WebVTT (.vtt), or a deduplicated plain-text script (.txt).",
    },
  ],
  faqs: [
    {
      q: "Why is extracting subtitles in SubStreamLab so fast compared to other sites?",
      a: "Because your video file never leaves your computer. SubStreamLab reads the binary container stream locally in your browser using JavaScript ArrayBuffer and extracts the UTF-8 subtitle cues without uploading a single byte to a server.",
    },
    {
      q: "What is the difference between soft subtitles and hardcoded (burned-in) subtitles?",
      a: "Soft subtitles are stored as a separate text stream (such as tx3g, wvtt, or S_TEXT/UTF8) inside an MP4 or MKV container and can be extracted losslessly in milliseconds. Burned-in subtitles are permanently painted into the video pixels.",
    },
    {
      q: "Can I also convert extracted subtitles into a plain text article or script?",
      a: "Yes. Click 'Clean Transcript (.TXT)' in the Export Format bar to strip all sequence numbers and timestamps, leaving a clean, readable dialogue transcript.",
    },
  ],
  jsonLdName: "Extract Subtitles from Video Online",
  jsonLdDescription:
    "Free client-side video subtitle extractor and SRT/VTT/ASS converter with SDH cleaning and timestamp sync.",
};

export default function HomePage() {
  return <Landing config={config} />;
}
