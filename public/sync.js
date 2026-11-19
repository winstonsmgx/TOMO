/* ===== Bản deploy: đồng bộ dữ liệu dùng chung qua máy chủ + gọi Claude qua /api =====
   File này chỉ có trong bản deploy (Vercel). Nạp sau tất cả file giao diện, trước App.start().
   - Dữ liệu (DB) vẫn chạy như prototype, nhưng mỗi lần save() thì các nhóm dữ liệu đã đổi được gửi lên /api/state.
   - Vài giây một lần, trang hỏi máy chủ có gì mới (do người khác sửa) để cập nhật.
   - Ai ghi sau thắng, theo từng nhóm dữ liệu (exams, assigns, reports…).
   - Không mở được máy chủ (mở file trực tiếp, hoặc trong artifact) thì chạy y như prototype cũ. */
(function () {
  const LOCAL_ONLY = new Set(["ui", "sessionName"]);
  const POLL_MS = 4000;
  const S = { on: false, cursor: 0, last: {}, pushT: null, pushing: false, retry: 0, status: "Đang kết nối…", lastAt: null, lastBy: "", pending: false, me: null };
  const whoName = () => localStorage.getItem("examen-who") || "";
  const H = () => ({ "content-type": "application/json", "x-examen-who": encodeURIComponent(whoName() || "ẩn danh") });

  async function api(path, opt = {}) {
    const r = await fetch(path, { credentials: "same-origin", ...opt, headers: { ...H(), ...(opt.headers || {}) } });
    if (r.status === 401) { showLogin(); throw { code: "auth" }; }
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("json") ? await r.json() : await r.text();
    if (!r.ok) { const e = new Error((data && data.error) || "Lỗi máy chủ"); e.code = data && data.code; e.status = r.status; throw e; }
    return data;
  }
  const clearCaches = () => {
    if (typeof RES_CACHE !== "undefined") Object.keys(RES_CACHE).forEach(k => delete RES_CACHE[k]);
    if (typeof RESP_CACHE !== "undefined") Object.keys(RESP_CACHE).forEach(k => delete RESP_CACHE[k]);
  };
  const busyUI = () => !!document.querySelector("#layer .modal") || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "") || (typeof UI !== "undefined" && UI.role === "hs");
  const hhmm = d => new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  /* ---------- Gửi thay đổi lên ---------- */
  function changedKeys() {
    const ch = {};
    Object.keys(DB).forEach(k => { if (LOCAL_ONLY.has(k)) return; const s = JSON.stringify(DB[k]); if (s !== S.last[k]) ch[k] = DB[k]; });
    Object.keys(S.last).forEach(k => { if (!(k in DB) && S.last[k] !== "null") ch[k] = null; });
    return ch;
  }
  function schedulePush(delay = 400) { clearTimeout(S.pushT); S.pushT = setTimeout(push, delay); }
  async function push(extra = {}) {
    if (!S.on) return;
    if (S.pushing) { schedulePush(300); return; }
    const ch = changedKeys();
    if (!Object.keys(ch).length && !extra.replaceAll) return;
    S.pushing = true; setStatus("Đang lưu…");
    try {
      const snap = {}; Object.keys(ch).forEach(k => snap[k] = JSON.stringify(ch[k]));
      const r = await api("/api/state", { method: "POST", body: JSON.stringify({ changes: ch, ...extra }) });
      Object.keys(snap).forEach(k => { S.last[k] = snap[k]; });
      S.retry = 0; S.lastAt = Date.now(); S.lastBy = whoName() || "bạn";
      setStatus("Đã lưu");
    } catch (e) {
      if (e.code === "auth") return;
      S.retry = Math.min(S.retry + 1, 6); setStatus("Chưa lưu được lên máy chủ, đang thử lại…", true);
      schedulePush(1000 * 2 ** S.retry);
    } finally { S.pushing = false; }
  }

  /* ---------- Nhận thay đổi của người khác ---------- */
  async function pull(full) {
    if (!S.on && !full) return;
    const r = await api("/api/state" + (full ? "" : "?since=" + S.cursor));
    let applied = 0, by = "", at = null;
    (r.rows || []).forEach(row => {
      const s = JSON.stringify(row.value);
      if (!full) {
        if (s === S.last[row.key]) return;                     // chính mình vừa ghi
        const mine = row.key in DB ? JSON.stringify(DB[row.key]) : "null";
        if (mine !== (S.last[row.key] ?? "null")) return;      // mình đang có thay đổi chưa gửi: lần gửi tới sẽ ghi đè
      }
      if (row.value === null) delete DB[row.key]; else DB[row.key] = row.value;
      S.last[row.key] = s; applied++; by = row.updated_by; at = row.updated_at;
    });
    S.cursor = Math.max(S.cursor, r.cursor || 0);
    if (applied && !full) {
      clearCaches(); persistLocal();
      S.lastAt = at ? new Date(at).getTime() : Date.now(); S.lastBy = by || "";
      if (busyUI()) { S.pending = true; setStatus(`Có cập nhật từ ${by || "người khác"}, sẽ hiện khi cô đóng hộp thoại`); }
      else { render(); setStatus("Đã cập nhật"); }
    }
    return applied;
  }
  async function pollLoop() {
    try { if (S.on && !document.hidden) await pull(false); }
    catch (e) { if (e.code !== "auth") setStatus("Mất kết nối máy chủ, đang thử lại…", true); }
    setTimeout(pollLoop, POLL_MS);
  }
  window.addEventListener("focus", () => { if (S.on) pull(false).catch(() => {}); });

  /* ---------- Lưu tạm trên máy để mở nhanh lần sau ---------- */
  const origSave = save;
  function persistLocal() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  save = function () { origSave(); if (S.on) schedulePush(); };

  const origClose = closeM;
  closeM = function () { origClose(); if (S.pending) { S.pending = false; setTimeout(() => { if (!busyUI()) { render(); setStatus("Đã cập nhật"); } else S.pending = true; }, 0); } };

  /* ---------- Trạng thái đồng bộ ở thanh bên ---------- */
  function setStatus(t, bad) { S.status = t; S.bad = !!bad; const el = document.querySelector("#syncState"); if (el) el.outerHTML = syncHtml(); }
  function syncHtml() {
    if (!S.on) return `<div id="syncState" class="syncst off">Chưa nối máy chủ: dữ liệu chỉ ở máy này</div>`;
    return `<div id="syncState" class="syncst ${S.bad ? "bad" : ""}" title="Dữ liệu dùng chung cho mọi người có link"><i></i>${esc(S.status)}${S.lastAt ? ` · ${hhmm(S.lastAt)}${S.lastBy ? " · " + esc(S.lastBy) : ""}` : ""}<a href="#" id="whoBtn">${esc(whoName() || "Đặt tên")}</a></div>`;
  }
  const origSide = side;
  side = function () {
    origSide();
    const el = document.querySelector("#side .ai-state");
    if (el) { el.textContent = aiOK ? "TOMO đang bật (Claude API)" : "TOMO chưa bật: dùng câu mẫu"; el.insertAdjacentHTML("afterend", syncHtml()); }
  };
  document.addEventListener("click", e => {
    if (e.target && e.target.id === "whoBtn") { e.preventDefault(); askName(); }
  });
  function askName(after) {
    modal(mhead("Tên của bạn", "Ghi vào nhật ký để cả nhóm biết ai vừa sửa dữ liệu.") + `<label>Tên<input type="text" id="whoIn" class="sin" style="width:100%" value="${esc(whoName())}" placeholder="Ví dụ: Lan (UX)"></label><div class="mfoot"><button class="btn pri" id="whoOk">Lưu</button></div>`, () => {
      const go_ = () => { localStorage.setItem("examen-who", document.querySelector("#whoIn").value.trim().slice(0, 40)); closeM(); render(); after && after(); };
      document.querySelector("#whoOk").onclick = go_; document.querySelector("#whoIn").onkeydown = e => { if (e.key === "Enter") go_(); };
    });
  }

  /* ---------- Đăng nhập bằng mật khẩu chung ---------- */
  function showLogin() {
    if (document.querySelector("#loginBox")) return;
    document.body.insertAdjacentHTML("beforeend", `<div id="loginBox" class="loginov"><form class="loginf"><h1>TOMO · prototype</h1><p class="muted">Dữ liệu trong bản này là dữ liệu mẫu, dùng chung cho cả nhóm.</p>
      <label>Mật khẩu<input type="password" id="lgPw" class="sin" autocomplete="current-password" required></label>
      <label>Tên của bạn<input type="text" id="lgWho" class="sin" value="${esc(whoName())}" placeholder="Ví dụ: Lan (UX)"></label>
      <p class="lgerr" id="lgErr"></p><button class="btn pri" type="submit">Vào</button></form></div>`);
    document.querySelector("#lgPw").focus();
    document.querySelector(".loginf").onsubmit = async e => {
      e.preventDefault();
      const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: document.querySelector("#lgPw").value }) });
      if (!r.ok) { document.querySelector("#lgErr").textContent = "Sai mật khẩu."; return; }
      const w = document.querySelector("#lgWho").value.trim(); if (w) localStorage.setItem("examen-who", w.slice(0, 40));
      location.reload();
    };
  }

  /* ---------- Claude qua máy chủ ---------- */
  const blobToB64 = b => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res({ media_type: b.type || "image/jpeg", data: String(fr.result).split(",")[1] }); fr.onerror = rej; fr.readAsDataURL(b); });
  function serverSample() {
    const f = async (prompt, opt = {}) => {
      const images = opt.images ? await Promise.all(opt.images.map(blobToB64)) : [];
      const r = await fetch("/api/ai", { method: "POST", credentials: "same-origin", headers: H(), body: JSON.stringify({ prompt, tier: opt.modelTier === "quick" ? "quick" : "default", images }) });
      if (r.status === 503) throw { code: "no_ai" };
      if (r.status === 401) { showLogin(); throw { code: "auth" }; }
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.error || "AI lỗi"), { code: j.code }); }
      const rd = r.body.getReader(), dec = new TextDecoder(); let t = "";
      for (;;) { const { done, value } = await rd.read(); if (done) break; t += dec.decode(value, { stream: true }); if (opt.onText) opt.onText({ text: t.split("[[AI_ERROR]]")[0] }); }
      if (t.includes("[[AI_ERROR]]")) throw new Error(t.split("[[AI_ERROR]]")[1].trim());
      return { text: t, truncated: false };
    };
    f.limits = async () => ({ images: true });
    return f;
  }
  /* Câu mini test: gọi API riêng /api/minitest (prompt nằm ở máy chủ) */
  const origTwins = AI.twins;
  AI.twins = async function (items, onText) {
    if (!S.me || !S.me.ai) return origTwins.call(AI, items, onText);
    const mc = items.filter(i => i.type !== "rewrite");
    if (onText) onText(`TOMO đang tạo ${mc.length} câu mini test…`);
    const r = await api("/api/minitest", { method: "POST", body: JSON.stringify({ items: mc.map(it => ({ id: it.id, stem: it.stem, options: it.options, answer: it.answer, skill: it.skill, rub: it.rub })), unit: (typeof UI !== "undefined" && UI.r && UI.r.unit) || undefined }) });
    const tw = cleanItems(r.items, mc.map(i => i.skill));
    tw.forEach((t, i) => { if (mc[i]) { t.id = mc[i].id + "_T1"; t.twinOf = mc[i].id; t.rub = clone(mc[i].rub); t.b = mc[i].b; t.skill = mc[i].skill; } });
    if (onText) onText(`Đã tạo ${tw.length} câu.`);
    return tw;
  };

  /* ---------- Phiên dữ liệu và quản lí dữ liệu (Cài đặt prototype) ---------- */
  const origSessPanel = sessPanel, origBindSess = bindSess;
  sessPanel = function () {
    if (!S.on) return origSessPanel();
    return `<section class="panel"><div class="phead"><h2>Phiên dữ liệu (dùng chung trên máy chủ)</h2></div>
      <p class="muted small">Mỗi phiên là một bản đầy đủ của dữ liệu prototype. Cả nhóm thấy cùng danh sách. Khi mở lại một phiên hoặc đặt lại dữ liệu mẫu, dữ liệu hiện tại được tự lưu trước nên luôn quay lại được. Mọi người đang mở trang sẽ thấy dữ liệu đổi sau vài giây.</p>
      <div class="sessbar"><input type="text" id="snapName" class="sin" placeholder="Tên phiên, ví dụ: Trước khi thử nhập phiếu"><button class="btn" id="snapSave">Lưu phiên hiện tại</button><button class="btn pri" id="sessNew">Đặt lại dữ liệu mẫu</button><label class="btn ghost" for="snapImp">Nhập từ file</label><input type="file" id="snapImp" accept=".json,application/json" hidden><button class="btn ghost" id="dlAll">Tải toàn bộ dữ liệu</button></div>
      <div id="sessList" class="muted small">Đang tải danh sách phiên…</div></section>
      <section class="panel"><div class="phead"><h2>Quản lí dữ liệu</h2><span class="sp"></span><button class="btn sm ghost" id="admRefresh">Tải lại</button></div><div id="admBox" class="muted small">Đang tải…</div></section>`;
  };
  bindSess = function () {
    if (!S.on) return origBindSess();
    const $q = id => document.querySelector(id);
    const fmtB = n => n > 1024 ? (n / 1024).toFixed(1) + " KB" : n + " B";
    const when = d => new Date(d).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    async function list() {
      const r = await api("/api/snapshots");
      const box = $q("#sessList"); if (!box) return;
      box.className = "";
      box.innerHTML = r.rows.length ? `<table class="tbl compact sesst"><thead><tr><th>Phiên đã lưu</th><th>Lưu lúc</th><th>Người lưu</th><th class="num">Dung lượng</th><th></th></tr></thead><tbody>${r.rows.map(x => `<tr><td><b>${esc(x.name)}</b></td><td class="small">${when(x.created_at)}</td><td class="small">${esc(x.created_by || "")}</td><td class="num small">${fmtB(+x.bytes)}</td><td class="act"><div class="acts"><button class="btn sm pri" data-sopen="${x.id}">Mở lại</button><a class="btn sm" href="/api/snapshots?id=${x.id}" download>Tải xuống</a><button class="iconbtn" data-sdel="${x.id}" aria-label="Xoá phiên">${ic("x")}</button></div></td></tr>`).join("")}</tbody></table>` : `<p class="small muted">Chưa có phiên nào được lưu.</p>`;
      box.querySelectorAll("[data-sopen]").forEach(b => b.onclick = () => { const x = r.rows.find(y => y.id === b.dataset.sopen); confirmBox(`Mở lại phiên "${esc(x.name)}"?`, "Dữ liệu hiện tại của cả nhóm sẽ được tự lưu thành một phiên trước, rồi thay bằng phiên này.", "Mở lại", async () => { await api("/api/snapshots", { method: "POST", body: JSON.stringify({ action: "restore", id: x.id }) }); await reloadAll(); toast(`Đang dùng phiên "${x.name}".`); }); });
      box.querySelectorAll("[data-sdel]").forEach(b => b.onclick = () => { const x = r.rows.find(y => y.id === b.dataset.sdel); confirmBox(`Xoá phiên "${esc(x.name)}"?`, "Phiên sẽ bị xoá khỏi máy chủ cho cả nhóm. Cần giữ thì tải xuống trước.", "Xoá", async () => { await api("/api/snapshots", { method: "POST", body: JSON.stringify({ action: "delete", id: x.id }) }); list(); toast("Đã xoá phiên."); }); });
    }
    async function admin() {
      const r = await api("/api/admin"); const box = $q("#admBox"); if (!box) return; box.className = "";
      box.innerHTML = `<div class="admgrid"><div><span class="flabel">Dữ liệu theo nhóm</span><table class="tbl compact"><thead><tr><th>Khoá</th><th class="num">Lần sửa</th><th class="num">Dung lượng</th><th>Sửa lần cuối</th></tr></thead><tbody>${r.keys.filter(k => !k.deleted).map(k => `<tr><td class="mono">${esc(k.key)}</td><td class="num">${k.version}</td><td class="num">${fmtB(+k.bytes)}</td><td class="small">${when(k.updated_at)} · ${esc(k.updated_by || "")}</td></tr>`).join("")}</tbody></table></div>
        <div><span class="flabel">Gọi Claude API</span><div class="admkpi"><div><b>${r.ai.calls_24h}</b><span>lượt trong 24 giờ</span></div><div><b>${r.ai.calls}</b><span>lượt từ trước tới nay</span></div><div><b>${(r.ai.input_tokens / 1000).toFixed(1)}k / ${(r.ai.output_tokens / 1000).toFixed(1)}k</b><span>token vào / ra</span></div><div><b class="${r.ai.errors ? "neg-t" : ""}">${r.ai.errors}</b><span>lượt lỗi</span></div></div>
        <table class="tbl compact"><thead><tr><th>Lúc</th><th>Ai</th><th>Việc</th><th class="num">Token</th><th class="num">Giây</th></tr></thead><tbody>${r.aiLast.map(x => `<tr><td class="small">${when(x.at)}</td><td class="small">${esc(x.who || "")}</td><td class="small">${esc(x.route)}${x.ok ? "" : ` <span class="neg-t">lỗi</span>`}</td><td class="num small">${x.input_tokens}/${x.output_tokens}</td><td class="num small">${(x.ms / 1000).toFixed(1)}</td></tr>`).join("") || `<tr><td colspan="5" class="muted small">Chưa có lượt gọi nào.</td></tr>`}</tbody></table>
        <span class="flabel">Nhật ký thay đổi</span><ul class="admlog">${r.audit.map(a => `<li><span class="small muted">${when(a.at)}</span> <b>${esc(a.who || "")}</b> ${esc(a.action)} ${a.keys && a.keys.length ? `<span class="mono small">${esc(a.keys.join(", "))}</span>` : ""}</li>`).join("")}</ul></div></div>
        <p class="small muted">Muốn xem hoặc sửa trực tiếp bằng SQL: mở Neon Console (Vercel → Storage → Neon → Open in Neon). Bảng chính là <span class="mono">kv</span>: mỗi dòng một nhóm dữ liệu dạng JSON.</p>`;
    }
    $q("#snapSave").onclick = async () => { const n = $q("#snapName").value.trim() || ("Phiên " + when(Date.now())); await push(); await api("/api/snapshots", { method: "POST", body: JSON.stringify({ action: "save", name: n }) }); $q("#snapName").value = ""; list(); toast(`Đã lưu phiên "${n}".`); };
    $q("#sessNew").onclick = () => confirmBox("Đặt lại dữ liệu mẫu cho cả nhóm?", "Dữ liệu hiện tại được tự lưu thành một phiên trước. Sau đó mọi người dùng lại dữ liệu mẫu gốc.", "Đặt lại", async () => { await api("/api/snapshots", { method: "POST", body: JSON.stringify({ action: "save", name: "Tự lưu trước khi đặt lại " + when(Date.now()) }) }); await replaceAll(seed(), "reset"); toast("Đã đặt lại dữ liệu mẫu. Bản cũ nằm trong danh sách phiên."); });
    $q("#dlAll").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ name: "Toàn bộ dữ liệu " + when(Date.now()), data: DB }, null, 1)], { type: "application/json" })); a.download = "examen-du-lieu.json"; a.click(); };
    $q("#snapImp").onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { let d; try { const j = JSON.parse(t); d = j.data || j; if (!d.exams || !d.assigns) throw 0; } catch (_) { toast("File này không phải dữ liệu của prototype."); return; } confirmBox("Thay toàn bộ dữ liệu bằng file này?", "Dữ liệu hiện tại được tự lưu thành một phiên trước.", "Thay", async () => { await api("/api/snapshots", { method: "POST", body: JSON.stringify({ action: "save", name: "Tự lưu trước khi nhập file " + when(Date.now()) }) }); await replaceAll(d, "import"); toast("Đã nhập dữ liệu từ file."); }); }); };
    $q("#admRefresh").onclick = () => admin();
    list().catch(e => { const b = $q("#sessList"); if (b) b.textContent = "Không tải được danh sách phiên: " + e.message; });
    admin().catch(e => { const b = $q("#admBox"); if (b) b.textContent = "Không tải được: " + e.message; });
  };

  async function replaceAll(data, action) {
    const ui = DB.ui; DB = clone(data); if (ui) DB.ui = ui; clearCaches();
    const ch = {}; Object.keys(DB).forEach(k => { if (!LOCAL_ONLY.has(k)) ch[k] = DB[k]; });
    await api("/api/state", { method: "POST", body: JSON.stringify({ changes: ch, replaceAll: true, action }) });
    Object.keys(ch).forEach(k => S.last[k] = JSON.stringify(ch[k]));
    Object.keys(S.last).forEach(k => { if (!(k in ch)) S.last[k] = "null"; });
    persistLocal(); UI.flow = null; go({ v: "set" });
  }
  async function reloadAll() {
    const ui = DB.ui; DB = {}; if (ui) DB.ui = ui; S.last = {}; S.cursor = 0;
    await pull(true); clearCaches(); afterLoad(); go({ v: "set" });
  }
  /* Chạy lại các bước chuẩn hoá dữ liệu của load() (đổi tên trường cũ…) trên dữ liệu vừa tải về */
  function afterLoad() {
    persistLocal(); load();
    Object.keys(DB).forEach(k => { if (!LOCAL_ONLY.has(k) && !(k in S.last)) S.last[k] = undefined; });
    schedulePush(50);
  }

  /* ---------- Khởi động ---------- */
  const origStart = App.start;
  App.start = async function () {
    let me = null;
    try { const r = await fetch("/api/me", { credentials: "same-origin" }); if (r.ok) me = await r.json(); } catch (e) {}
    if (!me || !me.backend) return origStart.call(App);      // không có máy chủ: chạy như prototype cũ
    S.me = me;
    if (me.needPassword && !me.authed) { document.body.classList.add("needlogin"); showLogin(); return; }
    load(); render();                                           // hiện ngay bản đã lưu trên máy
    if (me.ai) { sampleFn = serverSample(); aiOK = true; imgOK = true; } else { sampleFn = null; aiOK = false; }
    if (!me.db) { setStatus("Máy chủ chưa có DATABASE_URL: dữ liệu chỉ ở máy này", true); render(); return; }
    try {
      const ui = DB.ui; DB = {}; if (ui) DB.ui = ui;
      const n = await pull(true);
      S.on = true;
      if (!n) {                                                 // bảng còn trống: máy đầu tiên gửi dữ liệu mẫu
        const sd = seed(); Object.assign(DB, sd);
        const ch = {}; Object.keys(DB).forEach(k => { if (!LOCAL_ONLY.has(k)) ch[k] = DB[k]; });
        const r = await api("/api/state", { method: "POST", body: JSON.stringify({ changes: ch, action: "init" }) });
        if (r.skipped) { DB = {}; if (ui) DB.ui = ui; S.last = {}; await pull(true); }
        else Object.keys(ch).forEach(k => S.last[k] = JSON.stringify(ch[k]));
      }
      afterLoad(); setStatus("Đã đồng bộ"); render();
      if (!whoName()) askName();
      setTimeout(pollLoop, POLL_MS);
    } catch (e) {
      if (e.code === "auth") return;
      S.on = false; console.error(e); load(); render(); setStatus("Không nối được máy chủ: " + e.message, true);
    }
  };
})();
