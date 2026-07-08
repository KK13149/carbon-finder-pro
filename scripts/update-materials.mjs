import fs from "node:fs/promises";
import vm from "node:vm";

const dataPath = new URL("../materials-data.js", import.meta.url);
const sourceText = await fs.readFile(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(sourceText, sandbox, { filename: "materials-data.js" });

const materials = Array.isArray(sandbox.window.CARBON_MATERIALS) ? sandbox.window.CARBON_MATERIALS : [];
const sourceDetails = sandbox.window.CARBON_SOURCE_DETAILS || {};
const literature = Array.isArray(sandbox.window.CARBON_2E_ORR_LITERATURE) ? sandbox.window.CARBON_2E_ORR_LITERATURE : [];
const feedMeta = sandbox.window.CARBON_FEED_META || {};
const PUBLISHED_LITERATURE_BATCH_SIZE = 31;
const CANDIDATE_MATERIAL_BATCH_SIZE = 11;

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
  "Advanced Energy Materials",
  "Energy & Environmental Science",
  "Angewandte Chemie",
  "ACS Nano",
  "ACS Catalysis",
  "Nano Letters",
  "Journal of Materials Chemistry A",
  "Chemical Communications",
  "Chemistry - A European Journal",
  "Electrochimica Acta",
  "Journal of Colloid and Interface Science",
  "Carbon",
  "Chemical Engineering Journal",
  "Chinese Chemical Letters",
  "Industrial & Engineering Chemistry Research",
  "Science Bulletin",
  "ACS Applied Materials & Interfaces",
  "ChemElectroChem",
  "Energy & Fuels",
  "Catalysis Science & Technology",
  "The Journal of Physical Chemistry Letters",
  "Journal of Electroanalytical Chemistry",
  "ChemistrySelect",
  "Fuel",
  "FlatChem",
  "Nanoscale",
  "Ionics",
  "Chemosphere",
  "Acta Chimica Sinica",
  "International Journal of Hydrogen Energy"
];

const candidateQueries = [
  "advanced carbon allotrope synthesis graphyne fullerene nanoporous graphene",
  "pure carbon defect topology amorphous carbon nonbenzenoid carbon allotrope",
  "carbon nanomaterial synthesis graphyne graphene nanoribbon",
  "porous carbon graphene edge sites oxygen reduction hydrogen peroxide",
  "heteroatom doped carbon two electron oxygen reduction hydrogen peroxide"
];

