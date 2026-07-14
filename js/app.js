(() => {
  "use strict";

  const data = window.DEMO_DATA;
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view");
  const view = ["father", "daughter"].includes(requestedView)
    ? requestedView
    : null;
  const viewConfig = view ? data.views[view] : null;
  const STORAGE_KEY = view
    ? `talkingPeekingDemoStateV10_${view}`
    : null;

  const defaultState = view
    ? {
        page: "home",
        mode: viewConfig.defaultMode,
        connectedIds: [...viewConfig.initialConnectedIds],
        selectedIds: [],
        profileTarget: null,
        editingAccount: false,
        editingContactNote: false,
        contactNotes: { ...viewConfig.defaultContactNotes },
        currentUser: structuredClone(data.users[viewConfig.currentUserId])
      }
    : null;

  if (view && params.get("reset") === "1") {
    localStorage.removeItem(STORAGE_KEY);
    params.delete("reset");
    const query = params.toString();
    history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
  }

  let state = view ? loadState() : null;

  const app = document.getElementById("app");
  const popoverRoot = document.getElementById("popover-root");
  const toast = document.getElementById("toast");

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) return structuredClone(defaultState);

      return {
        ...defaultState,
        ...stored,
        connectedIds: Array.isArray(stored.connectedIds)
          ? stored.connectedIds
          : [...defaultState.connectedIds],
        selectedIds: Array.isArray(stored.selectedIds)
          ? stored.selectedIds
          : [],
        contactNotes: {
          ...defaultState.contactNotes,
          ...(stored.contactNotes || {})
        },
        currentUser: {
          ...defaultState.currentUser,
          ...(stored.currentUser || {}),
          services: {
            ...defaultState.currentUser.services,
            ...((stored.currentUser && stored.currentUser.services) || {})
          }
        }
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function navigate(page, profileTarget = null) {
    state.page = page;
    state.profileTarget = profileTarget;
    state.editingAccount = false;
    state.editingContactNote = false;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function icon(name) {
    const icons = {
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>',
      people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6"/><path d="M14 15c3.7-.6 5.7 1.2 6.5 4.8"/></svg>',
      account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-5 3.2-7 7.5-7s6.8 2 7.5 7"/></svg>',
      plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
      share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M5 12v7h14v-7"/></svg>',
      back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 5-7 7 7 7"/></svg>'
    };

    return icons[name] || "";
  }

  function avatarClass(profile) {
    if (profile.id === "father") return "avatar-father";
    if (profile.id === "daughter") return "avatar-daughter";
    if (profile.isBackground) return "background-avatar";
    return "";
  }

  function renderAccountChooser() {
    const father = data.users.father;
    const daughter = data.users.daughter;

    app.innerHTML = `
      <main class="account-chooser">
        <div class="account-chooser-header">
          <p class="account-chooser-kicker">HCD PROTOTYPE</p>
          <h1>デモアカウントを選択</h1>
          <p>体験するユーザーを選んでください</p>
        </div>

        <div class="demo-account-list">
          ${renderDemoAccountCard(
            "father",
            father,
            "父親側を体験"
          )}
          ${renderDemoAccountCard(
            "daughter",
            daughter,
            "娘側を体験"
          )}
        </div>

        <p class="account-chooser-note">
          各アカウントの操作状態は個別に保存されます
        </p>
      </main>
    `;

    app.querySelectorAll("[data-demo-account]").forEach(button => {
      button.addEventListener("click", () => {
        enterDemoAccount(button.dataset.demoAccount);
      });
    });
  }

  function renderDemoAccountCard(accountId, profile, description) {
    return `
      <button
        class="demo-account-card"
        data-demo-account="${accountId}"
      >
        <span class="demo-account-avatar ${avatarClass(profile)}">
          ${escapeHtml(profile.avatarText)}
        </span>

        <span class="demo-account-copy">
          <strong>${escapeHtml(profile.note)}</strong>
          <span>@${escapeHtml(profile.username)}</span>
          <small>${description}</small>
        </span>

        <span class="demo-account-arrow">›</span>
      </button>
    `;
  }

  function enterDemoAccount(accountId) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("view", accountId);
    window.location.href = url.toString();
  }

  function renderBottomNav(active) {
    return `
      <nav class="bottom-nav" aria-label="メインナビゲーション">
        ${navButton("home", "ホーム", active)}
        ${navButton("connections", "つながり", active)}
        ${navButton("account", "アカウント", active)}
      </nav>
    `;
  }

  function navButton(page, label, active) {
    const iconName = page === "connections" ? "people" : page;

    return `
      <button class="nav-button ${active === page ? "active" : ""}" data-nav="${page}">
        <span class="nav-icon">${icon(iconName)}</span>
        <span class="nav-label">${label}</span>
      </button>
    `;
  }

  function getUserProfile(userId) {
    if (userId === viewConfig.currentUserId) {
      return structuredClone(state.currentUser);
    }

    const profile = structuredClone(data.users[userId]);
    profile.note = state.contactNotes[userId] || profile.note;
    return profile;
  }

  function availableContacts() {
    return state.connectedIds
      .map(getUserProfile)
      .filter(contact => contact.shareLevel === state.mode);
  }

  function renderHome() {
    const contacts = availableContacts();
    const visibleIds = new Set(contacts.map(contact => contact.id));
    const selectedVisibleIds = state.selectedIds.filter(id => visibleIds.has(id));

    let content;

    if (contacts.length === 0) {
      content = `
        <div class="empty-state">
          <p>先に他のユーザーの共有を受信してください</p>
        </div>
      `;
    } else if (selectedVisibleIds.length === 0) {
      content = `
        <div class="empty-state">
          <p>おすすめを見る相手を選択してください</p>
        </div>
      `;
    } else {
      const selectedProfiles = selectedVisibleIds.map(getUserProfile);
      const realSelected = selectedProfiles.filter(profile => !profile.isBackground);
      const backgroundSelected = selectedProfiles.filter(profile => profile.isBackground);
      const recommendationItems = buildRecommendationItems(
        realSelected.length > 0,
        backgroundSelected
      );

      content = `
        <div class="recommendation-list">
          ${recommendationItems.map(renderRecommendation).join("")}
        </div>
      `;
    }

    app.innerHTML = `
      <header class="home-header">
        <button
          class="mode-button ${state.mode}"
          id="mode-button"
          aria-label="共有レベルを切り替える"
        >
          ${state.mode === "weak" ? "弱" : "強"}
        </button>

        <div class="contact-strip" aria-label="共有ユーザー">
          ${contacts.map(contact => `
            <button
              class="contact-chip ${contact.isBackground ? "background-contact" : ""} ${state.selectedIds.includes(contact.id) ? `selected mode-${state.mode}` : ""}"
              data-contact="${contact.id}"
            >
              <span class="contact-avatar ${avatarClass(contact)}">${escapeHtml(contact.avatarText)}</span>
              <span class="contact-name">${escapeHtml(contact.note)}</span>
            </button>
          `).join("")}
        </div>
      </header>

      <main class="home-content">
        ${content}
      </main>

      ${renderBottomNav("home")}
    `;

    bindNavigation();

    document
      .getElementById("mode-button")
      .addEventListener("click", toggleMode);

    app.querySelectorAll("[data-contact]").forEach(button => {
      button.addEventListener("click", () => {
        toggleContact(button.dataset.contact);
      });
    });
  }

  function buildRecommendationItems(hasRealContact, backgroundContacts) {
    const items = hasRealContact
      ? viewConfig.recommendations.map(item => ({ ...item }))
      : [];

    const backgroundItems = backgroundContacts.map((contact, index) => ({
      kind: "background",
      type: "背景",
      title: `背景コンテンツ ${contact.avatarText}`,
      source: "背景データ"
    }));

    const seedText = [
      view,
      state.mode,
      ...state.selectedIds.slice().sort()
    ].join("|");

    const random = createSeededRandom(hashString(seedText));

    backgroundItems.forEach(item => {
      const position = Math.floor(random() * (items.length + 1));
      items.splice(position, 0, item);
    });

    return items;
  }

  function hashString(text) {
    let hash = 2166136261;

    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function createSeededRandom(seed) {
    let value = seed || 1;

    return function random() {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function renderRecommendation(item, index) {
    return `
      <article class="recommendation-card ${item.kind === "background" ? "background-recommendation" : ""}" aria-label="${escapeHtml(item.title)}">
        <div class="card-thumbnail" style="${thumbnailStyle(index, item.kind)}">
          <span class="card-kicker">${escapeHtml(item.type)}</span>
        </div>
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(item.title)}</h2>
          <p class="card-meta">${escapeHtml(item.source)}</p>
        </div>
      </article>
    `;
  }

  function thumbnailStyle(index, kind) {
    if (kind === "background") {
      return "background: linear-gradient(135deg,#d9dce1,#bfc4cb);";
    }

    const targetBackgrounds = [
      "background: linear-gradient(135deg,#c9dcf5,#f3d5e0);",
      "background: linear-gradient(135deg,#ead7f1,#d3e8f0);",
      "background: linear-gradient(135deg,#d7e4f4,#e9d6e3);"
    ];

    const bridgeBackgrounds = [
      "background: linear-gradient(135deg,#d7eadf,#f6e5c8);",
      "background: linear-gradient(135deg,#f3d4c5,#e8e0f6);",
      "background: linear-gradient(135deg,#d7e4f4,#d8eadc);"
    ];

    const backgrounds = kind === "bridge"
      ? bridgeBackgrounds
      : targetBackgrounds;

    return backgrounds[index % backgrounds.length];
  }

  function toggleMode() {
    const button = document.getElementById("mode-button");
    button.classList.add("flipping");

    setTimeout(() => {
      state.mode = state.mode === "weak" ? "strong" : "weak";
      state.selectedIds = [];
      saveState();
      renderHome();
    }, 170);
  }

  function toggleContact(id) {
    const selected = new Set(state.selectedIds);

    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }

    state.selectedIds = [...selected];
    saveState();
    renderHome();
  }

  function renderConnections() {
    const list = state.connectedIds.length > 0
      ? state.connectedIds.map(userId => {
          const contact = getUserProfile(userId);
          const levelText = contact.shareLevel === "weak" ? "弱" : "強";

          return `
            <button class="connection-row ${contact.isBackground ? "background-row" : ""}" data-profile="${contact.id}">
              <span class="list-avatar ${avatarClass(contact)}">${escapeHtml(contact.avatarText)}</span>
              <span class="share-level-dot ${contact.shareLevel}">${levelText}</span>
              <span class="connection-name">${escapeHtml(contact.note)}</span>
              <span class="chevron">›</span>
            </button>
          `;
        }).join("")
      : `
        <div class="connections-empty">
          <p>左上の＋から共有を受信できます</p>
        </div>
      `;

    app.innerHTML = `
      <header class="page-topbar">
        <button class="icon-button" id="receive-button" aria-label="共有を受信">
          ${icon("plus")}
        </button>
        <h1 class="page-title">つながり</h1>
        <button class="icon-button" id="share-button" aria-label="自分の情報を共有">
          ${icon("share")}
        </button>
      </header>

      <main class="connections-content">
        ${list}
      </main>

      ${renderBottomNav("connections")}
    `;

    bindNavigation();

    document
      .getElementById("receive-button")
      .addEventListener("click", event => {
        openReceivePopover(event.currentTarget);
      });

    document
      .getElementById("share-button")
      .addEventListener("click", event => {
        openSharePopover(event.currentTarget);
      });

    app.querySelectorAll("[data-profile]").forEach(button => {
      button.addEventListener("click", () => {
        navigate("profile", button.dataset.profile);
      });
    });
  }

  function renderProfile(targetId) {
    const isSelf = targetId === "self";
    const actualId = isSelf ? viewConfig.currentUserId : targetId;
    const profile = getUserProfile(actualId);
    const backAction = isSelf ? null : "connections";
    const editing = isSelf
      ? state.editingAccount
      : state.editingContactNote;

    app.innerHTML = `
      <header class="page-topbar">
        ${backAction
          ? `<button class="icon-button" id="back-button" aria-label="戻る">${icon("back")}</button>`
          : `<span></span>`}

        <h1 class="page-title">プロフィール</h1>

        <button class="text-button" id="edit-button">
          ${editing ? "保存" : "編集"}
        </button>
      </header>

      <main class="profile-page">
        ${renderProfileView(
          profile,
          isSelf,
          isSelf && state.editingAccount,
          !isSelf && state.editingContactNote
        )}

        ${isSelf && !state.editingAccount ? `
          <section class="logout-section">
            <button class="logout-button" id="logout-button">
              ログアウト
            </button>
          </section>
        ` : ""}
      </main>

      ${renderBottomNav(isSelf ? "account" : "connections")}
    `;

    bindNavigation();

    if (backAction) {
      document
        .getElementById("back-button")
        .addEventListener("click", () => navigate(backAction));
    }

    document
      .getElementById("edit-button")
      .addEventListener("click", () => {
        if (isSelf) {
          if (state.editingAccount) {
            saveAccountForm();
          } else {
            state.editingAccount = true;
            renderProfile("self");
          }
          return;
        }

        if (state.editingContactNote) {
          saveContactNote(actualId);
        } else {
          state.editingContactNote = true;
          renderProfile(actualId);
        }
      });

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", openLogoutConfirm);
    }
  }

  function renderProfileView(
    profile,
    isSelf = false,
    editingSelf = false,
    editingContact = false
  ) {
    const profileContent = `
      <section class="profile-hero">
        <div class="profile-avatar ${avatarClass(profile)}">${escapeHtml(profile.avatarText)}</div>

        ${editingSelf ? `
          <input
            class="inline-edit-input profile-name-input"
            name="note"
            value="${escapeAttr(profile.note)}"
            aria-label="表示名"
          >

          <div class="profile-username-editor">
            <span>@</span>
            <input
              class="inline-edit-input profile-username-input"
              name="username"
              value="${escapeAttr(profile.username)}"
              aria-label="ユーザー名"
            >
          </div>
        ` : editingContact ? `
          <input
            class="inline-edit-input profile-name-input"
            name="contactNote"
            value="${escapeAttr(profile.note)}"
            aria-label="このユーザーのニックネーム"
          >
          <p class="profile-username">@${escapeHtml(profile.username)}</p>
        ` : `
          <h2 class="profile-note">${escapeHtml(profile.note)}</h2>
          <p class="profile-username">@${escapeHtml(profile.username)}</p>
        `}
      </section>

      ${isSelf ? "" : `
        <section class="profile-section">
          <h3 class="section-title">共有レベル</h3>
          <span class="level-badge ${profile.shareLevel}">
            ${profile.shareLevel === "weak" ? "弱共有" : "強共有"}
          </span>
        </section>
      `}

      <section class="profile-section">
        <h3 class="section-title">基本情報</h3>

        <dl class="info-grid">
          <dt>年齢</dt>
          <dd>
            ${editingSelf ? `
              <input
                class="inline-edit-input"
                name="age"
                type="number"
                min="1"
                max="120"
                value="${escapeAttr(String(profile.age))}"
                aria-label="年齢"
              >
            ` : `${escapeHtml(String(profile.age))}歳`}
          </dd>

          <dt>性別</dt>
          <dd>
            ${editingSelf ? `
              <select
                class="inline-edit-select"
                name="gender"
                aria-label="性別"
              >
                ${["男性", "女性", "その他", "回答しない"].map(value => `
                  <option ${profile.gender === value ? "selected" : ""}>
                    ${value}
                  </option>
                `).join("")}
              </select>
            ` : escapeHtml(profile.gender)}
          </dd>

          <dt>興味</dt>
          <dd>
            ${editingSelf ? `
              <div class="interest-inline-editor">
                <input
                  class="inline-edit-input"
                  name="interests"
                  value="${escapeAttr(profile.interests.join(", "))}"
                  aria-label="興味タグ"
                >
                <span class="inline-edit-hint">
                  タグは「,」で区切って入力します
                </span>
              </div>
            ` : `
              <div class="tag-list">
                ${profile.interests.map(item => `
                  <span class="tag">${escapeHtml(item)}</span>
                `).join("")}
              </div>
            `}
          </dd>
        </dl>
      </section>

      <section class="profile-section">
        <h3 class="section-title">共有中のサービス</h3>
        <div class="service-list">
          ${renderServices(profile.services)}
        </div>
      </section>
    `;

    if (editingSelf) {
      return `
        <form class="profile-inline-form" id="account-form">
          ${profileContent}
        </form>
      `;
    }

    if (editingContact) {
      return `
        <form class="profile-inline-form" id="contact-note-form">
          ${profileContent}
        </form>
      `;
    }

    return profileContent;
  }

  function saveContactNote(userId) {
    const form = document.getElementById("contact-note-form");
    if (!form) return;

    const formData = new FormData(form);
    const note = String(formData.get("contactNote") || "").trim();

    state.contactNotes[userId] = note || data.users[userId].note;
    state.editingContactNote = false;
    saveState();
    showToast("ニックネームを保存しました");
    renderProfile(userId);
  }

  function saveAccountForm() {
    const form = document.getElementById("account-form");
    if (!form) return;

    const formData = new FormData(form);
    const interests = String(formData.get("interests") || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    state.currentUser = {
      ...state.currentUser,
      note:
        String(formData.get("note") || "").trim() ||
        state.currentUser.note,
      username:
        String(formData.get("username") || "")
          .trim()
          .replace(/^@/, "") ||
        state.currentUser.username,
      age:
        Math.max(1, Number(formData.get("age"))) ||
        state.currentUser.age,
      gender:
        String(formData.get("gender") || state.currentUser.gender),
      interests:
        interests.length > 0
          ? interests
          : state.currentUser.interests
    };

    state.editingAccount = false;
    saveState();
    showToast("プロフィールを保存しました");
    renderProfile("self");
  }

  function renderServices(services) {
    const styles = {
      YouTube: "#e04b4b",
      TikTok: "#252a33",
      X: "#3b4048",
      Spotify: "#3cab6f",
      Netflix: "#bd3341",
      Instagram: "#b45fa5"
    };

    const labels = {
      YouTube: "YT",
      TikTok: "TT",
      X: "X",
      Spotify: "SP",
      Netflix: "NF",
      Instagram: "IG"
    };

    return Object.entries(services).map(([name, active]) => `
      <div class="service-icon">
        <div
          class="service-mark ${active ? "" : "inactive"}"
          style="background:${styles[name]}"
        >
          ${labels[name]}
        </div>
        <div class="service-name">${name}</div>
      </div>
    `).join("");
  }

  function bindNavigation() {
    app.querySelectorAll("[data-nav]").forEach(button => {
      button.addEventListener("click", () => {
        const page = button.dataset.nav;

        if (page === "account") {
          state.page = "profile";
          state.profileTarget = "self";
          state.editingAccount = false;
          state.editingContactNote = false;
          saveState();
          renderProfile("self");
        } else {
          navigate(page);
        }
      });
    });
  }

  function openLogoutConfirm() {
    popoverRoot.innerHTML = `
      <div class="confirm-layer" id="confirm-layer">
        <section
          class="confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <h2 id="logout-title">ログアウトしますか？</h2>
          <p>
            デモの操作状態は初期状態に戻ります。
          </p>

          <div class="confirm-actions">
            <button class="confirm-cancel" id="logout-cancel">
              キャンセル
            </button>
            <button class="confirm-danger" id="logout-confirm">
              ログアウト
            </button>
          </div>
        </section>
      </div>
    `;

    document
      .getElementById("logout-cancel")
      .addEventListener("click", closePopover);

    document
      .getElementById("logout-confirm")
      .addEventListener("click", logoutAndReset);

    document
      .getElementById("confirm-layer")
      .addEventListener("click", event => {
        if (event.target.id === "confirm-layer") {
          closePopover();
        }
      });
  }

  function logoutAndReset() {
    localStorage.removeItem(STORAGE_KEY);

    const url = new URL(window.location.href);
    url.search = "";
    window.location.href = url.toString();
  }

  let activePopoverAnchor = null;
  let activePopoverAlign = "left";

  function openReceivePopover(anchor) {
    activePopoverAnchor = anchor;
    activePopoverAlign = "left";

    openPopover(anchor, `
      <div class="popover-header">
        <h2 class="popover-title">共有を受信</h2>
      </div>
      <div class="popover-body">
        <button class="popover-option" data-receive="username">
          ユーザー名を入力
        </button>
        <button class="popover-option" data-receive="qr">
          QRコードを読み取る
        </button>
      </div>
    `, "left");

    popoverRoot.querySelectorAll("[data-receive]").forEach(button => {
      button.addEventListener("click", () => {
        if (button.dataset.receive === "username") {
          openUsernameEntry(anchor);
        } else {
          simulateQrReceive(anchor);
        }
      });
    });
  }

  function openUsernameEntry(anchor) {
    const candidate = viewConfig.receiveCandidateId
      ? data.users[viewConfig.receiveCandidateId]
      : null;

    openPopover(anchor, `
      <div class="popover-header">
        <h2 class="popover-title">ユーザー名を入力</h2>
      </div>
      <div class="popover-body">
        <div class="code-box">
          <input
            class="code-input"
            id="share-username"
            value="${candidate ? `@${escapeAttr(candidate.username)}` : ""}"
            placeholder="@username"
            aria-label="ユーザー名"
          >
          <button class="primary-button" id="receive-user-button">
            受信する
          </button>
        </div>
      </div>
    `, "left");

    document
      .getElementById("receive-user-button")
      .addEventListener("click", connectPresetContact);
  }

  function simulateQrReceive(anchor) {
    openPopover(anchor, `
      <div class="popover-header">
        <h2 class="popover-title">QRコードを読み取り中</h2>
      </div>
      <div class="popover-body">
        <div class="qr-placeholder">
          ${Array.from({ length: 49 }, (_, index) => `
            <span style="opacity:${(index * 7) % 5 === 0 ? .15 : 1}"></span>
          `).join("")}
        </div>
      </div>
    `, "left");

    setTimeout(connectPresetContact, 700);
  }

  function connectPresetContact() {
    const userId = viewConfig.receiveCandidateId;

    if (!userId || state.connectedIds.includes(userId)) {
      closePopover();
      showToast("新しい共有はありません");
      return;
    }

    state.connectedIds.push(userId);
    state.contactNotes[userId] =
      state.contactNotes[userId] || data.users[userId].note;
    state.mode = data.users[userId].shareLevel;
    state.selectedIds = [];

    saveState();
    closePopover();

    showToast(
      `${state.contactNotes[userId]}の${
        data.users[userId].shareLevel === "weak" ? "弱共有" : "強共有"
      }を受信しました`
    );

    renderConnections();
  }

  function openSharePopover(anchor) {
    activePopoverAnchor = anchor;
    activePopoverAlign = "right";

    openPopover(anchor, `
      <div class="popover-header">
        <h2 class="popover-title">自分の情報を共有</h2>
      </div>
      <div class="popover-body">
        <button class="popover-option" data-share-view="qr">
          自分のQRコード
        </button>
        <button class="popover-option" data-share-view="username">
          自分のユーザー名
        </button>
        <button class="popover-option" data-share-view="link">
          自分の共有リンク
        </button>
      </div>
    `, "right");

    popoverRoot.querySelectorAll("[data-share-view]").forEach(button => {
      button.addEventListener("click", () => {
        showShareValue(button.dataset.shareView, anchor);
      });
    });
  }

  function showShareValue(type, anchor) {
    const views = {
      qr: `
        <div class="qr-placeholder">
          ${Array.from({ length: 49 }, (_, index) => `
            <span style="opacity:${(index * 11) % 6 === 0 ? .12 : 1}"></span>
          `).join("")}
        </div>
        <div class="share-value">
          このQRコードを相手に見せてください
        </div>
      `,
      username: `
        <div class="share-value">
          ユーザー名：@${escapeHtml(state.currentUser.username)}
        </div>
      `,
      link: `
        <div class="share-value">
          https://example.local/u/${escapeHtml(state.currentUser.username)}
        </div>
      `
    };

    openPopover(anchor, `
      <div class="popover-header">
        <h2 class="popover-title">自分の情報を共有</h2>
      </div>
      <div class="popover-body">
        <div class="share-box">
          ${views[type]}
          <button class="primary-button" id="copy-button">
            コピー
          </button>
        </div>
      </div>
    `, "right");

    document
      .getElementById("copy-button")
      .addEventListener("click", async () => {
        const text = type === "username"
          ? `@${state.currentUser.username}`
          : type === "link"
            ? `https://example.local/u/${state.currentUser.username}`
            : "QRコード";

        try {
          await navigator.clipboard.writeText(text);
          showToast("コピーしました");
        } catch {
          showToast("コピーしたことを模擬しました");
        }
      });
  }

  function openPopover(anchor, content, align = "left") {
    activePopoverAnchor = anchor;
    activePopoverAlign = align;

    popoverRoot.innerHTML = `
      <div class="popover-layer" id="popover-layer">
        <section
          class="popover arrow-${align}"
          id="active-popover"
          role="dialog"
        >
          ${content}
        </section>
      </div>
    `;

    positionPopover(anchor, align);

    const layer = document.getElementById("popover-layer");
    layer.addEventListener("click", event => {
      if (event.target === layer) closePopover();
    });

    window.addEventListener(
      "resize",
      repositionActivePopover,
      { once: true }
    );
  }

  function positionPopover(anchor, align) {
    const popover = document.getElementById("active-popover");
    if (!popover || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = popover.offsetWidth;
    const viewportPadding = 12;

    let left = align === "right"
      ? rect.right - width
      : rect.left;

    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - width - viewportPadding)
    );

    popover.style.left = `${left}px`;
    popover.style.top = `${rect.bottom + 8}px`;
  }

  function repositionActivePopover() {
    if (activePopoverAnchor) {
      positionPopover(activePopoverAnchor, activePopoverAlign);
    }
  }

  function closePopover() {
    popoverRoot.innerHTML = "";
    activePopoverAnchor = null;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1800);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function render() {
    if (!view) {
      renderAccountChooser();
      return;
    }

    if (state.page === "connections") {
      renderConnections();
    } else if (state.page === "profile") {
      renderProfile(state.profileTarget || "self");
    } else {
      renderHome();
    }
  }

  render();
})();
