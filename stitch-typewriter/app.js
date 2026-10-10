(() => {
  "use strict";

  const canvas = document.getElementById("fabricCanvas");
  const wrap = document.getElementById("canvasWrap");
  const ctx = canvas.getContext("2d");
  const textInput = document.getElementById("textInput");
  const textLength = document.getElementById("textLength");
  const stitchCount = document.getElementById("stitchCount");
  const statusText = document.getElementById("statusText");
  const toolHint = document.getElementById("toolHint");
  const toast = document.getElementById("toast");
  const swatchPreview = document.getElementById("swatchPreview");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");

  const colors = [
    { name: "莓果红", value: "#c45266" },
    { name: "珊瑚橙", value: "#d98663" },
    { name: "柠檬黄", value: "#d9b744" },
    { name: "鼠尾草", value: "#7f9d83" },
    { name: "湖水蓝", value: "#65a7ad" },
    { name: "靛蓝", value: "#5f729f" },
    { name: "薰衣草", value: "#9279a8" },
    { name: "奶油白", value: "#f5eee1" },
    { name: "栗子棕", value: "#936353" },
    { name: "墨黑", value: "#413a3e" },
  ];

  const motifs = [
    { id: "star", label: "星星", icon: "<path d=\"M14 2.5l2.7 7.1 7.3.3-5.7 4.6 2 7-6.3-4-6.3 4 2-7L4 9.9l7.3-.3z\"/>" },
    { id: "heart", label: "心心", icon: "<path d=\"M14 22.3S3.5 16.2 3.5 9.1C3.5 5.3 8.1 3.1 11 6c1.3 1.3 3 3.2 3 3.2S15.7 7.3 17 6c2.9-2.9 7.5-.7 7.5 3.1C24.5 16.2 14 22.3 14 22.3z\"/>" },
    { id: "flower", label: "小花", icon: "<circle cx=\"14\" cy=\"14\" r=\"3\"/><path d=\"M14 10C8 8 8 2 12 2c3 0 3 5 2 8M18 14c2-6 8-6 8-2 0 3-5 3-8 2M14 18c6-2 6 4 2 6-3 0-3-5-2-6M10 14c-2 6-8 6-8 2 0-3 5-3 8-2\"/>" },
    { id: "butterfly", label: "蝴蝶", icon: "<path d=\"M14 12c-2-8-8-9-9-5-.7 3 2 6 6 7-4 0-7 2-6 5 1 3 6 1 9-3M14 12c2-8 8-9 9-5 .7 3-2 6-6 7 4 0 7 2 6 5-1 3-6 1-9-3M14 10v9\"/>" },
    { id: "cloud", label: "云朵", icon: "<path d=\"M5 19h17a4 4 0 0 0 .4-8A7 7 0 0 0 9 8a5 5 0 0 0-4 9z\"/>" },
    { id: "moon", label: "月亮", icon: "<path d=\"M21 16.5A9 9 0 0 1 11.5 3a9 9 0 1 0 9.5 13.5z\"/>" },
    { id: "music", label: "音符", icon: "<path d=\"M18 4v12.2a3.5 3.5 0 1 1-2-3.2V7l8-2v9.2a3.5 3.5 0 1 1-2-3.2V3z\"/>" },
    { id: "sun", label: "太阳", icon: "<circle cx=\"14\" cy=\"14\" r=\"4\"/><path d=\"M14 2v3M14 23v3M2 14h3M23 14h3M5.5 5.5l2.1 2.1M20.4 20.4l2.1 2.1M22.5 5.5l-2.1 2.1M7.6 20.4l-2.1 2.1\"/>" },
    { id: "leaf", label: "叶子", icon: "<path d=\"M23 4C12 4 5 8 5 15c0 4 3 6 6 6 7 0 11-7 12-17z\"/><path d=\"M4 24C8 17 13 13 20 9\"/>" },
  ];

  const state = {
    tool: "thread",
    color: colors[0].value,
    items: [],
    selectedMotif: null,
    stitchScale: 1,
    fabricWarmth: 1,
    showBorder: true,
    sparkle: true,
    brushSize: 4,
    pointer: { x: 0, y: 0 },
    drawing: null,
    history: [],
    future: [],
  };

  const toolCopy = {
    thread: ["先挑一根喜欢的线", "绣线已就绪"],
    motif: ["选一个小图案", "点一下布面放置"],
    scissors: ["剪掉不想要的针脚", "剪刀已就绪"],
    settings: ["调整你的布面", "设置已更新"],
    draw: ["画一条自由的线", "按住开始手绘"],
  };

  function svgIcon(path) {
    return `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function initControls() {
    const colorGrid = document.getElementById("colorGrid");
    colorGrid.innerHTML = colors.map((color, index) => `<button class="color-chip${index === 0 ? " selected" : ""}" type="button" role="listitem" aria-label="${color.name}" title="${color.name}" data-color="${color.value}" style="background:${color.value}"></button>`).join("");
    colorGrid.addEventListener("click", (event) => {
      const chip = event.target.closest(".color-chip");
      if (!chip) return;
      setColor(chip.dataset.color);
      if (state.tool !== "thread") setTool("thread");
    });

    const motifGrid = document.getElementById("motifGrid");
    motifGrid.innerHTML = motifs.map((motif) => `<button class="motif-button" type="button" data-motif="${motif.id}" aria-label="${motif.label}">${svgIcon(motif.icon)}<span>${motif.label}</span></button>`).join("");
    motifGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".motif-button");
      if (!button) return;
      state.selectedMotif = motifs.find((motif) => motif.id === button.dataset.motif);
      motifGrid.querySelectorAll(".motif-button").forEach((item) => item.classList.toggle("selected", item === button));
      setTool("motif");
      showToast("现在点一下布面放置图案");
    });

    document.querySelectorAll(".tool-button").forEach((button) => button.addEventListener("click", () => setTool(button.dataset.tool)));
    document.getElementById("customColor").addEventListener("input", (event) => setColor(event.target.value));
    document.getElementById("stitchBtn").addEventListener("click", stitchText);
    textInput.addEventListener("input", () => { textLength.textContent = `${textInput.value.length}/32`; });
    textInput.addEventListener("keydown", (event) => { if (event.key === "Enter") stitchText(); });
    document.getElementById("clearBtn").addEventListener("click", clearCanvas);
    document.getElementById("undoBtn").addEventListener("click", undo);
    document.getElementById("redoBtn").addEventListener("click", redo);
    document.getElementById("saveBtn").addEventListener("click", savePng);
    document.getElementById("backToThreadBtn").addEventListener("click", () => setTool("thread"));
    document.getElementById("stitchSize").addEventListener("input", (event) => { state.stitchScale = Number(event.target.value); document.getElementById("stitchSizeValue").textContent = `${state.stitchScale.toFixed(1)}×`; draw(); });
    document.getElementById("fabricWarmth").addEventListener("input", (event) => { state.fabricWarmth = Number(event.target.value); document.getElementById("fabricWarmthValue").textContent = ["冷", "中", "暖"][state.fabricWarmth]; draw(); });
    document.getElementById("borderToggle").addEventListener("change", (event) => { state.showBorder = event.target.checked; draw(); });
    document.getElementById("sparkleToggle").addEventListener("change", (event) => { state.sparkle = event.target.checked; draw(); });
    document.getElementById("brushSize").addEventListener("input", (event) => { state.brushSize = Number(event.target.value); });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (event.key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); undo(); }
      if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
    });
  }

  function setColor(value) {
    state.color = value;
    swatchPreview.style.background = value;
    document.querySelectorAll(".color-chip").forEach((chip) => chip.classList.toggle("selected", chip.dataset.color.toLowerCase() === value.toLowerCase()));
    document.getElementById("customColor").value = value;
    draw();
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll(".tool-button").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
    document.querySelectorAll(".panel-section").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== tool));
    toolHint.textContent = toolCopy[tool][0];
    wrap.dataset.tool = tool;
    if (tool === "motif" && !state.selectedMotif) showToast("先选一个图案");
    statusText.textContent = toolCopy[tool][1];
  }

  function resizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.canvasWidth = rect.width;
    state.canvasHeight = rect.height;
    draw();
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function addHistory() {
    state.history.push(JSON.stringify(state.items));
    if (state.history.length > 40) state.history.shift();
    state.future = [];
    updateHistoryButtons();
  }

  function restoreItems(serialized) {
    state.items = JSON.parse(serialized || "[]");
    draw();
    updateHistoryButtons();
  }

  function undo() {
    if (!state.history.length) return;
    state.future.push(JSON.stringify(state.items));
    restoreItems(state.history.pop());
    showToast("已撤销");
  }

  function redo() {
    if (!state.future.length) return;
    state.history.push(JSON.stringify(state.items));
    restoreItems(state.future.pop());
    showToast("已重做");
  }

  function updateHistoryButtons() {
    undoBtn.disabled = !state.history.length;
    redoBtn.disabled = !state.future.length;
  }

  function stitchText() {
    const text = textInput.value.trim();
    if (!text) { showToast("先写一句想留下的话"); textInput.focus(); return; }
    addHistory();
    const x = state.canvasWidth / 2;
    const y = state.canvasHeight / 2;
    state.items.push({ type: "text", text, x, y, color: state.color, size: Math.max(26, Math.min(56, 47 - text.length * .42)), rotation: (Math.random() - .5) * .025 });
    textInput.value = "";
    textLength.textContent = "0/32";
    statusText.textContent = "一行字绣好了";
    draw();
    showToast("针脚完成 · 可以继续添加");
  }

  function placeMotif(point) {
    if (!state.selectedMotif) { showToast("先在右侧选一个图案"); return; }
    addHistory();
    state.items.push({ type: "motif", motif: state.selectedMotif.id, x: point.x, y: point.y, color: state.color, size: 28 + Math.random() * 8, rotation: (Math.random() - .5) * .2 });
    statusText.textContent = `${state.selectedMotif.label} 已放置`;
    draw();
  }

  function removeAt(point) {
    const index = findItemIndex(point);
    if (index < 0) return;
    addHistory();
    state.items.splice(index, 1);
    statusText.textContent = "剪掉了一针";
    draw();
  }

  function findItemIndex(point) {
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      const radius = item.type === "text" ? Math.max(34, item.size) : item.type === "motif" ? item.size * 1.2 : 26;
      if (item.type === "path") {
        if (item.points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < 18)) return i;
      } else if (Math.hypot(item.x - point.x, item.y - point.y) < radius) return i;
    }
    return -1;
  }

  function pointerDown(event) {
    const point = getPoint(event);
    state.pointer = point;
    canvas.setPointerCapture?.(event.pointerId);
    if (state.tool === "draw") {
      addHistory();
      state.drawing = { type: "path", points: [point], color: state.color, size: state.brushSize };
      state.items.push(state.drawing);
      draw();
    } else if (state.tool === "motif") placeMotif(point);
    else if (state.tool === "scissors") removeAt(point);
  }

  function pointerMove(event) {
    const point = getPoint(event);
    const rect = wrap.getBoundingClientRect();
    canvasCursor.style.left = `${point.x}px`; canvasCursor.style.top = `${point.y}px`;
    if (state.tool === "draw" && state.drawing) {
      state.drawing.points.push(point);
      draw();
    }
    if (state.tool === "scissors" && (event.buttons & 1)) removeAt(point);
    if (state.tool === "draw") statusText.textContent = `正在绣线 · ${Math.round(point.x / rect.width * 100)}%`;
  }

  function pointerUp() {
    if (state.drawing) {
      if (state.drawing.points.length < 2) state.items.pop();
      state.drawing = null;
      statusText.textContent = "自由线条完成";
      draw();
    }
  }

  function clearCanvas() {
    if (!state.items.length) { showToast("布面已经是空的"); return; }
    addHistory();
    state.items = [];
    statusText.textContent = "布面清空了";
    draw();
    showToast("布面已清空，可以重新开始");
  }

  function draw() {
    const width = state.canvasWidth || wrap.clientWidth;
    const height = state.canvasHeight || wrap.clientHeight;
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    drawFabric(width, height);
    if (state.showBorder) drawBorder(width, height);
    state.items.forEach(drawItem);
    stitchCount.textContent = state.items.length;
  }

  function drawFabric(width, height) {
    const base = ["#e9e5d7", "#f1e7d7", "#f4ddcc"][state.fabricWarmth];
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = .13;
    ctx.strokeStyle = state.fabricWarmth === 0 ? "#6d8990" : "#ba8e86";
    ctx.lineWidth = .65;
    for (let x = -height; x < width + height; x += 11) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + height, height); ctx.stroke(); }
    for (let x = 0; x < width + height; x += 11) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - height, height); ctx.stroke(); }
    ctx.restore();
    const wash = ctx.createRadialGradient(width * .5, height * .42, 20, width * .5, height * .5, width * .78);
    wash.addColorStop(0, "rgba(255,255,255,.18)"); wash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
  }

  function drawBorder(width, height) {
    const p = 30;
    ctx.save();
    ctx.strokeStyle = "rgba(167, 86, 105, .75)";
    ctx.lineWidth = 1.35;
    ctx.setLineDash([2.5, 5]);
    roundedRect(ctx, p, p, width - p * 2, height - p * 2, 14);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = .8;
    ctx.beginPath();
    for (let x = p + 5; x < width - p - 5; x += 14) { ctx.moveTo(x, p - 4); ctx.arc(x + 5, p - 4, 4, 0, Math.PI); }
    ctx.stroke();
    for (let x = p + 5; x < width - p - 5; x += 14) { ctx.moveTo(x, height - p + 4); ctx.arc(x + 5, height - p + 4, 4, Math.PI, 0); }
    ctx.stroke();
    ctx.restore();
  }

  function drawItem(item) {
    if (item.type === "text") drawText(item);
    else if (item.type === "motif") drawMotif(item);
    else if (item.type === "path") drawPath(item);
  }

  function drawText(item) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation || 0);
    const fontSize = item.size * state.stitchScale;
    ctx.font = `600 ${fontSize}px "Noto Serif SC", Georgia, serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255, 250, 243, .78)";
    ctx.lineWidth = 3.8;
    ctx.strokeText(item.text, 0, 0);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 1.75;
    ctx.strokeText(item.text, 0, 0);
    ctx.fillStyle = item.color;
    ctx.globalAlpha = .12;
    ctx.fillText(item.text, 1.3, 1.1);
    ctx.globalAlpha = 1;
    if (state.sparkle) drawThreadTicks(item.text, fontSize, item.color);
    ctx.restore();
  }

  function drawThreadTicks(text, size, color) {
    const length = Math.min(120, text.length * size * .7);
    ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = .45; ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(-length / 2, size * .58); ctx.lineTo(length / 2, size * .58); ctx.stroke(); ctx.restore();
  }

  function drawMotif(item) {
    ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.rotation || 0); ctx.scale((item.size / 28) * state.stitchScale, (item.size / 28) * state.stitchScale);
    ctx.strokeStyle = "rgba(255,250,243,.88)"; ctx.lineWidth = 4.1; drawMotifPath(item.motif); ctx.stroke();
    ctx.strokeStyle = item.color; ctx.lineWidth = 1.7; drawMotifPath(item.motif); ctx.stroke();
    if (state.sparkle) { ctx.fillStyle = item.color; ctx.globalAlpha = .75; ctx.fillRect(-1, -1, 2, 2); ctx.fillRect(12, 7, 2, 2); }
    ctx.restore();
  }

  function drawMotifPath(id) {
    ctx.beginPath();
    if (id === "star") { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 7 : 15; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath(); }
    else if (id === "heart") { ctx.moveTo(0, 13); ctx.bezierCurveTo(-21, 0, -13, -14, -4, -7); ctx.bezierCurveTo(0, -4, 0, -2, 0, -2); ctx.bezierCurveTo(0, -2, 0, -4, 4, -7); ctx.bezierCurveTo(13, -14, 21, 0, 0, 13); }
    else if (id === "flower") { for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; ctx.ellipse(Math.cos(a) * 9, Math.sin(a) * 9, 7, 4.5, a, 0, Math.PI * 2); } ctx.arc(0, 0, 3, 0, Math.PI * 2); }
    else if (id === "butterfly") { ctx.moveTo(0, -1); ctx.bezierCurveTo(-21, -18, -20, 4, -2, 5); ctx.bezierCurveTo(-21, 6, -16, 20, 0, 5); ctx.bezierCurveTo(21, -18, 20, 4, 2, 5); ctx.bezierCurveTo(21, 6, 16, 20, 0, 5); ctx.moveTo(0, -8); ctx.lineTo(0, 14); }
    else if (id === "cloud") { ctx.moveTo(-15, 6); ctx.bezierCurveTo(-18, -2, -11, -8, -5, -6); ctx.bezierCurveTo(-1, -17, 15, -15, 16, -5); ctx.bezierCurveTo(26, -5, 25, 8, 16, 8); ctx.lineTo(-15, 8); }
    else if (id === "moon") { ctx.arc(0, 0, 15, -.9, 1.2); ctx.bezierCurveTo(7, 3, 8, -7, 0, -15); }
    else if (id === "music") { ctx.moveTo(5, -15); ctx.lineTo(5, 9); ctx.arc(0, 9, 5, 0, Math.PI * 2); ctx.moveTo(5, -15); ctx.lineTo(16, -18); ctx.lineTo(16, 5); ctx.arc(11, 5, 5, 0, Math.PI * 2); }
    else if (id === "sun") { ctx.arc(0, 0, 7, 0, Math.PI * 2); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } }
    else if (id === "leaf") { ctx.moveTo(15, -13); ctx.bezierCurveTo(-1, -14, -13, -7, -11, 7); ctx.bezierCurveTo(-9, 16, 4, 14, 10, 7); ctx.bezierCurveTo(14, 2, 15, -5, 15, -13); ctx.moveTo(-12, 13); ctx.bezierCurveTo(-5, 5, 2, 0, 12, -9); }
  }

  function drawPath(item) {
    if (!item.points.length) return;
    ctx.save(); ctx.strokeStyle = "rgba(255,250,243,.88)"; ctx.lineWidth = item.size + 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; strokePoints(item.points);
    ctx.strokeStyle = item.color; ctx.lineWidth = item.size; ctx.setLineDash([4, 2.5]); strokePoints(item.points); ctx.restore();
  }

  function strokePoints(points) { ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y); ctx.stroke(); }

  function roundedRect(context, x, y, width, height, radius) { context.beginPath(); context.moveTo(x + radius, y); context.arcTo(x + width, y, x + width, y + height, radius); context.arcTo(x + width, y + height, x, y + height, radius); context.arcTo(x, y + height, x, y, radius); context.arcTo(x, y, x + width, y, radius); context.closePath(); }

  function savePng() {
    const link = document.createElement("a");
    link.download = `stitch-typewriter-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("PNG 已保存到下载文件夹");
  }

  let toastTimer;
  function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("show"); toastTimer = setTimeout(() => toast.classList.remove("show"), 2200); }

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  const canvasCursor = document.getElementById("canvasCursor");
  wrap.addEventListener("pointerleave", () => { canvasCursor.style.opacity = "0"; });
  wrap.addEventListener("pointerenter", () => { canvasCursor.style.opacity = "1"; });

  initControls();
  updateHistoryButtons();
  resizeCanvas();
})();