const curatedCandidateMaterials = [
  {
    material: {
      priority: "P0",
      rank: 0,
      name: "Cyclo[18]carbon / 原子级纯碳环",
      route: "纯碳分子拓扑",
      category: "纯碳",
      sourceWeight: "Science / 纯碳新结构文献",
      source: "https://doi.org/10.1126/science.aay1914",
      novelty: 5,
      evidence: 4,
      transfer: 4,
      access: 2,
      blank: 5,
      innovation: "sp/sp2 边界极限的纯碳环结构，提供完全不同于石墨烯平面的曲率、电荷分布和端基环境。",
      hypothesis: "若能固定在导电碳载体或通过环状片段构筑多孔网络，可能形成弱 *OOH 吸附与快速 H2O2 脱附位点。",
      experiment: "优先作为理论筛选和分子-碳复合模型；可先做 DFT 吸附能、再寻找环状前驱体固定化路径。",
      tests: "DFT *OOH/*O 吸附能、Raman/STM 或质谱确认结构；若制成电极再做 RRDE 和 H2O2 定量。",
      risk: "合成量和稳定性是主要限制，适合先作为高创新参照而非第一批放大材料。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献",
      venue: "Science",
      year: "2019",
      title: "An atomically precise carbon ring",
      link: "https://doi.org/10.1126/science.aay1914"
    }
  },
  {
    material: {
      priority: "P0",
      rank: 0,
      name: "Carbon nanobelt / 有限长度扶手椅型 CNT 片段",
      route: "纯碳曲率结构",
      category: "纯碳",
      sourceWeight: "Science / 纯碳分子纳米结构",
      source: "https://doi.org/10.1126/science.aam8158",
      novelty: 5,
      evidence: 4,
      transfer: 4,
      access: 2,
      blank: 5,
      innovation: "把 CNT 的曲率和边界以分子级精确方式固定下来，适合研究纯碳曲率对 O2 与 *OOH 的影响。",
      hypothesis: "环形曲率可能改变局域 π 电子密度，作为碳纳米管边界效应的更清晰模型。",
      experiment: "先做分子吸附计算和载体固定化探索，再与 SWCNT/CNT 网络电极对照。",
      tests: "结构谱学、负载稳定性、RRDE 电子转移数、H2O2 法拉第效率。",
      risk: "分子合成门槛高，适合做机制参照和低负载验证。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献",
      venue: "Science",
      year: "2017",
      title: "Synthesis of a carbon nanobelt",
      link: "https://doi.org/10.1126/science.aam8158"
    }
  },
  {
    material: {
      priority: "P0",
      rank: 0,
      name: "Carbon schwarzite / 负曲率 sp2 碳",
      route: "纯碳负曲率拓扑",
      category: "纯碳",
      sourceWeight: "Nature/Science 系列与碳拓扑文献线索",
      source: "检索线索：carbon schwarzite negative curvature sp2 carbon synthesis",
      novelty: 5,
      evidence: 3,
      transfer: 5,
      access: 2,
      blank: 5,
      innovation: "负曲率 sp2 碳同时引入非六元环、孔道和应变，是纯碳结构创新优先级很高的候选。",
      hypothesis: "负曲率孔壁可能兼顾 O2 富集、弱 *OOH 结合和 H2O2 传质释放。",
      experiment: "以模板碳或 COF/沸石限域碳化路线寻找近似结构，先对比普通多孔碳。",
      tests: "TEM/电子衍射、Raman 缺陷带、BET 孔径、RRDE 和 H2O2 分解测试。",
      risk: "真实 schwarzite 结构可获得性有限，需以近似负曲率碳先验证。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Nature/Science 系列与高评价碳材料期刊",
      year: "近年",
      title: "carbon schwarzite and negative-curvature sp2 carbon frameworks",
      link: "https://scholar.google.com/scholar?q=carbon+schwarzite+negative+curvature+sp2+carbon+synthesis"
    }
  },
  {
    material: {
      priority: "P0",
      rank: 0,
      name: "Graphenylene / 4-6-12 非六元环碳网络",
      route: "纯碳非苯环拓扑",
      category: "纯碳",
      sourceWeight: "高评价碳材料文献线索",
      source: "检索线索：graphenylene 4-6-12 carbon network synthesis",
      novelty: 5,
      evidence: 3,
      transfer: 4,
      access: 2,
      blank: 5,
      innovation: "4-6-12 环网络比普通石墨烯有更强拓扑扰动，可作为 biphenylene network 之外的纯碳非六元环路线。",
      hypothesis: "非六元环诱导的局域电荷和应变可能降低 4e ORR 倾向，提高 H2O2 脱附。",
      experiment: "先做模型 DFT 和可获得片段/聚合前驱体路线调研，再与 biphenylene 碳对照。",
      tests: "Raman、XPS、TEM/STM、RRDE、H2O2 分解与选择性测试。",
      risk: "实验样品可得性较弱，适合作为 P0 探索路线储备。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Carbon / Advanced Materials 系列线索",
      year: "近年",
      title: "graphenylene 4-6-12 carbon network",
      link: "https://scholar.google.com/scholar?q=graphenylene+4-6-12+carbon+network+synthesis"
    }
  },
  {
    material: {
      priority: "P1",
      rank: 0,
      name: "Graphene nanomesh / 亚纳米孔反点阵石墨烯",
      route: "纯碳孔/边缘工程",
      category: "纯碳/边缘富集",
      sourceWeight: "Nature Nanotechnology 等纳米碳文献",
      source: "检索线索：graphene nanomesh antidot lattice nanoporous graphene",
      novelty: 4,
      evidence: 4,
      transfer: 5,
      access: 3,
      blank: 4,
      innovation: "周期孔和大量边缘位点能把传质、O2 富集和 *OOH 脱附放在同一个结构变量里考察。",
      hypothesis: "孔径与边缘氧官能团协同可能提高 2e ORR 选择性，同时抑制 H2O2 深度还原。",
      experiment: "优先选用可批量制备的等离子体/模板刻蚀 graphene nanomesh，对比无孔 graphene。",
      tests: "孔径分布、边缘官能团 XPS、RRDE、H2O2 生成和稳定性测试。",
      risk: "孔边缘化学不均一，需要严格做空白 graphene 和氧化程度对照。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Nature Nanotechnology / Nano Letters 等",
      year: "近年",
      title: "graphene nanomesh and antidot-lattice nanoporous graphene",
      link: "https://scholar.google.com/scholar?q=graphene+nanomesh+antidot+lattice+nanoporous+graphene"
    }
  },
  {
    material: {
      priority: "P1",
      rank: 0,
      name: "Zigzag-edge graphene nanoflakes / 边缘态石墨烯纳米片",
      route: "纯碳边缘态工程",
      category: "纯碳/zigzag 边缘",
      sourceWeight: "Nature Chemistry / Nature Nanotechnology 级边缘石墨烯线索",
      source: "检索线索：zigzag edge graphene nanoflake synthesis open shell carbon",
      novelty: 4,
      evidence: 4,
      transfer: 5,
      access: 3,
      blank: 4,
      innovation: "zigzag 边缘态提供比普通 basal-plane graphene 更活跃但仍接近纯碳的位点。",
      hypothesis: "合适边缘态可能稳定 *OOH 而不强吸附 *O，从而偏向 H2O2。",
      experiment: "选择可获得的边缘富集纳米片或纳米带，控制氧含量后做 RRDE。",
      tests: "EPR/拉曼边缘缺陷、XPS 氧含量、RRDE 电子转移数、H2O2 法拉第效率。",
      risk: "边缘位点常伴随氧官能团，需区分纯边缘效应和含氧效应。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Nature Chemistry / Nature Nanotechnology 等",
      year: "近年",
      title: "zigzag-edge graphene nanoflakes and open-shell carbon edges",
      link: "https://scholar.google.com/scholar?q=zigzag+edge+graphene+nanoflake+synthesis+open+shell+carbon"
    }
  },
  {
    material: {
      priority: "P1",
      rank: 0,
      name: "Porous carbon nanocages / 富曲率空心碳笼",
      route: "纯碳曲率/空心结构",
      category: "纯碳/空心多孔",
      sourceWeight: "Advanced Materials / Carbon 等文献线索",
      source: "检索线索：porous carbon nanocage hollow curved carbon electrocatalysis",
      novelty: 4,
      evidence: 4,
      transfer: 5,
      access: 3,
      blank: 4,
      innovation: "空心碳笼把曲率、介孔传质和外/内表面活性位点结合，适合做纯碳工程化候选。",
      hypothesis: "曲率应变与空心结构可提升 O2 到达和 H2O2 离开，降低进一步还原风险。",
      experiment: "使用模板法空心碳笼，做不同石墨化温度和氧官能团含量系列。",
      tests: "TEM、BET、Raman、XPS、RRDE、H2O2 积累和分解测试。",
      risk: "若残留模板金属或氮源，会干扰纯碳机制判断。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Advanced Materials / Carbon 等",
      year: "近年",
      title: "porous carbon nanocages and hollow curved carbon electrocatalysts",
      link: "https://scholar.google.com/scholar?q=porous+carbon+nanocage+hollow+curved+carbon+electrocatalysis"
    }
  },
  {
    material: {
      priority: "P1",
      rank: 0,
      name: "Covalent carbon nanomesh / 共价二维碳纳米网",
      route: "纯碳孔道网络",
      category: "纯碳/纳米网",
      sourceWeight: "Nature Synthesis / JACS / Angewandte 线索",
      source: "检索线索：covalent carbon nanomesh two-dimensional porous carbon synthesis",
      novelty: 4,
      evidence: 3,
      transfer: 5,
      access: 2,
      blank: 5,
      innovation: "二维共价碳纳米网可在分子尺度同时调控孔径、边缘密度和导电骨架。",
      hypothesis: "规则孔边缘可能比无序活性炭更容易优化 2e ORR 的选择性窗口。",
      experiment: "先找可转化为导电碳纳米网的 COF/表面合成体系，再做碳化温度梯度。",
      tests: "孔径、导电率、Raman、XPS、RRDE 和 H2O2 定量。",
      risk: "导电性和样品量可能限制电化学测试。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "JACS / Angewandte / Nature Synthesis 等",
      year: "近年",
      title: "covalent two-dimensional carbon nanomesh synthesis",
      link: "https://scholar.google.com/scholar?q=covalent+carbon+nanomesh+two-dimensional+porous+carbon+synthesis"
    }
  },
  {
    material: {
      priority: "P2",
      rank: 0,
      name: "B,N co-doped holey graphene / 硼氮共掺空洞石墨烯",
      route: "非金属共掺/孔边缘耦合",
      category: "B/N 共掺杂碳",
      sourceWeight: "JCIS/JMCA/ACS Catalysis 文献线索",
      source: "检索线索：boron nitrogen co-doped holey graphene hydrogen peroxide oxygen reduction",
      novelty: 3,
      evidence: 4,
      transfer: 5,
      access: 4,
      blank: 3,
      innovation: "B/N 共掺与 holey graphene 边缘结合，兼具电荷极化和孔边缘传质优势。",
      hypothesis: "B-N 邻近位点可能调整 *OOH 结合强度，孔边缘降低 H2O2 滞留。",
      experiment: "采用 B/N 前驱体热处理 holey graphene，并做 B:N 比例和孔径系列。",
      tests: "XPS 位点比例、RRDE、H2O2 选择性、H2O2 分解测试。",
      risk: "B/N 位点分布不均，需要用对照样品拆分孔效应和掺杂效应。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Journal of Colloid and Interface Science / JMCA 等",
      year: "近年",
      title: "B,N co-doped carbon materials and holey graphene for H2O2 oxygen reduction",
      link: "https://scholar.google.com/scholar?q=boron+nitrogen+co-doped+holey+graphene+hydrogen+peroxide+oxygen+reduction"
    }
  },
  {
    material: {
      priority: "P2",
      rank: 0,
      name: "Iodine-doped carbon / 碘掺杂极化碳",
      route: "重卤素掺杂碳",
      category: "I 掺杂碳",
      sourceWeight: "Carbon / Applied Catalysis / Electrochimica Acta 线索",
      source: "检索线索：iodine doped carbon oxygen reduction hydrogen peroxide",
      novelty: 3,
      evidence: 3,
      transfer: 4,
      access: 4,
      blank: 4,
      innovation: "相比 F 掺杂，I 掺杂引入更强极化和可变表面化学，可能提供未充分探索的卤素碳变量。",
      hypothesis: "重卤素诱导的局域电荷可削弱 O-O 断裂，偏向 2e ORR。",
      experiment: "用碘蒸气/碘盐处理多孔碳，做掺杂量和稳定性系列。",
      tests: "XPS I 3d、浸出测试、RRDE、H2O2 选择性与耐久性。",
      risk: "碘物种可能浸出或参与副反应，需要做电解液离子分析。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Carbon / Electrochimica Acta 等",
      year: "近年",
      title: "iodine-doped carbon for oxygen reduction and peroxide selectivity",
      link: "https://scholar.google.com/scholar?q=iodine+doped+carbon+oxygen+reduction+hydrogen+peroxide"
    }
  },
  {
    material: {
      priority: "P2",
      rank: 0,
      name: "Se-doped porous carbon / 硒掺杂多孔碳",
      route: "硫族元素掺杂碳",
      category: "Se 掺杂碳",
      sourceWeight: "Advanced Energy Materials / ACS Catalysis 线索",
      source: "检索线索：selenium doped porous carbon oxygen reduction hydrogen peroxide",
      novelty: 3,
      evidence: 3,
      transfer: 4,
      access: 3,
      blank: 4,
      innovation: "Se 比 S 更大、更易极化，可作为 P/S/Se 掺杂序列中较少被用于 2e ORR 的变量。",
      hypothesis: "Se-C 极化位点可能适度稳定 *OOH 并降低 O-O 键断裂。",
      experiment: "用 Se 前驱体热处理多孔碳，控制 Se-C/SeOx 比例。",
      tests: "XPS/Raman/元素分析、RRDE、H2O2 生成和浸出稳定性。",
      risk: "硒物种稳定性和环境安全性需要额外评估。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Advanced Energy Materials / ACS Catalysis 等",
      year: "近年",
      title: "selenium-doped porous carbon for oxygen reduction and H2O2 electrosynthesis",
      link: "https://scholar.google.com/scholar?q=selenium+doped+porous+carbon+oxygen+reduction+hydrogen+peroxide"
    }
  },
  {
    material: {
      priority: "P3",
      rank: 0,
      name: "CNT-confined molecular catalyst / 碳纳米管限域分子位点",
      route: "碳限域异质结构",
      category: "CNT/分子催化剂",
      sourceWeight: "Nanoscale / ChemSusChem 文献线索",
      source: "检索线索：carbon nanotube confined molecular catalyst oxygen reduction hydrogen peroxide",
      novelty: 3,
      evidence: 4,
      transfer: 4,
      access: 3,
      blank: 3,
      innovation: "用 CNT 内腔或外壁限域分子位点，把碳载体的疏水传质和分子位点选择性结合。",
      hypothesis: "CNT 微环境可能提高 O2 局部浓度，并加快 H2O2 从活性位点释放。",
      experiment: "筛选 CNT 支撑金属酞菁/卟啉，与无 CNT 和炭黑载体对照。",
      tests: "UV-vis/XPS/TEM、RRDE、H2O2 FE、分子浸出和循环稳定性。",
      risk: "活性可能主要来自分子金属中心，需要明确碳载体贡献。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Nanoscale / ChemSusChem 等",
      year: "近年",
      title: "carbon nanotube supported molecular catalysts for oxygen reduction to hydrogen peroxide",
      link: "https://scholar.google.com/scholar?q=carbon+nanotube+confined+molecular+catalyst+oxygen+reduction+hydrogen+peroxide"
    }
  },
  {
    material: {
      priority: "P3",
      rank: 0,
      name: "g-C3N4 quantum dots on graphene / 碳氮化物量子点-石墨烯",
      route: "碳-碳氮化物异质结构",
      category: "C3N4/graphene",
      sourceWeight: "Chemical Engineering Journal / JMCA 线索",
      source: "检索线索：carbon nitride quantum dots graphene two electron oxygen reduction H2O2",
      novelty: 3,
      evidence: 4,
      transfer: 4,
      access: 4,
      blank: 3,
      innovation: "把 C3N4 的极性位点和 graphene 的导电骨架结合，适合做异质结构对照。",
      hypothesis: "界面电场和 P/N/O 掺杂可调节 *OOH 吸附并提升 2e ORR 选择性。",
      experiment: "制备 C3N4 QDs/graphene 系列，改变 QD 负载量和掺杂元素。",
      tests: "TEM/AFM/XPS/PL、RRDE、H2O2 FE、界面稳定性。",
      risk: "可能偏光催化或传感场景，需转化为标准电催化条件验证。",
      action: "每日候选队列新增"
    },
    source: {
      kind: "文献线索",
      venue: "Chemical Engineering Journal / JMCA 等",
      year: "近年",
      title: "carbon nitride quantum dots on graphene for two-electron oxygen reduction",
      link: "https://scholar.google.com/scholar?q=carbon+nitride+quantum+dots+graphene+two+electron+oxygen+reduction+H2O2"
    }
  }
];

