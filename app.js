(function () {
  const materials = window.CARBON_MATERIALS || [];
  const literature = window.CARBON_2E_ORR_LITERATURE || [];
  const feedMeta = window.CARBON_FEED_META || {
    cadence: "每天一次",
    updatedAt: "待自动任务更新",
    sourcePolicy: "顶刊、子刊、Nature Index、高评价期刊、实验室新闻和前沿公司产品"
  };
  const sourceDetails = window.CARBON_SOURCE_DETAILS || {};

  const metricLabels = {
    novelty: "前沿性",
    evidence: "来源权重",
    transfer: "2e ORR",
    access: "可获得",
    blank: "空白度"
  };

  const metricFullLabels = {
    novelty: "前沿性",
    evidence: "来源权重",
    transfer: "2e ORR 迁移潜力",
    access: "可获得性",
    blank: "方向空白度"
  };

  const presets = {
    "创新优先": { novelty: 32, evidence: 24, transfer: 24, access: 6, blank: 14 },
    "直接开做": { novelty: 14, evidence: 12, transfer: 28, access: 36, blank: 10 },
    "2e ORR": { novelty: 18, evidence: 16, transfer: 44, access: 12, blank: 10 },
    "空白探索": { novelty: 30, evidence: 12, transfer: 20, access: 6, blank: 32 }
  };

  const state = {
    weights: { ...presets["创新优先"] },
    activePreset: "创新优先",
    priorities: new Set(["P0", "P1", "P2", "P3"]),
    category: "all",
    route: "all",
    query: "",
    searchScope: "all",
    sort: "score",
    selectedName: ""
  };

  const els = {
    search: document.getElementById("searchInput"),
    reset: document.getElementById("resetButton"),
    priorityFilters: document.getElementById("priorityFilters"),
    presetButtons: document.getElementById("presetButtons"),
    category: document.getElementById("categoryFilter"),
    route: document.getElementById("routeFilter"),
    sort: document.getElementById("sortSelect"),
    weights: document.getElementById("weightControls"),
    topPicks: document.getElementById("topPicks"),
    detail: document.getElementById("detailPanel"),
    table: document.getElementById("materialTable"),
    tableSummary: document.getElementById("tableSummary"),
    statCount: document.getElementById("statCount"),
    statTopScore: document.getElementById("statTopScore"),
    statPure: document.getElementById("statPure"),
    statAccessible: document.getElementById("statAccessible"),
    statCadence: document.getElementById("statCadence"),
    statLiterature: document.getElementById("statLiterature"),
    updateCadence: document.getElementById("updateCadence"),
    updateMeta: document.getElementById("updateMeta"),
    heroName: document.getElementById("heroName"),
    heroScore: document.getElementById("heroScore"),
    mapCanvas: document.getElementById("mapCanvas"),
    globalSearchPanel: document.getElementById("globalSearchPanel"),
    globalSearchScope: document.getElementById("globalSearchScope"),
    globalSearchSummary: document.getElementById("globalSearchSummary"),
    globalResults: document.getElementById("globalResults"),
    literatureTable: document.getElementById("literatureTable"),
    literatureSummary: document.getElementById("literatureSummary")
  };

  const unique = (items) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const searchTokens = () => state.query.split(/[\s,，;；、/]+/).map((item) => item.trim()).filter(Boolean);
  const normalizeSearch = (value) => String(value || "").toLowerCase();
  const matchesQuery = (value) => {
    const tokens = searchTokens();
    if (!tokens.length) return true;
    const haystack = normalizeSearch(value);
    return tokens.every((token) => haystack.includes(token));
  };

  function scoreMaterial(material) {
    const totalWeight = Object.values(state.weights).reduce((sum, value) => sum + value, 0) || 1;
    const weighted = Object.entries(state.weights).reduce((sum, [key, weight]) => {
      return sum + (material[key] || 0) * weight;
    }, 0);
    return Math.round((weighted / (5 * totalWeight)) * 100);
  }

  function withScores(list) {
    return list.map((item) => ({ ...item, score: scoreMaterial(item) }));
  }

  function filteredMaterials() {
    const query = state.query;
    const results = materials
      .filter((item) => state.priorities.has(item.priority))
      .filter((item) => state.category === "all" || item.category === state.category)
      .filter((item) => state.route === "all" || item.route === state.route)
      .filter((item) => {
        if (!query) return true;
        const source = getSourceInfo(item);
        const haystack = [
          item.name,
          item.route,
          item.category,
          item.innovation,
          item.hypothesis,
          item.experiment,
          item.tests,
          item.risk,
          item.action,
          item.sourceWeight,
          source.kind,
          source.venue,
          source.year,
          source.title
        ].join(" ");
        return matchesQuery(haystack);
      });

    return withScores(results).sort(sorter);
  }

  function sorter(a, b) {
    if (state.sort === "rank") return a.rank - b.rank;
    if (state.sort === "access") return b.access - a.access || b.score - a.score;
    if (state.sort === "blank") return b.blank - a.blank || b.score - a.score;
    if (state.sort === "transfer") return b.transfer - a.transfer || b.score - a.score;
    return b.score - a.score || a.rank - b.rank;
  }

  function init() {
    initControls();
    els.statCadence.textContent = formatCadence(feedMeta.cadence);
    els.updateCadence.textContent = feedMeta.cadence;
    els.updateMeta.textContent = `${feedMeta.sourcePolicy}；最近更新：${feedMeta.updatedAt}`;
    els.statLiterature.textContent = literature.length;
    render();
  }

  function formatCadence(cadence) {
    if (/每天|每日/.test(cadence)) return "1d";
    if (/30 分钟/.test(cadence)) return "30m";
    return cadence.replace("每 ", "").replace(" 小时", "h");
  }

  function initControls() {
    ["P0", "P1", "P2", "P3"].forEach((priority) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = priority;
      button.dataset.priority = priority;
      button.className = "is-active";
      button.addEventListener("click", () => {
        state.priorities.has(priority) ? state.priorities.delete(priority) : state.priorities.add(priority);
        syncPriorityButtons();
        render();
      });
      els.priorityFilters.appendChild(button);
    });

    Object.keys(presets).forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = preset;
      button.className = preset === state.activePreset ? "is-active" : "";
      button.addEventListener("click", () => applyPreset(preset));
      els.presetButtons.appendChild(button);
    });

    unique(materials.map((item) => item.category)).forEach((category) => {
      els.category.appendChild(new Option(category, category));
    });

    unique(materials.map((item) => item.route)).forEach((route) => {
      els.route.appendChild(new Option(route, route));
    });

    Object.entries(metricFullLabels).forEach(([key, label]) => {
      const row = document.createElement("label");
      row.className = "weight-row";
      row.innerHTML = `
        <header><span>${label}</span><span data-weight-value="${key}">${state.weights[key]}</span></header>
        <input type="range" min="0" max="45" step="1" value="${state.weights[key]}" data-weight="${key}" />
      `;
      row.querySelector("input").addEventListener("input", (event) => {
        state.weights[key] = Number(event.target.value);
        state.activePreset = "";
        syncPresetButtons();
        render();
      });
      els.weights.appendChild(row);
    });

    els.search.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      render();
    });

    els.globalSearchScope.addEventListener("change", (event) => {
      state.searchScope = event.target.value;
      renderUnifiedSearch();
    });

    els.category.addEventListener("change", (event) => {
      state.category = event.target.value;
      render();
    });

    els.route.addEventListener("change", (event) => {
      state.route = event.target.value;
      render();
    });

    els.sort.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });

    els.reset.addEventListener("click", () => {
      state.priorities = new Set(["P0", "P1", "P2", "P3"]);
      state.category = "all";
      state.route = "all";
      state.query = "";
      state.searchScope = "all";
      state.sort = "score";
      els.search.value = "";
      els.globalSearchScope.value = "all";
      els.category.value = "all";
      els.route.value = "all";
      els.sort.value = "score";
      syncPriorityButtons();
      applyPreset("创新优先", false);
      render();
    });
  }

  function syncPriorityButtons() {
    els.priorityFilters.querySelectorAll("[data-priority]").forEach((button) => {
      button.classList.toggle("is-active", state.priorities.has(button.dataset.priority));
    });
  }

  function applyPreset(name, shouldRender = true) {
    state.activePreset = name;
    state.weights = { ...presets[name] };
    Object.entries(state.weights).forEach(([key, value]) => {
      const input = els.weights.querySelector(`[data-weight="${key}"]`);
      const label = els.weights.querySelector(`[data-weight-value="${key}"]`);
      if (input) input.value = value;
      if (label) label.textContent = value;
    });
    syncPresetButtons();
    if (shouldRender) render();
  }

  function syncPresetButtons() {
    Array.from(els.presetButtons.children).forEach((button) => {
      button.classList.toggle("is-active", button.textContent === state.activePreset);
    });
  }

  function render() {
    Object.entries(state.weights).forEach(([key, value]) => {
      const label = els.weights.querySelector(`[data-weight-value="${key}"]`);
      if (label) label.textContent = value;
    });

    const results = filteredMaterials();
    const selected = selectMaterial(results);
    renderStats(results);
    renderTopPicks(results, selected);
    renderDetail(selected);
    renderTable(results, selected);
    renderUnifiedSearch();
    renderLiterature(filteredLiterature());
    drawMap(results, selected);
    if (selected) {
      els.heroName.textContent = selected.name;
      els.heroScore.textContent = selected.score;
    }
  }

  function selectMaterial(results) {
    if (!results.length) {
      state.selectedName = "";
      return null;
    }
    const existing = results.find((item) => item.name === state.selectedName);
    const selected = existing || results[0];
    state.selectedName = selected.name;
    return selected;
  }

  function renderStats(results) {
    els.statCount.textContent = results.length;
    els.statTopScore.textContent = results.length ? Math.max(...results.map((item) => item.score)) : 0;
    els.statPure.textContent = results.filter((item) => item.category.includes("纯碳") || item.category.includes("表面终止")).length;
    els.statAccessible.textContent = results.filter((item) => item.access >= 4).length;
  }

  function renderTopPicks(results, selected) {
    const picks = results.slice(0, 4);
    els.topPicks.innerHTML = picks.map((item) => `
      <button class="pick-card ${selected && selected.name === item.name ? "is-selected" : ""}" type="button" data-name="${escapeAttr(item.name)}">
        <header>
          <span class="pill ${item.priority.toLowerCase()}">${item.priority}</span>
          <span class="score-badge">${item.score}</span>
        </header>
        <strong>${item.name}</strong>
        <p>${item.route} · ${item.action}</p>
      </button>
    `).join("");

    els.topPicks.querySelectorAll("[data-name]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedName = button.dataset.name;
        render();
      });
    });
  }

  function renderDetail(item) {
    if (!item) {
      els.detail.innerHTML = `<div class="empty-state">当前筛选条件下没有材料，放宽条件后继续分析。</div>`;
      return;
    }

    const sourceInfo = getSourceInfo(item);
    const source = sourceInfo.link
      ? `<a class="source-link" href="${sourceInfo.link}" target="_blank" rel="noreferrer">打开出处</a>`
      : `<span class="source-link" title="${escapeAttr(item.source || sourceInfo.title || "")}">检索线索</span>`;

    const average = Math.round(((item.novelty + item.evidence + item.transfer + item.access + item.blank) / 25) * 100);
    els.detail.innerHTML = `
      <div>
        <div class="detail-kicker">
          <span class="pill ${item.priority.toLowerCase()}">${item.priority}</span>
          <span class="pill">${item.category}</span>
          <span class="pill">${item.route}</span>
          <span class="pill">${item.sourceWeight}</span>
        </div>
        <div class="detail-title">
          <h2>${item.name}</h2>
        </div>
        <p class="detail-text">${item.innovation}</p>
        <div class="source-card">
          <span>${sourceInfo.kind}</span>
          <strong>${sourceInfo.venue}${sourceInfo.year ? ` · ${sourceInfo.year}` : ""}</strong>
          <p>${sourceInfo.title}</p>
          ${sourceInfo.link ? `<a href="${sourceInfo.link}" target="_blank" rel="noreferrer">查看原始出处</a>` : `<em>${item.source || "请按题名检索"}</em>`}
        </div>
        <div class="detail-grid">
          ${detailBlock("为什么值得做 2e ORR", item.hypothesis)}
          ${detailBlock("首轮实验入口", item.experiment)}
          ${detailBlock("关键表征/判据", item.tests)}
          ${detailBlock("主要风险", item.risk)}
        </div>
      </div>
      <aside class="radar-card">
        <div class="radar-score"><strong>${item.score}</strong><span>/100 推荐分</span></div>
        <div class="radar" style="--radar-fill:${average}%"><span>${average}%</span></div>
        <div class="bar-list">
          ${barRow("前沿性", item.novelty)}
          ${barRow("来源权重", item.evidence)}
          ${barRow("2e ORR 迁移", item.transfer)}
          ${barRow("可获得性", item.access)}
          ${barRow("空白度", item.blank)}
        </div>
        ${source}
      </aside>
    `;
  }

  function getSourceInfo(item) {
    const found = sourceDetails[item.name] || {};
    const source = item.source || "";
    const hasUrl = source.startsWith("http");
    return {
      kind: found.kind || (hasUrl ? "文献/网页" : "检索线索"),
      venue: found.venue || item.sourceWeight || "来源待补充",
      year: found.year || "",
      title: found.title || (hasUrl ? item.name : source.replace(/^检索线索：/, "")),
      link: found.link || (hasUrl ? source.split(";")[0].trim() : "")
    };
  }

  function detailBlock(title, text) {
    return `
      <div class="detail-block">
        <strong>${title}</strong>
        <p>${text}</p>
      </div>
    `;
  }

  function barRow(label, value) {
    return `
      <div class="bar-row">
        <header><span>${label}</span><span>${value}/5</span></header>
        <div class="bar-track"><div class="bar-fill" style="width:${value * 20}%"></div></div>
      </div>
    `;
  }

  function renderTable(results, selected) {
    els.tableSummary.textContent = `显示 ${results.length} 个候选，${sortLabel()} 排序`;
    if (!results.length) {
      els.table.innerHTML = `<div class="empty-state">没有匹配材料。请减少筛选条件。</div>`;
      return;
    }

    const header = `
      <div class="table-row header">
        <span>#</span><span>材料</span><span>出处</span><span>路线</span><span>分数</span>
        <span>前沿</span><span>来源</span><span>2e</span><span>可做</span><span>空白</span><span>动作</span>
      </div>
    `;

    const body = results.map((item) => `
      <button class="table-row ${selected && selected.name === item.name ? "is-selected" : ""}" type="button" data-name="${escapeAttr(item.name)}">
        <span class="pill ${item.priority.toLowerCase()}">${item.priority}</span>
        <span class="material-name"><strong>${item.name}</strong><span>${item.category}</span></span>
        <span class="source-cell">${compactSource(getSourceInfo(item))}</span>
        <span class="route-cell">${item.route}</span>
        <span class="mini-score">${item.score}</span>
        ${dotMeter(item.novelty)}
        ${dotMeter(item.evidence)}
        ${dotMeter(item.transfer)}
        ${dotMeter(item.access)}
        ${dotMeter(item.blank)}
        <span class="action-cell">${item.action}</span>
      </button>
    `).join("");

    els.table.innerHTML = header + body;
    els.table.querySelectorAll("[data-name]").forEach((row) => {
      row.addEventListener("click", () => {
        state.selectedName = row.dataset.name;
        render();
      });
    });
  }

  function unifiedSearchItems() {
    const tokens = searchTokens();
    if (!tokens.length) return [];

    const candidateItems = withScores(materials).map((item) => {
      const source = getSourceInfo(item);
      const searchText = [
        item.name,
        item.priority,
        item.category,
        item.route,
        item.sourceWeight,
        item.innovation,
        item.hypothesis,
        item.experiment,
        item.tests,
        item.risk,
        item.action,
        source.kind,
        source.venue,
        source.year,
        source.title,
        source.link
      ].join(" ");
      return {
        kind: "candidate",
        label: "候选材料",
        title: item.name,
        subtitle: `${item.priority} · ${item.category} · ${item.route}`,
        year: source.year || "候选",
        venue: source.venue,
        material: item.category,
        mechanism: item.hypothesis || item.innovation,
        detail: item.innovation,
        action: item.action,
        link: source.link,
        score: searchScore(searchText, Number(source.year) || 0) + item.score / 10,
        name: item.name,
        searchText
      };
    });

    const publishedItems = literature.map((item) => {
      const searchText = [
        item.status,
        item.year,
        item.venue,
        item.title,
        item.material,
        item.materialType,
        item.catalystClass,
        item.reaction,
        item.relevance,
        item.doi,
        item.link,
        item.sourceKind
      ].join(" ");
      return {
        kind: "published",
        label: "已发表文献",
        title: item.material,
        subtitle: `${item.year} · ${item.venue}`,
        year: item.year,
        venue: item.venue,
        material: item.materialType,
        mechanism: item.catalystClass,
        detail: item.relevance,
        action: item.reaction,
        link: item.link,
        score: searchScore(searchText, Number(item.year) || 0),
        searchText
      };
    });

    return candidateItems
      .concat(publishedItems)
      .filter((item) => state.searchScope === "all" || item.kind === state.searchScope)
      .filter((item) => matchesQuery(item.searchText))
      .sort((a, b) => b.score - a.score || Number(b.year || 0) - Number(a.year || 0));
  }

  function searchScore(text, year) {
    const haystack = normalizeSearch(text);
    const tokens = searchTokens();
    const tokenScore = tokens.reduce((sum, token) => {
      if (!token) return sum;
      const index = haystack.indexOf(token);
      if (index < 0) return sum;
      return sum + (index < 90 ? 24 : 12) + Math.min(token.length, 12);
    }, 0);
    const recency = year ? Math.max(0, Math.min(8, Number(year) - 2018)) : 0;
    return tokenScore + recency;
  }

  function renderUnifiedSearch() {
    if (!state.query) {
      els.globalSearchPanel.hidden = true;
      els.globalResults.innerHTML = "";
      return;
    }

    els.globalSearchPanel.hidden = false;
    const items = unifiedSearchItems();
    const candidateCount = items.filter((item) => item.kind === "candidate").length;
    const publishedCount = items.filter((item) => item.kind === "published").length;
    els.globalSearchSummary.textContent = `找到 ${items.length} 条：候选 ${candidateCount}，已发表 ${publishedCount}`;

    if (!items.length) {
      els.globalResults.innerHTML = `<div class="empty-state">没有找到匹配结果。可以换成年份、材料英文名、掺杂元素、孔/边缘/缺陷/*OOH 等关键词。</div>`;
      return;
    }

    els.globalResults.innerHTML = items.map((item) => `
      <article class="global-result ${item.kind}">
        <span class="result-kind">${item.label}</span>
        <div class="result-main">
          <header>
            <strong>${item.title}</strong>
            <span>${item.subtitle}</span>
          </header>
          <p>${trimText(item.detail || item.mechanism, 168)}</p>
          <footer>
            <span>时间：${item.year || "待核查"}</span>
            <span>材料/结构：${item.material || "未标注"}</span>
            <span>机理/反应：${item.mechanism || item.action || "待核查"}</span>
            <span>来源：${item.venue || "待核查"}</span>
          </footer>
        </div>
        ${item.kind === "candidate"
          ? `<button class="result-action" type="button" data-focus-candidate="${escapeAttr(item.name)}">定位候选</button>`
          : `<a class="result-action" href="${item.link || "#published"}" target="_blank" rel="noreferrer">原文</a>`}
      </article>
    `).join("");

    els.globalResults.querySelectorAll("[data-focus-candidate]").forEach((button) => {
      button.addEventListener("click", () => focusCandidate(button.dataset.focusCandidate));
    });
  }

  function focusCandidate(name) {
    state.priorities = new Set(["P0", "P1", "P2", "P3"]);
    state.category = "all";
    state.route = "all";
    state.selectedName = name;
    els.category.value = "all";
    els.route.value = "all";
    syncPriorityButtons();
    render();
    document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function trimText(value, length) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > length ? `${text.slice(0, length - 3)}...` : text;
  }

  function filteredLiterature() {
    const query = state.query;
    return literature
      .filter((item) => {
        if (!query) return true;
        const haystack = [
          item.status,
          item.year,
          item.venue,
          item.title,
          item.material,
          item.materialType,
          item.catalystClass,
          item.reaction,
          item.relevance,
          item.doi,
          item.link,
          item.sourceKind
        ].join(" ");
        return matchesQuery(haystack);
      })
      .sort((a, b) => Number(b.year) - Number(a.year) || a.venue.localeCompare(b.venue));
  }

  function renderLiterature(items) {
    els.statLiterature.textContent = literature.length;
    els.literatureSummary.textContent = `显示 ${items.length} / ${literature.length} 条已发表碳基 2e ORR 文献`;
    if (!items.length) {
      els.literatureTable.innerHTML = `<div class="empty-state">当前关键词下没有匹配的已发表文献。</div>`;
      return;
    }

    const header = `
      <div class="literature-row header">
        <span>状态</span><span>年份</span><span>催化剂材料</span><span>文献出处</span><span>为什么重要</span><span>链接</span>
      </div>
    `;
    const body = items.map((item) => `
      <div class="literature-row">
        <span class="published-badge">${item.status || "已发表催化剂"}</span>
        <span class="literature-year">${item.year}</span>
        <span class="literature-material"><strong>${item.material}</strong><em>${item.materialType} · ${item.catalystClass}</em></span>
        <span class="literature-source"><strong>${item.venue}</strong><em>${item.title}</em></span>
        <span class="literature-relevance">${item.relevance}</span>
        <span>${item.link ? `<a class="paper-link" href="${item.link}" target="_blank" rel="noreferrer">原文</a>` : "检索"}</span>
      </div>
    `).join("");

    els.literatureTable.innerHTML = header + body;
  }

  function dotMeter(value) {
    return `<span class="dot-meter">${[1, 2, 3, 4, 5].map((i) => `<span class="${i <= value ? "on" : ""}"></span>`).join("")}</span>`;
  }

  function compactSource(info) {
    const title = info.title.length > 58 ? `${info.title.slice(0, 58)}...` : info.title;
    return `<strong>${info.venue}${info.year ? ` · ${info.year}` : ""}</strong><span>${title}</span>`;
  }

  function sortLabel() {
    return {
      score: "按综合推荐分",
      transfer: "按 2e ORR 迁移潜力",
      access: "按可获得性",
      blank: "按空白度",
      rank: "按原始优先级"
    }[state.sort] || "按综合推荐分";
  }

  function drawMap(results, selected) {
    const canvas = els.mapCanvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const pad = 44;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#101013";
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height, pad);
    drawAxis(ctx, width, height, pad);

    results.forEach((item) => {
      const x = pad + ((item.access - 1) / 4) * (width - pad * 2);
      const y = height - pad - ((item.transfer - 1) / 4) * (height - pad * 2);
      const radius = 5 + item.score / 18;
      const isSelected = selected && selected.name === item.name;
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? radius + 5 : radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#d9f99d" : priorityColor(item.priority);
      ctx.globalAlpha = isSelected ? 1 : 0.78;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (isSelected) {
        ctx.strokeStyle = "rgba(217,249,157,0.48)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "700 13px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
        ctx.fillText(item.name.slice(0, 32), Math.min(x + 14, width - 280), Math.max(y - 14, 26));
      }
    });
  }

  function drawGrid(ctx, width, height, pad) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const x = pad + (i / 4) * (width - pad * 2);
      const y = pad + (i / 4) * (height - pad * 2);
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x, height - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }
  }

  function drawAxis(ctx, width, height, pad) {
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad - 7, height - pad - 4);
    ctx.moveTo(width - pad, height - pad);
    ctx.lineTo(width - pad - 7, height - pad + 4);
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad - 4, pad + 7);
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad + 4, pad + 7);
    ctx.stroke();
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    ctx.fillText("可获得性", width - pad - 56, height - pad + 28);
    ctx.save();
    ctx.translate(pad - 30, pad + 68);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("2e ORR 迁移潜力", 0, 0);
    ctx.restore();
  }

  function priorityColor(priority) {
    if (priority === "P0") return "#d9f99d";
    if (priority === "P1") return "#5eead4";
    if (priority === "P2") return "#fde68a";
    return "#bfdbfe";
  }

  function escapeAttr(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  window.addEventListener("resize", () => render());
  init();
})();
