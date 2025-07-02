// 新しい Supabase URL と API キー
const SUPABASE_URL = 'https://labmhtrafdslfwqmzgky.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhYm1odHJhZmRzbGZ3cW16Z2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTAzNzksImV4cCI6MjA2NTI2NjM3OX0.CviQ3lzngfvqDFwEtDw5cTRSEICWliunXngYCokhbNs';

// 日付パラメータのチェックと自動更新
(function() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const params = new URLSearchParams(window.location.search);
  if (params.get('date') !== today) {
    // URL に今日の日付をセットしてリダイレクト
    const newUrl = `${window.location.origin}${window.location.pathname}?date=${today}`;
    window.location.replace(newUrl);
  }
})();

const voteForm = document.getElementById("vote-form");
const rankingList = document.getElementById("ranking-list");
const menuSelect = document.getElementById("menu");

// 今日の日付をキーに
const dateKey = new URLSearchParams(window.location.search).get('date');
let hasSubmitted = !!localStorage.getItem(`voted_${dateKey}`); // 既に投票済みか

document.addEventListener("DOMContentLoaded", async () => {
  await loadMenus();
  loadRanking();

  if (hasSubmitted) {
    alert("本日の投票はすでに完了しています。");
  }
});

async function loadMenus() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/menus?select=name`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  data.forEach(({ name }) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    menuSelect.appendChild(option);
  });
  if (menuSelect.tomselect) menuSelect.tomselect.destroy();
  new TomSelect(menuSelect, {
    create: false,
    sortField: "text",
    placeholder: "メニューを検索または選択"
  });
}

voteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (hasSubmitted) {
    alert("本日の投票はすでに完了しています。");
    return;
  }

  const menu = menuSelect.value;
  const comment = document.getElementById("comment").value;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({
      menu_name: menu,
      comment: comment,
      created_at: new Date().toISOString()
    })
  });

  if (res.ok) {
    hasSubmitted = true;
    // ローカルに投票済みフラグをセット（24時間リセット不要）
    localStorage.setItem(`voted_${dateKey}`, 'true');
    alert("投票ありがとうございました！");
    voteForm.reset();
    loadRanking();
  } else {
    alert("投票に失敗しました。");
  }
});

async function loadRanking() {
  // 今月の集計はそのまま
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const firstDay = `${year}-${month}-01T00:00:00Z`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name,created_at&created_at=gte.${firstDay}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();
  const counts = {};
  data.forEach(({ menu_name }) => {
    counts[menu_name] = (counts[menu_name] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  rankingList.innerHTML = "";
  sorted.forEach(([menu, count], i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}位：${menu}（${count}票）`;
    rankingList.appendChild(li);
  });
}
