import type { Metadata } from "next";
import Landing, { type LandingConfig } from "@/components/Landing";

export const metadata: Metadata = {
  title: "SRT to VTT Converter Online Free – Convert SubRip (.srt) to WebVTT (.vtt)",
  description:
    "Convert SRT subtitle files to HTML5 WebVTT (.vtt) online for free. Automatically formats WEBVTT headers and millisecond decimal separators, with optional HTML/SDH tag cleaning and time shifting.",
  alternates: { canonical: "/srt-to-vtt" },
};

const config: LandingConfig = {
  badge: "Instant SubRip (.SRT) to HTML5 WebVTT (.VTT) Converter • Zero Upload",
  h1: "SRT to VTT Converter Online",
  subtitle:
    "Convert SubRip (.srt) captions to W3C-valid WebVTT (.vtt) files for HTML5 <track> video players, Vimeo, JWPlayer, and LMS platforms. Automatically converts comma timestamps (00:01:20,500) to WebVTT dot notation (00:01:20.500).",
  primaryHint:
    "Drop any .SRT or .ASS subtitle file below to convert it to HTML5 WebVTT (.VTT) immediately.",
  defaultExportFormat: "vtt",
  whyTitle: "Built for Web Developers, Course Creators & Video Engineers",
  whyItems: [
    {
      title: "Strict W3C WebVTT Header & Timestamp Formatting",
      body: "HTML5 <video> elements silently reject subtitles if the WEBVTT header is missing or if timestamps use commas instead of dots. Our converter outputs 100% standards-compliant .vtt files.",
    },
    {
      title: "Live Dual-Pane Timeline & Code Editor",
      body: "Fix typos in individual dialogue cues on the left and watch the generated WebVTT code update character-by-character on the right.",
    },
    {
      title: "Clean Up Legacy ASS/SRT Formatting",
      body: "Strip legacy SubStation Alpha override tags ({\\an8}, {\\pos}) and hearing-impaired brackets in one click before exporting to WebVTT.",
    },
  ],
  steps: [
    {
      title: "Drop Your .SRT File",
      body: "Select any SubRip (.srt) or ASS/SSA subtitle file from your device.",
    },
    {
      title: "Preview & Edit WebVTT Cues",
      body: "Verify the converted dot-separated timestamps, shift sync if needed, or clean formatting tags.",
    },
    {
      title: "Download .VTT or Copy to Clipboard",
      body: "Save the .vtt file for your HTML5 <track> tag or copy the raw WebVTT output directly.",
    },
  ],
  faqs: [
    {
      q: "Why won't my HTML5 <video> player display .SRT files directly?",
      a: "All modern browsers (Chrome, Safari, Firefox, Edge) require the WebVTT (.vtt) specification for native <track kind='subtitles'> elements. Converting your .srt file to .vtt adds the mandatory WEBVTT header and converts millisecond commas to periods.",
    },
    {
      q: "Can I shift the timing of my subtitles while converting SRT to VTT?",
      a: "Yes. Use the '-500ms' and '+500ms' Time Shift Sync buttons to align your captions with your video before clicking 'Download .VTT'.",
    },
    {
      q: "Does this converter preserve multi-line subtitles and UTF-8 characters?",
      a: "Yes. CJK characters (Chinese, Japanese, Korean), Cyrillic, Arabic, Accented Latin, and multi-line dialogue cues are preserved in clean UTF-8 encoding.",
    },
  ],
  jsonLdName: "SRT to VTT Converter Online",
  jsonLdDescription:
    "Free browser-based SubRip (.srt) to HTML5 WebVTT (.vtt) subtitle converter with timeline shifting and tag cleaning.",
};

export default function SrtToVttPage() {
  return <Landing config={config} />;
}