const literatureQueries = [
  "two-electron oxygen reduction carbon hydrogen peroxide catalyst",
  "H2O2 electrosynthesis carbon catalyst oxygen reduction",
  "electrochemical hydrogen peroxide production carbon catalyst",
  "metal-free carbon two-electron oxygen reduction hydrogen peroxide",
  "pyrrolic nitrogen carbon two-electron oxygen reduction hydrogen peroxide",
  "graphdiyne two-electron oxygen reduction hydrogen peroxide",
  "oxygen doped carbon two-electron oxygen reduction hydrogen peroxide",
  "fluorine doped carbon oxygen reduction peroxide",
  "carbon dots electrochemical production hydrogen peroxide",
  "hollow carbon nanospheres two-electron oxygen reduction",
  "oxygen reduction to hydrogen peroxide carbon catalyst",
  "nitrogen doped carbon oxygen reduction hydrogen peroxide",
  "oxygen functionalized carbon oxygen reduction hydrogen peroxide",
  "carbon nanotubes oxygen reduction hydrogen peroxide",
  "graphene oxygen reduction hydrogen peroxide electrosynthesis",
  "porous carbon oxygen reduction hydrogen peroxide electrocatalyst",
  "carbon supported single atom oxygen reduction hydrogen peroxide",
  "metal nitrogen carbon two electron oxygen reduction hydrogen peroxide",
  "carbon cloth two electron oxygen reduction H2O2",
  "biomass derived carbon oxygen reduction hydrogen peroxide",
  "sulfur doped carbon hydrogen peroxide oxygen reduction",
  "ZIF-8 carbon oxygen reduction hydrogen peroxide",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2026",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2025",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2024",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2023",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2022",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2021",
  "carbon oxygen reduction hydrogen peroxide electrocatalyst 2020",
  "nitrogen doped carbon hydrogen peroxide electrosynthesis",
  "oxygen doped carbon hydrogen peroxide electrosynthesis",
  "porous carbon hydrogen peroxide electrosynthesis",
  "graphene hydrogen peroxide oxygen reduction electrocatalyst",
  "carbon nanotube hydrogen peroxide oxygen reduction electrocatalyst",
  "metal nitrogen carbon hydrogen peroxide oxygen reduction electrocatalyst",
  "single atom carbon hydrogen peroxide oxygen reduction",
  "carbon nitride hydrogen peroxide oxygen reduction electrocatalyst",
  "mesoporous carbon hydrogen peroxide oxygen reduction",
  "coal based carbon hydrogen peroxide oxygen reduction",
  "heteroatom doped carbon H2O2 electrosynthesis"
];

