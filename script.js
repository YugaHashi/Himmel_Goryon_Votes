const SUPABASE_URL = 'https://iirzcvptqjnswimxoyds.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnpjdnB0cWpuc3dpbXhveWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDk3MzEsImV4cCI6MjA2NjU4NTczMX0.SBSW6h0lF4_YW0Rmnr1rDwTg1ApI-U2kCfkHJHZHy6E'; // ← Supabaseのanonキーに置き換えてください

const voteForm = document.getElementById("vote-form");
const rankingList = document.getElementById("ranking-list");
const menuSelect = document.getElementById("menu");

document.addEventListener("DOMContentLoaded", async () => {
  await loadMenus();
  loadRanking();
});

async function loadMenus() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/menus?select=name`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();

  // メニューの option を追加
  data.forEach(({ name }) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    menuSelect.appendChild(option);
  });

  // TomSelectを初期化（既に初期化済みなら破棄）
  if (menuSelect.tomselect) {
    menuSelect.tomselect.destroy();
  }

  new TomSelect(menuSelect, {
    create: false,
    sortField: "text",
    placeholder: "メニューを検索または選択"
  });
}

voteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (localStorage.getItem("hasVoted")) {
    alert("既に投票済みです。");
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
    localStorage.setItem("hasVoted", "true");
    alert("投票ありがとうございました！");
    voteForm.reset();
    loadRanking();
  } else {
    alert("投票に失敗しました");
  }
});

async function loadRanking() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月を2桁で取得
  const firstDay = `${year}-${month}-01T00:00:00Z`;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name&created_at=gte.${firstDay}`, {
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

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  rankingList.innerHTML = "";

  sorted.forEach(([menu, count], i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}位：${menu}（${count}票）`;
    rankingList.appendChild(li);
  });
}
