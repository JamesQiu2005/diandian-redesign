/* ============================================================================
   点点 AI 重设计 — 交互脚本
   仅用于：滚动进度 / 入场动画 / 瀑布流渲染 / 液态玻璃搜索框 / 对话流演示
   ========================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => (reduceMotion ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------------------------------------------------------- 滚动进度条 */
  const progress = q('#progress');
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------- 入场动画 */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  qa('.reveal').forEach((n) => io.observe(n));

  /* ---------------------------------------------------------- 笔记卡片 */
  function cardEl(note, coverHeight) {
    const art = el('article', 'feed-card');
    const cover = el('div', 'fc-cover');
    cover.style.height = coverHeight + 'px';
    cover.style.backgroundImage = fallbackGradient(note); // 先放渐变兜底
    const im = new Image(); // 真图加载成功后替换；失败则保留渐变
    im.onload = () => { cover.style.backgroundImage = 'url("' + coverUrl(note) + '")'; };
    im.src = coverUrl(note);
    cover.appendChild(el('span', 'fc-tag', note.tag));

    const body = el('div', 'fc-body');
    body.appendChild(el('h5', 'fc-title', note.title));
    const foot = el('div', 'fc-foot');
    const author = el('span', 'fc-author');
    author.appendChild(el('span', 'fc-ava', note.avatar));
    author.appendChild(el('b', null, note.author));
    foot.appendChild(author);
    foot.appendChild(el('span', 'fc-likes', formatLikes(note.likes)));
    body.appendChild(foot);

    art.appendChild(cover);
    art.appendChild(body);
    return art;
  }

  // 纵向瀑布流：建 N 个列容器，每张卡片放进当前「最短的列」，列自然向下增高
  // —— 这正是小红书真实的排布方式：纵向滚动，不会横向溢出
  function renderFeed(sel, notes, cols, scale) {
    const host = q(sel);
    if (!host) return;
    host.innerHTML = '';
    const columns = [];
    const heights = [];
    for (let i = 0; i < cols; i++) {
      const c = el('div', 'feed-col');
      host.appendChild(c);
      columns.push(c);
      heights.push(0);
    }
    notes.forEach((n) => {
      let min = 0;
      for (let i = 1; i < cols; i++) if (heights[i] < heights[min]) min = i;
      const coverH = Math.round((n.h || 400) * scale);
      columns[min].appendChild(cardEl(n, coverH));
      heights[min] += coverH + 70; // 估算卡片整体高度，用于均衡分列
    });
  }
  renderFeed('[data-feed="browse"]', feedNotes, 4, 0.52); // 主页：每行 4 列
  renderFeed('[data-feed="current"]', feedNotes.slice(0, 8), 2, 0.34); // 诊断 mock：每行 2 列

  /* ---------------------------------------------------------- 搜索历史 */
  const histHost = q('[data-history]');
  if (histHost) {
    searchHistory.forEach((h) => {
      const b = el('button', 'gh-pill' + (h.ai ? ' is-ai' : ''), h.q);
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (h.ai) {
          closeGlass();
          const chat = q('#chat');
          if (chat) chat.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        } else {
          const inp = q('.g-input');
          if (inp) inp.dataset.placeholder = h.q;
        }
      });
      histHost.appendChild(b);
    });
  }

  /* ---------------------------------------------- 液态玻璃搜索框 开/合 */
  const glassBar = q('#glassBar');
  const dock = q('[data-dock]');
  const xMain = glassBar ? glassBar.closest('.x-main') : null;
  function closeGlass() { if (xMain) xMain.classList.remove('search-open'); }
  if (glassBar && xMain) {
    glassBar.addEventListener('click', (e) => { e.stopPropagation(); xMain.classList.toggle('search-open'); });
    glassBar.addEventListener('keydown', (e) => { if (e.target === glassBar && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); xMain.classList.toggle('search-open'); } });
    const scrim = q('[data-scrim]');
    if (scrim) scrim.addEventListener('click', closeGlass);
    document.addEventListener('click', (e) => { if (dock && !dock.contains(e.target)) closeGlass(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGlass(); });
  }

  /* -------------------------------- 猜你想搜 / 猜你想问（问点点 AI 切换）*/
  const askPill = q('#askPill');
  const guessList = q('[data-guess-list]');
  const guessTitle = q('[data-guess-title]');
  const guessBadge = q('[data-guess-badge]');
  const gInput = q('.g-input');

  function renderGuess(aiMode) {
    if (!guessList) return;
    const items = aiMode ? guessAsk : guessSearch;
    guessList.innerHTML = '';
    guessList.classList.toggle('is-ai', !!aiMode);
    items.forEach((t) => {
      const li = el('li', 'gg-item');
      li.appendChild(el('span', null, t));
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        if (gInput) gInput.dataset.placeholder = t;
      });
      guessList.appendChild(li);
    });
    if (guessTitle) guessTitle.textContent = aiMode ? '猜你想问' : '猜你想搜';
    if (guessBadge) guessBadge.hidden = !aiMode;
  }
  renderGuess(false);

  if (askPill && xMain) {
    askPill.addEventListener('click', (e) => {
      e.stopPropagation();
      xMain.classList.add('search-open'); // 点 pill 时确保面板展开
      const on = xMain.classList.toggle('ai-mode');
      askPill.classList.toggle('is-on', on);
      askPill.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (gInput) gInput.dataset.placeholder = on ? '直接问点点，描述你想要的…' : '搜索，或者直接问点点…';
      renderGuess(on);
    });
  }

  /* ---------------------------------------------------------- 对话流演示 */
  const thread = q('[data-chat-thread]');
  const chatTitle = q('[data-chat-title]');
  let playToken = 0;
  let currentScene = 'fashion_scene';

  function userMsg(text) {
    const m = el('div', 'msg msg--user');
    m.appendChild(el('div', 'msg-avatar', '我'));
    m.appendChild(el('div', 'msg-bubble', text));
    return m;
  }
  function typingMsg() {
    const m = el('div', 'msg msg--ai');
    m.appendChild(el('div', 'msg-avatar', '点'));
    const bubble = el('div', 'msg-bubble');
    const t = el('div', 'typing');
    t.append(el('span'), el('span'), el('span'));
    bubble.appendChild(t);
    m.appendChild(bubble);
    return m;
  }
  function aiMsg(data) {
    const m = el('div', 'msg msg--ai' + (data.itinerary ? ' is-wide' : ''));
    m.appendChild(el('div', 'msg-avatar', '点'));
    const bubble = el('div', 'msg-bubble');
    bubble.appendChild(el('p', null, data.content));
    if (data.itinerary) {
      const itin = el('div', 'itin');
      data.itinerary.forEach((row) => {
        const r = el('div', 'itin-row');
        r.appendChild(el('div', 'itin-day', row.day));
        r.appendChild(el('p', 'itin-place', row.place));
        r.appendChild(el('div', 'itin-note', row.note));
        itin.appendChild(r);
      });
      bubble.appendChild(itin);
    }
    m.appendChild(bubble);
    return m;
  }
  function cardsGrid(ids) {
    const cols = ids.length === 1 ? ' cols-1' : ids.length === 2 ? ' cols-2' : '';
    const grid = el('div', 'chat-cards' + cols);
    const hCover = ids.length <= 2 ? 150 : 120;
    ids.forEach((id) => { if (noteById[id]) grid.appendChild(cardEl(noteById[id], hCover)); });
    return grid;
  }
  function reasonEl(text) {
    const r = el('div', 'card-reason');
    r.innerHTML = '<b>为什么是这条：</b>' + text;
    return r;
  }
  function followupsEl(items) {
    const wrap = el('div', 'followups');
    items.forEach((f) => wrap.appendChild(el('span', 'fu', f)));
    return wrap;
  }
  const scrollThread = () => { if (thread) thread.scrollTop = thread.scrollHeight; };

  async function playScene(key) {
    if (!thread) return;
    const token = ++playToken;
    const conv = conversations[key];
    thread.innerHTML = '';
    if (chatTitle) chatTitle.textContent = '点点 · ' + conv.title;

    for (const msg of conv.messages) {
      if (token !== playToken) return;
      if (msg.role === 'user') {
        await wait(400);
        if (token !== playToken) return;
        thread.appendChild(userMsg(msg.content));
        scrollThread();
        await wait(620);
      } else {
        const typing = typingMsg();
        thread.appendChild(typing);
        scrollThread();
        await wait(1050);
        if (token !== playToken) { typing.remove(); return; }
        typing.remove();
        thread.appendChild(aiMsg(msg));
        scrollThread();
        if (msg.notes) {
          await wait(360);
          if (token !== playToken) return;
          thread.appendChild(cardsGrid(msg.notes));
          if (msg.reason) thread.appendChild(reasonEl(msg.reason));
          scrollThread();
        }
        if (msg.followups) {
          await wait(320);
          if (token !== playToken) return;
          thread.appendChild(followupsEl(msg.followups));
          scrollThread();
        }
        await wait(480);
      }
    }
  }

  // 标签切换
  qa('[data-chat-tabs] .ctab').forEach((tab) => {
    tab.addEventListener('click', () => {
      qa('[data-chat-tabs] .ctab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      currentScene = tab.dataset.scene;
      playScene(currentScene);
    });
  });
  // 重播
  const replay = q('[data-chat-replay]');
  if (replay) replay.addEventListener('click', () => playScene(currentScene));

  // 进入视口后自动播放一次
  const chatWindow = q('[data-chat-window]');
  if (chatWindow) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          playScene(currentScene);
          cio.disconnect();
        }
      });
    }, { threshold: 0.3 });
    cio.observe(chatWindow);
  }

  /* ------------------------------------------------- 占位链接不跳转 */
  qa('a[data-replace]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
})();