const curatedPublishedLiterature = [
  {
    status: "已发表催化剂",
    year: 2026,
    venue: "Science Bulletin",
    title: "Second-scale synthesis of oxygen-doped carbon nanotubes for oxygen reduction to hydrogen peroxide and valorization",
    material: "Oxygen-doped carbon nanotubes",
    materialType: "O 掺杂碳纳米管",
    catalystClass: "快速合成含氧缺陷 CNT",
    reaction: "ORR to H2O2",
    relevance: "近年高权重期刊中直接把氧掺杂 CNT 用于 H2O2 生成和后续利用，可作为含氧缺陷/管状碳路线的已发表边界。",
    doi: "10.1016/j.scib.2026.05.071",
    link: "https://doi.org/10.1016/j.scib.2026.05.071",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2026,
    venue: "Fuel",
    title: "Metallic bismuth-embedded mesoporous carbon hollow spheres for highly selective electrocatalytic hydrogen peroxide production via two-electron oxygen reduction",
    material: "Bi-embedded mesoporous carbon hollow spheres",
    materialType: "金属/介孔空心碳",
    catalystClass: "Bi 嵌入介孔碳空心球",
    reaction: "2e ORR to H2O2",
    relevance: "已发表金属嵌入空心介孔碳用于高选择性 H2O2 电合成，可作为金属-碳限域复合路线参照。",
    doi: "10.1016/j.fuel.2025.136799",
    link: "https://doi.org/10.1016/j.fuel.2025.136799",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2026,
    venue: "FlatChem",
    title: "Tuning electronic structure of cobalt in cobalt-nitrogen-carbon catalyst via introducing oxygen group for efficient oxygen reduction to H2O2",
    material: "Oxygen-group tuned Co-N-C",
    materialType: "金属-N-C/含氧调控",
    catalystClass: "含氧基团调控 Co-N-C",
    reaction: "ORR to H2O2",
    relevance: "已发表通过含氧基团调节 Co-N-C 电子结构来偏向 H2O2，可作为 M-N-C 与氧官能团耦合路线边界。",
    doi: "10.1016/j.flatc.2026.101055",
    link: "https://doi.org/10.1016/j.flatc.2026.101055",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2026,
    venue: "Industrial & Engineering Chemistry Research",
    title: "Nitrogen-Doped Nanosheet Carbon Pyrolyzed from ZIF-8 by Molten Salt for Electrocatalytic Oxygen Reduction to Hydrogen Peroxide",
    material: "ZIF-8-derived N-doped nanosheet carbon",
    materialType: "N 掺杂纳米片碳",
    catalystClass: "熔盐辅助 ZIF-8 衍生碳",
    reaction: "ORR to H2O2",
    relevance: "已发表 ZIF-8 衍生 N 掺杂纳米片碳用于 H2O2 电合成，可作为 MOF 衍生碳路线的直接参照。",
    doi: "10.1021/acs.iecr.6c00829",
    link: "https://doi.org/10.1021/acs.iecr.6c00829",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2026,
    venue: "Journal of Materials Chemistry A",
    title: "Silver single atom in polymeric carbon nitride as a stable and selective oxygen reduction electrocatalyst towards hydrogen peroxide synthesis",
    material: "Ag single atoms in polymeric carbon nitride",
    materialType: "单原子/聚合碳氮化物",
    catalystClass: "Ag 单原子-C3N4",
    reaction: "ORR to H2O2",
    relevance: "已发表单原子 Ag 与聚合碳氮化物结合用于选择性 H2O2 合成，可作为碳氮化物/单原子复合路线参照。",
    doi: "10.1039/d5ta05965h",
    link: "https://doi.org/10.1039/d5ta05965h",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2025,
    venue: "ChemistrySelect",
    title: "Thermally Activated Carbon Cloth Toward Efficient Two-Electron Oxygen Reduction for H2O2 Electrosynthesis",
    material: "Thermally activated carbon cloth",
    materialType: "活化碳布/纯碳电极",
    catalystClass: "热活化碳纤维布",
    reaction: "2e ORR for H2O2 electrosynthesis",
    relevance: "已发表低复杂度碳布通过热活化用于 2e ORR，可作为纯碳电极活化路线的工程化参照。",
    doi: "10.1002/slct.202502320",
    link: "https://doi.org/10.1002/slct.202502320",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2025,
    venue: "Chemical Engineering Journal",
    title: "Enabling highly selective H2O2 Electrosynthesis on graphene-based electrode by P-doped carbon nitride quantum dots for self-antibiofouling dissolved oxygen sensor via 2-electron oxygen reduction reaction",
    material: "P-doped carbon nitride quantum dots on graphene electrode",
    materialType: "P 掺杂碳氮化物量子点/石墨烯",
    catalystClass: "P-CNQDs 修饰 graphene 电极",
    reaction: "2e ORR to H2O2",
    relevance: "已发表石墨烯基电极结合 P 掺杂碳氮化物量子点实现选择性 H2O2 电生成，可作为量子点-石墨烯复合路线参照。",
    doi: "10.1016/j.cej.2025.164999",
    link: "https://doi.org/10.1016/j.cej.2025.164999",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2025,
    venue: "Chemical Engineering Journal",
    title: "Carbon nitride with strong built-in electric field as highly selective two-electron oxygen reduction photocatalyst for H2O2 production",
    material: "Built-in-field carbon nitride",
    materialType: "碳氮化物/内建电场",
    catalystClass: "内建电场调控 C3N4",
    reaction: "2e ORR to H2O2",
    relevance: "虽然偏光催化体系，但已经验证碳氮化物内建电场可调 2e ORR 选择性，可作为电子结构设计参照。",
    doi: "10.1016/j.cej.2025.169090",
    link: "https://doi.org/10.1016/j.cej.2025.169090",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2025,
    venue: "Journal of Energy Chemistry",
    title: "Efficient and economic H2O2 electrosynthesis via two-electron oxygen reduction reaction enabled by dynamically reconstructed Mn(*OH)-N3O-C motif and coupled alcohol oxidation",
    material: "Dynamically reconstructed Mn(*OH)-N3O-C motif",
    materialType: "金属-N/O-C 位点",
    catalystClass: "重构 Mn-N3O-C",
    reaction: "2e ORR to H2O2",
    relevance: "已发表动态重构 M-N/O-C 位点用于 H2O2 电合成，可作为金属中心与碳配位环境协同路线参照。",
    doi: "10.1016/j.jechem.2025.04.058",
    link: "https://doi.org/10.1016/j.jechem.2025.04.058",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2025,
    venue: "Ionics",
    title: "Sulphur-doped carbon electrodes for electrocatalytic production of hydrogen peroxide via oxygen reduction",
    material: "Sulphur-doped carbon electrodes",
    materialType: "S 掺杂碳电极",
    catalystClass: "硫掺杂碳",
    reaction: "ORR to H2O2",
    relevance: "已发表 S 掺杂碳电极用于 ORR 产 H2O2，可作为非金属硫掺杂路线的已做参照。",
    doi: "10.1007/s11581-025-06126-2",
    link: "https://doi.org/10.1007/s11581-025-06126-2",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2024,
    venue: "Journal of Electroanalytical Chemistry",
    title: "Preparation of nitrogen-doped carbon pyrolyzed from ZIF-8 and its performance in electrocatalytic oxygen reduction to hydrogen peroxide",
    material: "ZIF-8-derived nitrogen-doped carbon",
    materialType: "N 掺杂 MOF 衍生碳",
    catalystClass: "ZIF-8 热解 N-C",
    reaction: "ORR to H2O2",
    relevance: "已发表 ZIF-8 热解氮掺杂碳用于 H2O2 电生成，可作为 MOF 衍生 N-C 路线参照。",
    doi: "10.1016/j.jelechem.2024.118202",
    link: "https://doi.org/10.1016/j.jelechem.2024.118202",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2024,
    venue: "International Journal of Hydrogen Energy",
    title: "Axial halogen coordinated metal-nitrogen-carbon moiety enables efficient electrochemical oxygen reduction to hydrogen peroxide",
    material: "Axial halogen coordinated M-N-C",
    materialType: "卤素轴向配位 M-N-C",
    catalystClass: "轴向卤素调控金属-氮-碳",
    reaction: "ORR to H2O2",
    relevance: "已发表轴向卤素配位调控 M-N-C 用于 H2O2，适合作为卤素调控金属碳位点路线参照。",
    doi: "10.1016/j.ijhydene.2023.11.116",
    link: "https://doi.org/10.1016/j.ijhydene.2023.11.116",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2024,
    venue: "Nanoscale",
    title: "Electronic structure modification of metal phthalocyanines by a carbon nanotube support for efficient oxygen reduction to hydrogen peroxide",
    material: "Metal phthalocyanines on carbon nanotube support",
    materialType: "CNT 负载分子催化剂",
    catalystClass: "碳纳米管调控金属酞菁",
    reaction: "ORR to H2O2",
    relevance: "已发表 CNT 支撑体调控金属酞菁电子结构用于 H2O2，提示碳载体自身也会决定 2e ORR 选择性。",
    doi: "10.1039/d4nr00250d",
    link: "https://doi.org/10.1039/d4nr00250d",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2023,
    venue: "ACS Applied Materials & Interfaces",
    title: "Continuous On-Site H2O2 Electrosynthesis via Two-Electron Oxygen Reduction Enabled by an Oxygen-Doped Single-Cobalt Atom Catalyst with Nitrogen Coordination",
    material: "O-doped single-Co atom N-coordinated carbon",
    materialType: "单原子 Co-N/O-C",
    catalystClass: "氧掺杂单 Co 位点",
    reaction: "2e ORR to H2O2",
    relevance: "已发表 O 掺杂单 Co 原子-N 配位体系用于连续 H2O2 电合成，可作为单原子碳材料路线参照。",
    doi: "10.1021/acsami.3c09412",
    link: "https://doi.org/10.1021/acsami.3c09412",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2023,
    venue: "Journal of Materials Chemistry A",
    title: "Interface engineering of superhydrophobic octadecanethiol-functionalized hollow mesoporous carbon spheres for alkaline oxygen reduction to hydrogen peroxide",
    material: "Octadecanethiol-functionalized hollow mesoporous carbon spheres",
    materialType: "表面功能化空心介孔碳",
    catalystClass: "超疏水 ODT-HMCS",
    reaction: "ORR to H2O2",
    relevance: "已发表通过界面疏水性调控空心介孔碳用于碱性 ORR 产 H2O2，可作为微环境工程路线参照。",
    doi: "10.1039/d3ta01986a",
    link: "https://doi.org/10.1039/d3ta01986a",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2023,
    venue: "ChemSusChem",
    title: "Creating Conjugated C−C Bonds between Commercial Carbon Electrode and Molecular Catalyst for Oxygen Reduction to Hydrogen Peroxide",
    material: "Commercial carbon electrode conjugated with molecular catalyst",
    materialType: "碳电极/分子共轭界面",
    catalystClass: "C-C 键连接碳电极",
    reaction: "ORR to H2O2",
    relevance: "已发表通过 C-C 共轭键连接碳电极和分子催化剂来产 H2O2，可作为碳界面连接方式参照。",
    doi: "10.1002/cssc.202300841",
    link: "https://doi.org/10.1002/cssc.202300841",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2022,
    venue: "ACS Catalysis",
    title: "Highly Selective Oxygen Reduction to Hydrogen Peroxide on a Carbon-Supported Single-Atom Pd Electrocatalyst",
    material: "Carbon-supported single-atom Pd",
    materialType: "单原子 Pd/碳载体",
    catalystClass: "Pd1-C",
    reaction: "ORR to H2O2",
    relevance: "已发表碳负载 Pd 单原子实现高选择性 H2O2，可作为金属单原子-碳载体路线的已做参照。",
    doi: "10.1021/acscatal.1c05633",
    link: "https://doi.org/10.1021/acscatal.1c05633",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2022,
    venue: "ChemElectroChem",
    title: "Selective Electrochemical Production of Hydrogen Peroxide from Reduction of Oxygen on Mesoporous Nitrogen Containing Carbon",
    material: "Mesoporous nitrogen-containing carbon",
    materialType: "介孔 N 含量碳",
    catalystClass: "N-介孔碳",
    reaction: "ORR to H2O2",
    relevance: "已发表 N 含量介孔碳用于选择性电化学产 H2O2，可作为孔结构与氮位点耦合路线参照。",
    doi: "10.1002/celc.202101336",
    link: "https://doi.org/10.1002/celc.202101336",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2022,
    venue: "Acta Chimica Sinica",
    title: "Nitrogen-doped Carbon Pyrolyzed from ZIF-8 for Electrocatalytic Oxygen Reduction to Hydrogen Peroxide",
    material: "Nitrogen-doped carbon pyrolyzed from ZIF-8",
    materialType: "N 掺杂 MOF 衍生碳",
    catalystClass: "ZIF-8 热解 N-C",
    reaction: "ORR to H2O2",
    relevance: "已发表 ZIF-8 衍生 N 掺杂碳用于电催化 ORR 产 H2O2，可作为 MOF 碳化路线的已做参照。",
    doi: "10.6023/a22010030",
    link: "https://doi.org/10.6023/a22010030",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2021,
    venue: "Journal of Materials Chemistry A",
    title: "Electrocatalytic oxygen reduction to hydrogen peroxide through a biomass-derived nitrogen and oxygen self-doped porous carbon metal-free catalyst",
    material: "Biomass-derived N/O self-doped porous carbon",
    materialType: "生物质 N/O 自掺杂多孔碳",
    catalystClass: "金属-free 自掺杂多孔碳",
    reaction: "ORR to H2O2",
    relevance: "已发表生物质衍生 N/O 自掺杂多孔碳用于 H2O2，适合作为低成本多孔碳路线参照。",
    doi: "10.1039/d1ta06955a",
    link: "https://doi.org/10.1039/d1ta06955a",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2021,
    venue: "Energy & Fuels",
    title: "Oxygen-Doped Hierarchical Porous Carbon with Improved Selectivity of Hydrogen Peroxide in an Oxygen Reduction Reaction",
    material: "Oxygen-doped hierarchical porous carbon",
    materialType: "O 掺杂分级多孔碳",
    catalystClass: "含氧缺陷多孔碳",
    reaction: "ORR to H2O2",
    relevance: "已发表氧掺杂分级多孔碳提高 H2O2 选择性，可作为含氧缺陷与孔结构协同路线参照。",
    doi: "10.1021/acs.energyfuels.0c04160",
    link: "https://doi.org/10.1021/acs.energyfuels.0c04160",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2021,
    venue: "Journal of Colloid and Interface Science",
    title: "Identifying active sites of boron, nitrogen co-doped carbon materials for the oxygen reduction reaction to hydrogen peroxide",
    material: "B,N co-doped carbon materials",
    materialType: "B/N 共掺杂碳",
    catalystClass: "硼氮共掺杂活性位点",
    reaction: "ORR to H2O2",
    relevance: "已发表 B/N 共掺杂碳并识别活性位点用于 H2O2，可作为双非金属掺杂路线参照。",
    doi: "10.1016/j.jcis.2021.06.068",
    link: "https://doi.org/10.1016/j.jcis.2021.06.068",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2021,
    venue: "The Journal of Physical Chemistry Letters",
    title: "Regiochemically Oxo-functionalized Graphene, Guided by Defect Sites, as Catalyst for Oxygen Reduction to Hydrogen Peroxide",
    material: "Regiochemically oxo-functionalized graphene",
    materialType: "缺陷引导含氧官能化石墨烯",
    catalystClass: "Oxo-graphene 缺陷位点",
    reaction: "ORR to H2O2",
    relevance: "已发表缺陷位点引导的含氧官能化石墨烯用于 H2O2，适合作为纯碳缺陷/含氧官能团路线参照。",
    doi: "10.1021/acs.jpclett.1c02957",
    link: "https://doi.org/10.1021/acs.jpclett.1c02957",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2021,
    venue: "Catalysis Science & Technology",
    title: "Mesoporous carbon nitride supported 5,10,15,20-tetrakis(4-methoxyphenyl)-21H,23H-porphine cobalt(ii) as a selective and durable electrocatalyst for the production of hydrogen peroxide via two-electron oxygen reduction",
    material: "Mesoporous carbon nitride supported Co porphyrin",
    materialType: "介孔碳氮化物/分子钴",
    catalystClass: "C3N4 支撑 Co 卟啉",
    reaction: "2e ORR to H2O2",
    relevance: "已发表介孔碳氮化物支撑分子钴用于 2e ORR 产 H2O2，可作为碳氮化物载体路线参照。",
    doi: "10.1039/d0cy01801e",
    link: "https://doi.org/10.1039/d0cy01801e",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2020,
    venue: "Carbon",
    title: "Graphitic N in nitrogen-Doped carbon promotes hydrogen peroxide synthesis from electrocatalytic oxygen reduction",
    material: "Graphitic-N nitrogen-doped carbon",
    materialType: "石墨 N 掺杂碳",
    catalystClass: "graphitic-N 位点碳",
    reaction: "ORR to H2O2",
    relevance: "已发表石墨 N 位点促进 ORR 产 H2O2，是 N 掺杂碳位点类型判断的重要参照。",
    doi: "10.1016/j.carbon.2020.02.084",
    link: "https://doi.org/10.1016/j.carbon.2020.02.084",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2020,
    venue: "Chemosphere",
    title: "Enhancement of hydrogen peroxide production by electrochemical reduction of oxygen on carbon nanotubes modified with fluorine",
    material: "Fluorine-modified carbon nanotubes",
    materialType: "F 修饰碳纳米管",
    catalystClass: "氟化 CNT",
    reaction: "ORR to H2O2",
    relevance: "已发表 F 修饰 CNT 增强 H2O2 生成，可作为氟掺杂/表面极化管状碳路线参照。",
    doi: "10.1016/j.chemosphere.2020.127423",
    link: "https://doi.org/10.1016/j.chemosphere.2020.127423",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2020,
    venue: "Advanced Materials Interfaces",
    title: "Electrochemical Oxygen Reduction to Hydrogen Peroxide via a Two-Electron Transfer Pathway on Carbon-Based Single-Atom Catalysts",
    material: "Carbon-based single-atom catalysts",
    materialType: "碳基单原子催化剂",
    catalystClass: "SACs on carbon",
    reaction: "2e ORR to H2O2",
    relevance: "已发表碳基单原子催化剂用于二电子路径产 H2O2，可作为金属单原子-碳载体路线的早期参照。",
    doi: "10.1002/admi.202001360",
    link: "https://doi.org/10.1002/admi.202001360",
    sourceKind: "文献"
  },
  {
    status: "已发表催化剂",
    year: 2020,
    venue: "International Journal of Electrochemical Science",
    title: "Promotion of Oxygen Reduction to Hydrogen Peroxide by Ammonium Ions on N-doped Carbon Catalyst",
    material: "N-doped carbon with ammonium-ion promotion",
    materialType: "N 掺杂碳/电解质调控",
    catalystClass: "铵离子调控 N-C",
    reaction: "ORR to H2O2",
    relevance: "已发表铵离子促进 N 掺杂碳 ORR 产 H2O2，可作为碳催化剂与电解质耦合效应参照。",
    doi: "10.20964/2020.12.46",
    link: "https://doi.org/10.20964/2020.12.46",
    sourceKind: "文献"
  }
];

