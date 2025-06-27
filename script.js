const SUPABASE_URL = "https://あなたのURL.supabase.co";
const SUPABASE_KEY = "public-anon-key"; // supabaseから取得
const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

const menus = [
  "焼き鳥", "おでん", "唐揚げ", "ポテトサラダ", "だし巻き卵", "馬刺し", "冷奴", "もつ煮", "餃子", "枝豆"
];

// ▼ 1. 検索＆選択用
const menuSelect = document.getElementById("menu-select");
const searchInput = document.getElementById("menu-search");

function populateMenus(filter = "") {
  menuSelect.innerHTML = "";
  menus
    .filter(menu => menu.includes(filter))
    .forEach(menu => {
      const option = document.createElement("option");
      option.value = menu;
      option.textContent = menu;
      menuSelect.appendChild(option);
    });
}

searchInput.addEventListener("input", () => {
  populateMenus(searchInput.value);
});
populateMenus();

// ▼ 2. ランキング表示
async function loadRanking() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name`, {
    headers
  });
  const votes = await res.json();
  const counts = {};
  votes.forEach(v => {
    counts[v.menu_name] = (counts[v.menu_name] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const rankingEl = document.getElementById("ranking");
  rankingEl.innerHTML = "";
  sorted.forEach(([name, count], i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}位：${name}（${count}票）`;
    rankingEl.appendChild(li);
  });
}
loadRanking();

// ▼ 3. 投票処理（localStorageで1回制限）
document.getElementById("vote-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (localStorage.getItem("hasVoted")) {
    document.getElementById("message").textContent = "すでに投票済みです。";
    return;
  }

  const menu = menuSelect.value;
  const comment = document.getElementById("comment").value;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ menu_name: menu, comment }),
  });

  if (res.ok) {
    localStorage.setItem("hasVoted", "true");
    document.getElementById("message").textContent = "投票が完了しました！";
    loadRanking();
  } else {
    document.getElementById("message").textContent = "投票に失敗しました。";
  }
});
