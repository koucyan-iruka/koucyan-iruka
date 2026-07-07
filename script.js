/* ==========================================================
       🔧 CONFIG — Vercel API が完成したらここを書き換えるだけ！
       ========================================================== */
    const CONFIG = {
      /*
       * ✏️ ここに Vercel のエンドポイント URL を入れてください
       * 例: "https://your-app.vercel.app/api/photos"
       *
       * API が返す JSON の形式（想定）:
       * [
       *   {
       *     "url":  "https://lh3.googleusercontent.com/...",
       *     "alt":  "Arduino で作った温度センサー",
       *     "title": "温度センサープロジェクト"   ← 省略可（alt が使われます）
       *   },
       *   ...
       * ]
       */
      API_URL: "",   // ← ★ ここに URL を入れる

      CARD_COUNT: 5,        // 表示するカード数（1枚目が横長のフィーチャー）
      CACHE_MINUTES: 10,    // APIレスポンスをキャッシュする分数
    };


    /* ==========================================================
       Theme toggle
       ========================================================== */
    const html    = document.documentElement;
    const themeBtn = document.getElementById('themeBtn');

    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'light');
    }

    themeBtn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeBtn.style.transform = 'scale(0.75) rotate(30deg)';
      setTimeout(() => themeBtn.style.transform = '', 260);
    });


    /* ==========================================================
       Scroll reveal
       ========================================================== */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.10 });

    function observeReveals() {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    }
    observeReveals();

    // Hero は即時表示
    document.querySelectorAll('#hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 180 + i * 90);
    });


    /* ==========================================================
       Card tilt
       ========================================================== */
    function attachTilt() {
      document.querySelectorAll('.proj-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width  - 0.5;
          const y = (e.clientY - r.top)  / r.height - 0.5;
          card.style.transform =
            `translateY(-5px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) scale(1.01)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = '');
      });
    }


    /* ==========================================================
       Projects — Google Photos via Vercel API
       ========================================================== */
    const projGrid     = document.getElementById('projGrid');
    const projFallback = document.getElementById('projFallback');
    const refreshBtn   = document.getElementById('refreshBtn');

    let allPhotos = [];  // APIから取得した全写真データ

    // ── スケルトンローダーを表示 ──
    function showSkeletons(count) {
      projGrid.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const isWide = i === 0;
        const card = document.createElement('div');
        card.className = `proj-card glass ${isWide ? 'wide' : ''} reveal ${i > 0 ? 'd' + Math.min(i, 4) : ''}`;
        card.innerHTML = `
          ${isWide ? '<div>' : ''}
            <div class="skeleton-img skeleton"></div>
            <div class="skeleton-line w60 skeleton"></div>
            <div class="skeleton-line w80 skeleton"></div>
            <div class="skeleton-line w40 skeleton"></div>
          ${isWide ? '</div><div class="skeleton-img skeleton" style="aspect-ratio:4/3;margin:0;"></div>' : ''}
        `;
        projGrid.appendChild(card);
      }
      observeReveals();
    }

    // ── カードHTMLを生成 ──
    function createCard(photo, index) {
      const isWide = index === 0;
      const title = photo.title || photo.filename || 'Project';
      const desc  = photo.alt || photo.description || '';

      const card = document.createElement('div');
      card.className = `proj-card glass ${isWide ? 'wide' : ''} reveal ${index > 0 ? 'd' + Math.min(index, 4) : ''}`;

      if (isWide) {
        card.innerHTML = `
          <div>
            <h3 class="pj-title">${escapeHTML(title)}</h3>
            <p class="pj-desc">${escapeHTML(desc)}</p>
          </div>
          <div class="pj-img-wrap">
            <img src="${escapeHTML(photo.url)}" alt="${escapeHTML(desc)}" loading="lazy" />
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="pj-img-wrap">
            <img src="${escapeHTML(photo.url)}" alt="${escapeHTML(desc)}" loading="lazy" />
          </div>
          <h3 class="pj-title">${escapeHTML(title)}</h3>
          <p class="pj-desc">${escapeHTML(desc)}</p>
        `;
      }
      return card;
    }

    // ── ランダムに n 枚選択 ──
    function pickRandom(arr, n) {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n);
    }

    // ── カードを描画 ──
    function renderCards(photos) {
      projGrid.innerHTML = '';
      const selected = pickRandom(photos, CONFIG.CARD_COUNT);

      selected.forEach((photo, i) => {
        projGrid.appendChild(createCard(photo, i));
      });

      // アニメーション・ティルト再登録
      observeReveals();
      attachTilt();
    }

    // ── API からデータ取得（キャッシュ付き） ──
    async function fetchPhotos() {
      // キャッシュ確認
      const cacheKey  = 'photos_cache';
      const cacheTime = 'photos_cache_time';
      const cached    = localStorage.getItem(cacheKey);
      const cachedAt  = localStorage.getItem(cacheTime);

      if (cached && cachedAt) {
        const age = (Date.now() - Number(cachedAt)) / 1000 / 60;
        if (age < CONFIG.CACHE_MINUTES) {
          return JSON.parse(cached);
        }
      }

      // API 呼び出し
      const res = await fetch(CONFIG.API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      // キャッシュ保存
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTime, String(Date.now()));

      return data;
    }

    // ── メイン処理 ──
    async function loadProjects() {
      // API URL 未設定 → フォールバック表示
      if (!CONFIG.API_URL) {
        projGrid.style.display = 'none';
        projFallback.style.display = '';
        return;
      }

      projGrid.style.display = '';
      projFallback.style.display = 'none';
      showSkeletons(CONFIG.CARD_COUNT);

      try {
        allPhotos = await fetchPhotos();

        if (!allPhotos || allPhotos.length === 0) {
          throw new Error('写真が見つかりませんでした');
        }

        renderCards(allPhotos);
      } catch (err) {
        console.error('Projects load error:', err);
        projGrid.innerHTML = '';
        projGrid.style.display = 'none';
        projFallback.querySelector('.fallback-title').textContent = '読み込みエラー';
        projFallback.querySelector('.fallback-sub').innerHTML =
          `API との通信に失敗しました。<br><small style="color:var(--text-dim)">${escapeHTML(err.message)}</small>`;
        projFallback.style.display = '';
      }
    }

    // ── シャッフルボタン ──
    refreshBtn.addEventListener('click', () => {
      if (allPhotos.length === 0) {
        loadProjects();
        return;
      }
      refreshBtn.classList.add('spinning');
      setTimeout(() => refreshBtn.classList.remove('spinning'), 450);
      renderCards(allPhotos);
    });

    // ── ユーティリティ ──
    function escapeHTML(str) {
      if (!str) return '';
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
                .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── 初期化 ──
    loadProjects();