const currentYear = new Date().getFullYear();
const todayISO = new Date().toISOString().slice(0, 10);
const blockedTitleWords = /\b(review|reviews|progress|perspective|minireview|editorial|correction|corrigendum|retraction|erratum|comment|recent advances|advances and challenges|design strategies|guidelines|xgboost|machine learning|data-driven|database|first-principles|dft|theoretical|ssrn|meeting abstract|from mechanism|from microenvironment|from active site|device design|understandings of active sites|surface\/interface engineering|catalysts for electrosynthesis|role of lightweight doping|utilizing carbonaceous catalysts)\b/i;
const carbonWords = /\b(carbon|graphene|graphyne|graphdiyne|fullerene|nanoribbon|nanothread|nanoporous|diamond|diamane|nanotube|c2n|carbonaceous|carbon dot|coal)\b/i;
const candidateIntentWords = /\b(allotrope|graphyne|graphdiyne|fullerene|nonbenzenoid|nanoporous|porous carbon|carbon dot|graphene|nanoribbon|nanothread|defect|edge|doped carbon|carbon aerogel|electrocatalyst|oxygen reduction|peroxide|h2o2)\b/i;
const candidateNoiseWords = /\b(biofilm|bacterial|inflammation|thermal insulation|dimensional stability|dislocation|embrittlement|superalloy|corrosion|ceramic|ceramics|lithium storage|lithium-ion|battery anode|withdrawn|meeting abstract|electric permittivity|mechanical properties|fracture patterns|thermal transport|hydrogen and nitrogen selectivity)\b/i;
const peroxideWords = /\b(hydrogen peroxide|h2o2|peroxide)\b/i;
const orrWords = /\b(two-electron|2e|oxygen reduction|orr|electrosynthesis)\b/i;

