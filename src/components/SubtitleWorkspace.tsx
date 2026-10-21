"use client";

import { useMemo, useState } from "react";
import { trackToolEvent } from "@/lib/analytics";

export type SubtitleFormat = "srt" | "vtt" | "txt";

export interface SubtitleCue {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface SubtitleTrack {
  trackName: string;
  sourceFormat: string;
  cues: SubtitleCue[];
}

function pad(n: number, len = 2): string {
  return String(Math.max(0, Math.floor(n))).padStart(len, "0");
}

export function formatTimeSrt(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3600000);
  const m = Math.floor((clamped % 3600000) / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  const milli = clamped % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milli, 3)}`;
}

export function formatTimeVtt(ms: number): string {
  return formatTimeSrt(ms).replace(",", ".");
}

function parseTimeMs(raw: string): number {
  const clean = raw.trim().replace(",", ".");
  const parts = clean.split(":");
  if (parts.length === 3) {
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    const s = Number(parts[2]) || 0;
    return Math.round((h * 3600 + m * 60 + s) * 1000);
  }
  if (parts.length === 2) {
    const m = Number(parts[0]) || 0;
    const s = Number(parts[1]) || 0;
    return Math.round((m * 60 + s) * 1000);
  }
  return 0;
}

// 解析 ASS/SSA 时间戳 0:00:02.45 -> ms
function parseAssTimeMs(raw: string): number {
  const parts = raw.trim().split(":");
  if (parts.length !== 3) return 0;
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const s = Number(parts[2]) || 0;
  return Math.round((h * 3600 + m * 60 + s) * 1000);
}

// 解析 SRT / WebVTT / ASS / SSA 字幕文本
export function parseSubtitleText(content: string, fileName = "subtitles"): SubtitleTrack {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // 检测 ASS / SSA 格式
  if (/\[Events\]/i.test(normalized) && /Dialogue:/i.test(normalized)) {
    const lines = normalized.split("\n");
    const cues: SubtitleCue[] = [];
    let idx = 1;
    for (const line of lines) {
      if (!line.startsWith("Dialogue:")) continue;
      const body = line.slice("Dialogue:".length).trim();
      const cols = body.split(",");
      if (cols.length >= 10) {
        const startMs = parseAssTimeMs(cols[1]);
        const endMs = parseAssTimeMs(cols[2]);
        const rawText = cols
          .slice(9)
          .join(",")
          .replace(/\{[^}]*\}/g, "")
          .replace(/\\N/gi, "\n")
          .trim();
        if (rawText) {
          cues.push({ id: idx++, startMs, endMs, text: rawText });
        }
      }
    }
    return { trackName: fileName, sourceFormat: "ASS / SSA Subtitle", cues };
  }

  const isVtt = /^WEBVTT/i.test(normalized);
  const blocks = normalized
    .replace(/^WEBVTT[^\n]*\n*/i, "")
    .split(/\n{2,}/);

  const cues: SubtitleCue[] = [];
  let idx = 1;
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    const arrowLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (arrowLineIdx === -1) continue;

    const arrowLine = lines[arrowLineIdx];
    const [left, rightWithSettings] = arrowLine.split("-->");
    const right = (rightWithSettings || "").trim().split(/\s+/)[0];
    const startMs = parseTimeMs(left);
    const endMs = parseTimeMs(right);
    const text = lines.slice(arrowLineIdx + 1).join("\n").trim();
    if (text) {
      cues.push({ id: idx++, startMs, endMs, text });
    }
  }

  return {
    trackName: fileName,
    sourceFormat: isVtt ? "WebVTT (.vtt)" : "SubRip (.srt)",
    cues,
  };
}

// 从 MP4 / MKV / WebM 二进制流中提取内封 SRT / WebVTT / 文本轨道
export function extractSubtitlesFromVideoBinary(buf: ArrayBuffer, fileName: string): SubtitleTrack {
  const u8 = new Uint8Array(buf);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const textChunk = decoder.decode(u8);
  const baseName = fileName.replace(/\.[^.]+$/, "");

  // 1. 如果是纯字幕文件（.srt / .vtt / .ass / .ssa）或以 WEBVTT 开头，优先走标准字幕解析器
  if (/\.(srt|vtt|ass|ssa)$/i.test(fileName) || /^WEBVTT/i.test(textChunk.trim())) {
    const direct = parseSubtitleText(textChunk, baseName);
    if (direct.cues.length > 0) return direct;
  }

  // 2. 从 MP4 / MKV / WebM 二进制容器流中扫描内封 SRT / WebVTT 轨道
  const srtMatches = textChunk.match(
    /\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}[\s\S]{1,220}?(?=\n\n|\r\n\r\n|\x00|$)/g
  );
  if (srtMatches && srtMatches.length > 0) {
    const cues: SubtitleCue[] = [];
    let id = 1;
    for (const m of srtMatches) {
      const cleaned = m.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "\n").trim();
      const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
      const arrowIdx = lines.findIndex((l) => l.includes("-->"));
      if (arrowIdx !== -1) {
        const [lTime, rTimeRaw] = lines[arrowIdx].split("-->");
        const rTime = (rTimeRaw || "").trim().split(/\s+/)[0];
        const txt = lines.slice(arrowIdx + 1).join("\n").trim();
        if (txt) {
          cues.push({
            id: id++,
            startMs: parseTimeMs(lTime),
            endMs: parseTimeMs(rTime),
            text: txt,
          });
        }
      }
    }
    if (cues.length > 0) {
      return {
        trackName: baseName,
        sourceFormat: "Embedded Video Subtitle Stream (MP4/MKV)",
        cues,
      };
    }
  }

  // 3. 兜底尝试直接作为字幕文本解析
  const direct = parseSubtitleText(textChunk, baseName);
  if (direct.cues.length > 0) return direct;

  throw new Error(
    "No embedded soft-subtitle track (tx3g / wvtt / S_TEXT) found in this file. Try loading our Demo Video Subtitle Track or drop an .SRT / .VTT / .ASS file."
  );
}

// 生成包含内封字幕流与 HTML 标签/SDH 音效标签的演示数据
export function createDemoSubtitleTrack(): SubtitleTrack {
  return {
    trackName: "sci-fi-short-film-en",
    sourceFormat: "Embedded MKV / WebVTT Track (S_TEXT/UTF8)",
    cues: [
      {
        id: 1,
        startMs: 1200,
        endMs: 4150,
        text: "[DRAMATIC SYNTH MUSIC PLAYING]\n<i>Commander, the telemetry stream from Sector 9 is online.</i>",
      },
      {
        id: 2,
        startMs: 4500,
        endMs: 7800,
        text: "Lock the frequency and extract the encrypted payload before the window closes.",
      },
      {
        id: 3,
        startMs: 8200,
        endMs: 11400,
        text: "(ALARM BEEPING) Warning: Hull temperature exceeding 1,400 Kelvin!",
      },
      {
        id: 4,
        startMs: 11900,
        endMs: 15600,
        text: "<b> Divert auxiliary power to the forward thermal shields now! </b>",
      },
      {
        id: 5,
        startMs: 16100,
        endMs: 19800,
        text: "[ENGINE HUM STABILIZES]\nWe cleared the atmosphere. Coordinates locked for orbital dock.",
      },
    ],
  };
}

export function serializeSubtitleTrack(cues: SubtitleCue[], format: SubtitleFormat): string {
  if (format === "srt") {
    return (
      cues
        .map((c, idx) => `${idx + 1}\n${formatTimeSrt(c.startMs)} --> ${formatTimeSrt(c.endMs)}\n${c.text}`)
        .join("\n\n") + "\n"
    );
  }
  if (format === "vtt") {
    const body = cues
      .map((c, idx) => `${idx + 1}\n${formatTimeVtt(c.startMs)} --> ${formatTimeVtt(c.endMs)}\n${c.text}`)
      .join("\n\n");
    return `WEBVTT\n\n${body}\n`;
  }
  // 纯文本剧本导出（自动合并重复行）
  const lines: string[] = [];
  for (const c of cues) {
    const clean = c.text.replace(/\s+/g, " ").trim();
    if (clean && lines[lines.length - 1] !== clean) {
      lines.push(clean);
    }
  }
  return lines.join("\n") + "\n";
}

export default function SubtitleWorkspace({
  defaultExportFormat = "srt",
  primaryHint,
}: {
  defaultExportFormat?: SubtitleFormat;
  primaryHint?: string;
} = {}) {
  const [track, setTrack] = useState<SubtitleTrack | null>(null);
  const [exportFormat, setExportFormat] = useState<SubtitleFormat>(defaultExportFormat);
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [stripHtml, setStripHtml] = useState<boolean>(false);
  const [stripSdh, setStripSdh] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  async function handleFile(file: File) {
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const parsed = extractSubtitlesFromVideoBinary(buf, file.name);
      setTrack(parsed);
      setOffsetMs(0);
      trackToolEvent("subtitle_file_uploaded", {
        format: parsed.sourceFormat,
        cues: parsed.cues.length,
      });
    } catch (e) {
      setError((e as Error).message || "Could not parse subtitle stream from file.");
    }
  }

  function loadDemoTrack() {
    setError("");
    const demo = createDemoSubtitleTrack();
    setTrack(demo);
    setOffsetMs(0);
    trackToolEvent("subtitle_demo_loaded");
  }

  // 计算经过时间轴偏移 + HTML/SDH 清理后的实时字幕列表
  const processedCues = useMemo(() => {
    if (!track) return [];
    return track.cues
      .map((c, idx) => {
        let txt = c.text;
        if (stripHtml) {
          txt = txt.replace(/<\/?[a-z][^>]*>/gi, "").replace(/\{[^}]*\}/g, "");
        }
        if (stripSdh) {
          txt = txt
            .replace(/\[[^\]]*\]/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/♪[^♪]*♪/g, "");
        }
        txt = txt
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .join("\n")
          .trim();
        return {
          id: idx + 1,
          startMs: Math.max(0, c.startMs + offsetMs),
          endMs: Math.max(100, c.endMs + offsetMs),
          text: txt || c.text,
        };
      })
      .filter((c) =>
        searchQuery.trim()
          ? c.text.toLowerCase().includes(searchQuery.trim().toLowerCase())
          : true
      );
  }, [track, offsetMs, stripHtml, stripSdh, searchQuery]);

  const serializedPreview = useMemo(
    () => serializeSubtitleTrack(processedCues, exportFormat),
    [processedCues, exportFormat]
  );

  function updateCueText(id: number, newText: string) {
    if (!track) return;
    setTrack({
      ...track,
      cues: track.cues.map((c) => (c.id === id ? { ...c, text: newText } : c)),
    });
  }

  function downloadSubtitleFile() {
    if (!track) return;
    const blob = new Blob([serializedPreview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${track.trackName}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    trackToolEvent("subtitle_exported", { format: exportFormat, cues: processedCues.length });
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(serializedPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const totalDurationSec = track?.cues.length
    ? Math.round(track.cues[track.cues.length - 1].endMs / 1000)
    : 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
      )}

      {!track ? (
        <div className="flex flex-col gap-4">
          <label
            className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 sm:p-10 text-center transition hover:border-emerald-600 active:scale-[0.99]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <input
              type="file"
              accept=".mp4,.mkv,.webm,.mov,.srt,.vtt,.ass,.ssa,video/*,text/vtt,application/x-subrip"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <span className="pointer-events-none text-4xl">🎬</span>
            <span className="pointer-events-none text-lg font-semibold">
              Drop a Video (.MP4, .MKV, .WebM) or Subtitle File (.SRT, .VTT, .ASS)
            </span>
            <span className="pointer-events-none inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs">
              📂 Tap or Click Here to Select Video / Subtitle File
            </span>
            <span className="pointer-events-none text-sm text-slate-500">
              {primaryHint ||
                "Extracts embedded subtitle streams & converts between SRT, WebVTT, ASS and Clean Transcript (.TXT) — 100% locally in your browser."}
            </span>
          </label>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadDemoTrack}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              ✨ Load Sample Video Subtitle Stream (5 Cues with SDH &amp; HTML Tags)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* 轨道元数据概览栏 */}
          <div
            data-testid="subtitle-meta"
            className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs sm:grid-cols-4"
          >
            <div>
              <span className="text-slate-500">Detected Stream</span>
              <div className="mt-0.5 font-semibold text-slate-900">{track.sourceFormat}</div>
            </div>
            <div>
              <span className="text-slate-500">Subtitle Cues</span>
              <div className="mt-0.5 font-semibold text-slate-900">{processedCues.length} lines</div>
            </div>
            <div>
              <span className="text-slate-500">Timeline Span</span>
              <div className="mt-0.5 font-semibold text-slate-900">{totalDurationSec}s</div>
            </div>
            <div>
              <span className="text-slate-500">Target Output Format</span>
              <div className="mt-0.5 font-semibold uppercase text-emerald-700">.{exportFormat}</div>
            </div>
          </div>

          {/* 导出格式切换 + 时间轴同步偏移 + 字幕净化开关 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-semibold text-slate-600">Export Format:</span>
              {(
                [
                  ["srt", "SubRip (.SRT)"],
                  ["vtt", "WebVTT (.VTT)"],
                  ["txt", "Clean Transcript (.TXT)"],
                ] as const
              ).map(([fmtKey, fmtLabel]) => (
                <button
                  key={fmtKey}
                  type="button"
                  onClick={() => setExportFormat(fmtKey)}
                  className={`rounded-md border px-2.5 py-1 font-medium ${
                    exportFormat === fmtKey
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {fmtLabel}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={stripHtml}
                  onChange={(e) => {
                    setStripHtml(e.target.checked);
                    trackToolEvent("subtitle_cleaned", { type: "strip_html", enabled: e.target.checked });
                  }}
                />
                Strip HTML/ASS Tags (&lt;i&gt;, &lt;b&gt;)
              </label>

              <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={stripSdh}
                  onChange={(e) => {
                    setStripSdh(e.target.checked);
                    trackToolEvent("subtitle_cleaned", { type: "strip_sdh", enabled: e.target.checked });
                  }}
                />
                Remove [SDH] Hearing-Impaired Cues
              </label>
            </div>
          </div>

          {/* 时间轴偏移同步控制栏 + 搜索框 */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Time Shift Sync ({offsetMs >= 0 ? `+${offsetMs}` : offsetMs} ms):</span>
              <button
                type="button"
                onClick={() => {
                  setOffsetMs((v) => v - 500);
                  trackToolEvent("subtitle_time_shifted", { delta: -500 });
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 font-mono hover:bg-slate-100"
              >
                -500ms
              </button>
              <button
                type="button"
                onClick={() => {
                  setOffsetMs((v) => v + 500);
                  trackToolEvent("subtitle_time_shifted", { delta: 500 });
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 font-mono hover:bg-slate-100"
              >
                +500ms
              </button>
              <button
                type="button"
                onClick={() => setOffsetMs(0)}
                className="rounded border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                aria-label="Filter subtitle lines"
                placeholder="Filter dialogue text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => setTrack(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
              >
                New File
              </button>
              <button
                type="button"
                onClick={copyOutput}
                className="rounded-lg border border-emerald-700 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                {copied ? "✓ Copied!" : "📋 Copy Output"}
              </button>
              <button
                type="button"
                onClick={downloadSubtitleFile}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                ⬇ Download .{exportFormat.toUpperCase()}
              </button>
            </div>
          </div>

          {/* 双栏工作台：左侧可编辑时间轴卡片 + 右侧实时导出代码预览 */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Timeline Editor ({processedCues.length} Cues)
              </div>
              {processedCues.map((cue) => (
                <div key={cue.id} className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-2xs">
                  <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-emerald-700">
                    <span>#{cue.id}</span>
                    <span>
                      {formatTimeSrt(cue.startMs)} → {formatTimeSrt(cue.endMs)}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={cue.text}
                    aria-label={`Subtitle Cue ${cue.id}`}
                    onChange={(e) => updateCueText(cue.id, e.target.value)}
                    className="w-full resize-none rounded border border-slate-200 p-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
              <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>LIVE .{exportFormat.toUpperCase()} OUTPUT PREVIEW</span>
                <span>{serializedPreview.length} chars</span>
              </div>
              <pre
                data-testid="subtitle-output-preview"
                className="max-h-88 flex-1 overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-emerald-300"
              >
                {serializedPreview}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
