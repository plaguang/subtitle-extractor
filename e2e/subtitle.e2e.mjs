import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.env.URL || "http://localhost:3126";

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ 断言失败: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

async function run() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const context = await browser.newContext({ acceptDownloads: true });
  await context.route(/googletagmanager|google-analytics|clarity\.ms|_vercel\/insights/i, (route) => route.abort());
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto(BASE, { waitUntil: "load", timeout: 30000 });

  const title = await page.title();
  assert(title.includes("Extract Subtitles from Video"), `页面标题正确 (${title})`);

  // 1. 顶部吸顶导航包含全部 4 个工具入口
  const navCount = await page.locator("header nav a").count();
  assert(navCount === 4, `顶部吸顶导航包含全部 4 个工具入口 (实际 ${navCount})`);

  // 2. 验证自动化测试环境已屏蔽统计污染
  const isBlocked = await page.evaluate(() => navigator.webdriver === true && typeof window.gtag === "undefined");
  assert(isBlocked, "自动化测试环境已成功屏蔽 GA4 / Clarity / Vercel 统计污染");

  // 3. 点击加载内置视频字幕流样本
  await page.getByRole("button", { name: /Load Sample Video Subtitle Stream/i }).click();

  const meta = page.getByTestId("subtitle-meta");
  await meta.waitFor({ state: "visible", timeout: 5000 });
  const metaText = await meta.innerText();
  assert(metaText.includes("5 lines"), `成功加载 5 条内封字幕轨道 (${metaText.replace(/\s+/g, " ")})`);

  const preview = page.getByTestId("subtitle-output-preview");
  const initialOut = await preview.innerText();
  assert(initialOut.includes("00:00:01,200 --> 00:00:04,150"), "初始 .SRT 毫秒逗号时间轴格式正确");

  // 4. 开启 Strip HTML/ASS Tags 与 Remove [SDH] Hearing-Impaired Cues
  await page.getByLabel(/Strip HTML\/ASS Tags/i).check();
  await page.getByLabel(/Remove \[SDH\] Hearing-Impaired Cues/i).check();
  const cleanedOut = await preview.innerText();
  assert(
    !cleanedOut.includes("<i>") && !cleanedOut.includes("[DRAMATIC SYNTH MUSIC PLAYING]"),
    "成功一键清除 HTML 标签 (<i>/<b>) 与 [SDH] 听障音效括号"
  );

  // 5. 点击 +500ms 时间轴偏移按钮，验证时间戳从 00:00:01,200 变为 00:00:01,700
  await page.getByRole("button", { name: "+500ms" }).click();
  const shiftedOut = await preview.innerText();
  assert(shiftedOut.includes("00:00:01,700 --> 00:00:04,650"), "时间轴 +500ms 同步偏移计算准确");

  // 6. 切换到 WebVTT (.VTT) 导出格式，验证 WEBVTT 头部与小数点毫秒格式
  await page.getByRole("button", { name: "WebVTT (.VTT)" }).click();
  const vttOut = await preview.innerText();
  assert(
    vttOut.startsWith("WEBVTT") && vttOut.includes("00:00:01.700 --> 00:00:04.650"),
    "切换为 WebVTT (.VTT) 格式后正确生成 WEBVTT 头与小数点时间戳"
  );

  // 7. 下载导出的 .VTT 文件并校验内容
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download \.VTT/i }).click(),
  ]);
  const dlPath = await download.path();
  const dlText = fs.readFileSync(dlPath, "utf8");
  assert(dlText.startsWith("WEBVTT"), `成功下载导出的 .VTT 字幕文件 (${dlText.length} bytes)`);

  // 8. 点击 New File 并上传刚才导出的 .VTT 文件测试真实文件解析
  await page.getByRole("button", { name: "New File" }).click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(dlPath);
  await meta.waitFor({ state: "visible", timeout: 5000 });
  assert((await meta.innerText()).includes("WebVTT (.vtt)"), "成功上传并解析自定义 .VTT 字幕文件");

  // 9. 校验全部子路由及 SEO 路由返回 HTTP 200 + LLMs.txt + AI 引荐识别
  for (const route of ["/srt-to-vtt", "/vtt-to-srt", "/subtitle-cleaner", "/sitemap.xml", "/robots.txt", "/llms.txt"]) {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    assert(res && res.status() === 200, `路由 ${route} 返回 HTTP 200`);
  }

  await page.goto(`${BASE}/srt-to-vtt?utm_source=gemini.google.com`, { waitUntil: "networkidle" });
  const aiAttr = await page.locator("html").getAttribute("data-ai-referral");
  assert(aiAttr === "google:gemini", `GEOInflow AI 引荐归因识别 html[data-ai-referral="${aiAttr}"]`);

  assert(pageErrors.length === 0, `无页面 JS 错误 (${pageErrors.length})`);

  await browser.close();
  console.log("\n全部通过 🎉");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