const existingNames = new Set(materials.map((item) => normalize(item.name)));
const existingSourceTitles = new Set(Object.values(sourceDetails).map((item) => normalize(item.title || "")).filter(Boolean));
const existingLiteratureKeys = new Set(
  literature.flatMap((item) => [normalize(item.doi || ""), normalize(item.title || "")]).filter(Boolean)
);

const literatureAdds = await collectPublishedLiterature(PUBLISHED_LITERATURE_BATCH_SIZE);
const candidateAdds = process.env.CARBON_LITERATURE_ONLY === "1"
  ? []
  : await collectCandidateMaterials(CANDIDATE_MATERIAL_BATCH_SIZE);

const maxRank = materials.reduce((max, item) => Math.max(max, Number(item.rank) || 0), 0);
candidateAdds.forEach((candidate, index) => {
  candidate.material.rank = maxRank + index + 1;
  materials.push(candidate.material);
  sourceDetails[candidate.material.name] = candidate.source;
});
literature.push(...literatureAdds);

const updatedAt = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).format(new Date()).replaceAll("/", "-");

const nextFeedMeta = {
  cadence: "每天一次",
  updatedAt: `${updatedAt} Asia/Shanghai`,
  sourcePolicy: feedMeta.sourcePolicy || "三大顶刊、三大顶刊子刊、Nature Index 来源、高评价材料/催化期刊、先进实验室新闻、科学报道和前沿碳材料公司产品",
  lastRunSummary: [
    candidateAdds.length ? `候选材料新增 ${candidateAdds.length} 条，目标大于 10 条/日` : "候选材料本轮无新增",
    literatureAdds.length ? `已发表 2e ORR 碳文献新增 ${literatureAdds.length} 条，目标大于 30 条/日` : "已发表文献本轮无新增"
  ].join("；")
};

