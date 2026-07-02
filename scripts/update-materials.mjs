import fs from "node:fs/promises";
import vm from "node:vm";

const dataPath = new URL("../materials-data.js", import.meta.url);
const sourceText = await fs.readFile(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(sourceText, sandbox, { filename: "materials-data.js" });

const materials = Array.isArray(sandbox.window.CARBON_MATERIALS) ? sandbox.window.CARBON_MATERIALS : [];
const sourceDetails = sandbox.window.CARBON_SOURCE_DETAILS || {};
const feedMeta = sandbox.window.CARBON_FEED_META || {};

const queries = [
  "advanced carbon allotrope synthesis graphyne fullerene nanoporous graphene",
  "pure carbon defect topology amorphous carbon nonbenzenoid carbon allotrope",
  "carbon nanomaterial synthesis Nature Science graphyne graphene nanoribbon",
  "porous carbon graphene edge sites oxygen reduction hydrogen peroxide",
  "heteroatom doped carbon two electron oxygen reduction hydrogen peroxide"
];

const highValueVenues = [
  "Nature",
  "Science",
  "Cell",
  "Nature Materials",
  "Nature Nanotechnology",
  "Nature Catalysis",
  "Nature Communications",
  "Nature Synthesis",
  "Journal of the American Chemical Society",
  "JACS",
  "Advanced Materials",
  "Energy & Environmental Science",
  "ACS Nano",
  "ACS Catalysis",
  "Nano Letters",
  "Angewandte Chemie",
  "Carbon"
];

const blockedTitleWords = /\b(review|perspective|editorial|correction|retraction|erratum|comment)\b/i;
const carbonWords = /\b(carbon|graphene|graphyne|graphdiyne|fullerene|nanoribbon|nanothread|nanoporous|diamond|diamane|nanotube|c2n|carbide)\b/i;

const existingNames = new Set(materials.map((item) => normalize(item.name)));
const existingTitles = new Set(
  Object.values(sourceDetails)
    .map((item) => normalize(item.title || ""))
    .filter(Boolean)
);

const candidates = [];
for (const query of queries) {
  const works = await queryCrossref(query);
  for (const work of works) {
    const candidate = workToCandidate(work);
    if (!candidate) continue;
    const nameKey = normalize(candidate.material.name);
    const titleKey = normalize(candidate.source.title);
    if (existingNames.has(nameKey) || existingTitles.has(titleKey)) continue;
    if (candidates.some((item) => normalize(item.source.title) === titleKey)) continue;
    candidates.push(candidate);
    if (candidates.length >= 3) break;
  }
  if (candidates.length >= 3) break;
}

const maxRank = materials.reduce((max, item) => Math.max(max, Number(item.rank) || 0), 0);
const now = new Date();
const updatedAt = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).format(now).replaceAll("/", "-");

candidates.forEach((candidate, index) => {
  candidate.material.rank = maxRank + index + 1;
  materials.push(candidate.material);
  sourceDetails[candidate.material.name] = candidate.source;
});

const nextFeedMeta = {
  cadence: "每 3 小时",
  updatedAt: `${updatedAt} Asia/Shanghai`,
  sourcePolicy: feedMeta.sourcePolicy || "三大顶刊、三大顶刊子刊、Nature Index 来源、高评价材料/催化期刊、先进实验室新闻、科学报道和前沿碳材料公司产品",
  lastRunSummary: candidates.length
    ? `自动新增 ${candidates.length} 个候选：${candidates.map((item) => item.material.name).join("；")}`
    : "本轮已检索，未发现足够可信且不重复的新候选。"
};

const output = [
  `window.CARBON_MATERIALS = ${JSON.stringify(materials, null, 2)};`,
  "",
  `window.CARBON_FEED_META = ${JSON.stringify(nextFeedMeta, null, 2)};`,
  "",
  `window.CARBON_SOURCE_DETAILS = ${JSON.stringify(sourceDetails, null, 2)};`,
  ""
].join("\n");

await fs.writeFile(dataPath, output, "utf8");
console.log(nextFeedMeta.lastRunSummary);

async function queryCrossref(query) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.title", query);
  url.searchParams.set("filter", `from-pub-date:${new Date().getFullYear() - 3}-01-01,type:journal-article`);
  url.searchParams.set("sort", "published");
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", "12");
  url.searchParams.set("mailto", "carbon-finder@example.com");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CarbonFinderPro/1.0 (scheduled literature scan)"
      }
    });
    if (!response.ok) return [];
    const json = await response.json();
    return json?.message?.items || [];
  } catch (error) {
    console.log(`Crossref query failed: ${query}`);
    return [];
  }
}