const output = [
  `window.CARBON_MATERIALS = ${JSON.stringify(materials, null, 2)};`,
  "",
  `window.CARBON_FEED_META = ${JSON.stringify(nextFeedMeta, null, 2)};`,
  "",
  `window.CARBON_SOURCE_DETAILS = ${JSON.stringify(sourceDetails, null, 2)};`,
  "",
  `window.CARBON_2E_ORR_LITERATURE = ${JSON.stringify(literature, null, 2)};`,
  ""
].join("\n");

await fs.writeFile(dataPath, output, "utf8");
console.log(nextFeedMeta.lastRunSummary);

async function collectCandidateMaterials(limit) {
  const additions = [];
  for (const candidate of curatedCandidateMaterials) {
    if (!isFreshCandidate(candidate, additions)) continue;
    additions.push(candidate);
    if (additions.length >= limit) return additions;
  }

  for (const query of candidateQueries) {
    const works = await queryCrossref(query, { rows: 30, yearsBack: 6, sort: "relevance", queryField: "query.bibliographic" });
    for (const work of works) {
      const candidate = workToCandidate(work);
      if (!candidate) continue;
      if (!isFreshCandidate(candidate, additions)) continue;
      additions.push(candidate);
      if (additions.length >= limit) return additions;
    }
  }
  return additions;
}

function isFreshCandidate(candidate, additions) {
  const nameKey = normalize(candidate.material?.name || "");
  const titleKey = normalize(candidate.source?.title || "");
  if (existingNames.has(nameKey) || existingSourceTitles.has(titleKey)) return false;
  return !additions.some((item) => {
    return normalize(item.material?.name || "") === nameKey || normalize(item.source?.title || "") === titleKey;
  });
}

async function collectPublishedLiterature(limit) {
  const additions = [];
  for (const item of curatedPublishedLiterature) {
    if (!isFreshPublished(item, additions)) continue;
    additions.push(item);
    if (additions.length >= limit) return additions;
  }

  const queryResults = await Promise.all(literatureQueries.map((query) => queryCrossref(query, {
      rows: 35,
      yearsBack: 10,
      sort: "relevance",
      queryField: "query.bibliographic"
    })));

  for (const works of queryResults) {
    for (const work of works) {
      const item = workToPublishedLiterature(work);
      if (!item) continue;
      if (!isFreshPublished(item, additions)) continue;
      additions.push(item);
    }
  }
  return additions
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || venuePriority(b.venue) - venuePriority(a.venue))
    .slice(0, limit);
}

function isFreshPublished(item, additions) {
  const doiKey = normalize(item.doi || "");
  const titleKey = normalize(item.title || "");
  if (existingLiteratureKeys.has(doiKey) || existingLiteratureKeys.has(titleKey)) return false;
  return !additions.some((entry) => normalize(entry.doi || "") === doiKey || normalize(entry.title || "") === titleKey);
}

async function queryCrossref(query, { rows, yearsBack, sort, queryField = "query.title" }) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set(queryField, query);
  url.searchParams.set("filter", `from-pub-date:${currentYear - yearsBack}-01-01,until-pub-date:${todayISO},type:journal-article`);
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", "desc");
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("mailto", "carbon-finder@example.com");

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "CarbonFinderPro/1.0 (scheduled literature scan)" },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return [];
    const json = await response.json();
    return json?.message?.items || [];
  } catch {
    console.log(`Crossref query failed: ${query}`);
    return [];
  }
}