function workToCandidate(work) {
  const title = cleanText(work.title?.[0] || "");
  const venue = cleanText(work["container-title"]?.[0] || "");
  const year = String(
    work.published?.["date-parts"]?.[0]?.[0]
      || work.created?.["date-parts"]?.[0]?.[0]
      || new Date().getFullYear()
  );
  const doi = work.DOI || "";
  const link = doi ? `https://doi.org/${doi}` : (work.URL || "");
  const combined = `${title} ${venue}`;

  if (!title || !venue || blockedTitleWords.test(title)) return null;
  if (!carbonWords.test(combined)) return null;
  if (!isHighValueVenue(venue)) return null;

  const classification = classify(title);
  const materialName = deriveMaterialName(title);
  const sourceWeight = venueWeight(venue);

  return {
    material: {
      priority: classification.priority,
      rank: 0,
      name: materialName,
      route: classification.route,
      category: classification.category,
      sourceWeight,
      source: link || `检索线索：${title}`,
      novelty: classification.novelty,
      evidence: classification.evidence,
      transfer: classification.transfer,
      access: classification.access,
      blank: classification.blank,
      innovation: `云端自动检索到的高权重来源候选。题名指向 ${classification.route}，建议优先核查结构表征与合成可重复性。`,
      hypothesis: classification.hypothesis,
      experiment: "先按原文路线确认样品可得性；若样品难获取，寻找同结构低门槛替代模型并进行 RRDE 快速筛选。",
      tests: "XPS/Raman/TEM/BET 或原文关键结构证据；RRDE；H2O2 化学定量；H2O2 分解/歧化测试。",
      risk: "该条目由自动检索加入，进入正式实验前需要人工复核全文、样品纯度和二电子 ORR 相关性。",
      action: "自动新增，人工复核"
    },
    source: {
      kind: "文献",
      venue,
      year,
      title,
      link
    }
  };
}

function classify(title) {
  const lower = title.toLowerCase();
  if (/allotrope|graphyne|fullerene|nonbenzenoid|amorphous carbon|nanoribbon|nanothread|diamane|diamond/.test(lower)) {
    return {
      priority: "P0",
      route: "新碳相/纯碳拓扑",
      category: /fluor|hydrogen|terminated/.test(lower) ? "表面终止碳" : "纯碳",
      novelty: 5,
      evidence: 5,
      transfer: /oxygen reduction|peroxide|h2o2/.test(lower) ? 5 : 4,
      access: 2,
      blank: 5,
      hypothesis: "新碳相或纯碳拓扑可能提供非常规 *OOH 吸附位点、曲率/应变或非六元环效应，适合做二电子 ORR 的跨方向验证。"
    };
  }
  if (/nanoporous|porous|edge|defect|aerogel|nanomesh|microporous/.test(lower)) {
    return {
      priority: "P1",
      route: "纯碳孔/边缘/缺陷工程",
      category: "纯碳/轻微含氧",
      novelty: 4,
      evidence: 4,
      transfer: /oxygen reduction|peroxide|h2o2/.test(lower) ? 5 : 4,
      access: 3,
      blank: 4,
      hypothesis: "孔口、边缘和缺陷可改变 O2 富集、局部水环境和 *OOH 脱附，是二电子 ORR 值得优先迁移的结构变量。"
    };
  }
  if (/doped|nitrogen|boron|sulfur|phosphorus|fluorine|single.atom|metal/.test(lower)) {
    return {
      priority: "P2",
      route: "掺杂碳/单原子调控",
      category: "掺杂碳",
      novelty: 3,
      evidence: 4,
      transfer: /oxygen reduction|peroxide|h2o2/.test(lower) ? 5 : 3,
      access: 3,
      blank: 3,
      hypothesis: "杂原子或单原子位点可调节邻近碳电荷和 *OOH 结合能，但需重点排查 4e ORR 与 H2O2 分解副作用。"
    };
  }
  return {
    priority: "P3",
    route: "碳基异质结/复合结构",
    category: "碳基复合",
    novelty: 3,
    evidence: 4,
    transfer: 3,
    access: 3,
    blank: 3,
    hypothesis: "异质界面可能改变电子传输、局部亲疏水性和 O2 传质，更适合作为工程放大或对照方向。"
  };
}

function isHighValueVenue(venue) {
  return highValueVenues.some((name) => venue.toLowerCase().includes(name.toLowerCase()));
}

function venueWeight(venue) {
  if (/^(Nature|Science|Cell)$/i.test(venue)) return `${venue} 主刊`;
  if (/Nature|Science|Cell/i.test(venue)) return `${venue} / 顶刊子刊`;
  if (/Journal of the American Chemical Society|JACS|Advanced Materials|Energy & Environmental Science|ACS Nano|Nano Letters|ACS Catalysis/i.test(venue)) {
    return `${venue} / 高评价期刊`;
  }
  return `${venue} / 文献来源`;
}

function deriveMaterialName(title) {
  const shortened = title.replace(/\s+/g, " ").trim();
  return shortened.length > 96 ? `${shortened.slice(0, 93)}...` : shortened;
}

function cleanText(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
}