function workToCandidate(work) {
  const meta = workMeta(work);
  const text = `${meta.title} ${meta.venue}`;
  if (!meta.title || !meta.venue || blockedTitleWords.test(text)) return null;
  if (Number(meta.year) > currentYear) return null;
  if (!carbonWords.test(text)) return null;
  if (!candidateIntentWords.test(meta.title) || candidateNoiseWords.test(meta.title)) return null;
  if (!isHighValueVenue(meta.venue)) return null;

  const classification = classifyCandidate(meta.title);
  const materialName = shorten(meta.title, 96);

  return {
    material: {
      priority: classification.priority,
      rank: 0,
      name: materialName,
      route: classification.route,
      category: classification.category,
      sourceWeight: venueWeight(meta.venue),
      source: meta.link || `检索线索：${meta.title}`,
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
      venue: meta.venue,
      year: meta.year,
      title: meta.title,
      link: meta.link
    }
  };
}

function workToPublishedLiterature(work) {
  const meta = workMeta(work);
  const text = `${meta.title} ${meta.venue}`;
  if (!meta.title || !meta.venue || blockedTitleWords.test(text)) return null;
  if (Number(meta.year) > currentYear) return null;
  if (!peroxideWords.test(text) || !orrWords.test(text)) return null;
  if (!carbonWords.test(text)) return null;

  const classification = classifyPublishedCatalyst(meta.title);
  return {
    status: "已发表催化剂",
    year: Number(meta.year),
    venue: meta.venue,
    title: meta.title,
    material: classification.material,
    materialType: classification.materialType,
    catalystClass: classification.catalystClass,
    reaction: classification.reaction,
    relevance: classification.relevance,
    doi: meta.doi,
    link: meta.link,
    sourceKind: "文献"
  };
}

function workMeta(work) {
  const title = cleanText(work.title?.[0] || "");
  const venue = cleanText(work["container-title"]?.[0] || "");
  const year = String(
    work.published?.["date-parts"]?.[0]?.[0]
      || work.created?.["date-parts"]?.[0]?.[0]
      || currentYear
  );
  const doi = work.DOI || "";
  const link = doi ? `https://doi.org/${doi}` : (work.URL || "");
  return { title, venue, year, doi, link };
}

function classifyCandidate(title) {
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

function classifyPublishedCatalyst(title) {
  const lower = title.toLowerCase();
  if (/graphdiyne|graphyne/.test(lower)) {
    return {
      material: extractMaterial(title, "Graphdiyne / graphyne carbon"),
      materialType: "纯碳/炔键碳",
      catalystClass: "sp/sp2 炔键碳",
      reaction: "2e ORR to H2O2",
      relevance: "已发表炔键碳材料用于二电子 ORR/H2O2，可作为 graphyne/graphdiyne 候选路线的已做参照。"
    };
  }
  if (/pyrrolic|nitrogen|n-doped|nitrogen-doped/.test(lower)) {
    return {
      material: extractMaterial(title, "Nitrogen-doped carbon"),
      materialType: "N 掺杂碳",
      catalystClass: "氮位点调控碳",
      reaction: "2e ORR to H2O2",
      relevance: "已发表 N 掺杂碳用于二电子 ORR/H2O2，可作为氮位点和碳缺陷耦合路线的已做参照。"
    };
  }
  if (/fluor|f-doped/.test(lower)) {
    return {
      material: extractMaterial(title, "Fluorine-doped carbon"),
      materialType: "F 掺杂碳",
      catalystClass: "氟掺杂/表面极化碳",
      reaction: "ORR to peroxide/H2O2",
      relevance: "已发表 F 掺杂碳用于过氧化物生成，可作为氟化碳候选路线的已做参照。"
    };
  }
  if (/oxygen|o-doped|functional/.test(lower)) {
    return {
      material: extractMaterial(title, "Oxygen-functionalized carbon"),
      materialType: "O 掺杂/含氧官能团碳",
      catalystClass: "含氧官能团碳",
      reaction: "2e ORR to H2O2",
      relevance: "已发表含氧碳材料用于二电子 ORR/H2O2，可作为氧官能团路线的机制参照。"
    };
  }
  if (/dot/.test(lower)) {
    return {
      material: extractMaterial(title, "Carbon dots"),
      materialType: "碳点",
      catalystClass: "碳点/量子点",
      reaction: "Electrochemical H2O2 production",
      relevance: "已发表碳点类材料用于 H2O2 电合成，可与碳点候选材料直接区分。"
    };
  }
  if (/aerogel|coal|porous|hollow|sphere|nanosphere/.test(lower)) {
    return {
      material: extractMaterial(title, "Porous carbon catalyst"),
      materialType: "多孔碳/空心碳",
      catalystClass: "多孔或空心碳结构",
      reaction: "2e ORR / ORR to H2O2",
      relevance: "已发表多孔/空心碳结构用于二电子 ORR/H2O2，可作为孔结构碳路线的已做参照。"
    };
  }
  return {
    material: extractMaterial(title, "Carbon-based catalyst"),
    materialType: "碳基催化剂",
    catalystClass: "碳基 2e ORR 催化剂",
    reaction: "2e ORR / H2O2 electrosynthesis",
    relevance: "已发表碳基催化剂用于二电子 ORR 或 H2O2 电合成，可作为候选材料路线的文献边界。"
  };
}

function extractMaterial(title, fallback) {
  const beforeFor = title.split(/\bfor\b|\btoward\b|\bvia\b|\bin\b/i)[0].trim();
  return shorten(beforeFor || fallback, 90);
}

function isHighValueVenue(venue) {
  return highValueVenues.some((name) => venue.toLowerCase().includes(name.toLowerCase()));
}

function venueWeight(venue) {
  if (/^(Nature|Science|Cell)$/i.test(venue)) return `${venue} 主刊`;
  if (/Nature|Science|Cell/i.test(venue)) return `${venue} / 顶刊子刊`;
  if (/Journal of the American Chemical Society|JACS|Advanced Materials|Energy & Environmental Science|ACS Nano|Nano Letters|ACS Catalysis|Angewandte/i.test(venue)) {
    return `${venue} / 高评价期刊`;
  }
  return `${venue} / 文献来源`;
}

function venuePriority(venue) {
  const text = String(venue || "");
  if (/^(Nature|Science|Cell)$/i.test(text)) return 5;
  if (/Nature|Science|Cell|Journal of the American Chemical Society|JACS|Advanced Materials|Energy & Environmental Science|Angewandte/i.test(text)) return 4;
  if (/ACS Catalysis|ACS Nano|Nano Letters|Journal of Materials Chemistry A|Applied Catalysis B|Chemical Engineering Journal|Science Bulletin/i.test(text)) return 3;
  if (isHighValueVenue(text)) return 2;
  return 1;
}

function shorten(value, length) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

function cleanText(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "");
}
