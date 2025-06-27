// Supabaseの設定
const SUPABASE_URL = 'https://iirzcvptqjnswimxoyds.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcnpjdnB0cWpuc3dpbXhveWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDk3MzEsImV4cCI6MjA2NjU4NTczMX0.SBSW6h0lF4_YW0Rmnr1rDwTg1ApI-U2kCfkHJHZHy6E';

// DOMの取得
const voteForm = document.getElementById("vote-form");
const rankingList = document.getElementById("ranking-list");

// 投票送信
voteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const menu = document.getElementById("menu").value;
  const comment = document.getElementById("comment").value;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // ⚠ 文字コードの問題を防ぐためにUTF-8
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({
      menu_name: menu,
      comment: comment,
      created_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    alert("投票ありがとうございました！");
    voteForm.reset();
    loadRanking();
  } else {
    alert("投票に失敗しました。");
    console.error(await response.text());
  }
});

// ランキング表示
async function loadRanking() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    console.error("ランキング取得失敗", await response.text());
    return;
  }

  const data = await response.json();
  const counts = {};
  data.forEach(({ menu_name }) => {
    counts[menu_name] = (counts[menu_name] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  rankingList.innerHTML = "";

  sorted.forEach(([menu, count], index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}位：${menu}（${count}票）`;
    rankingList.appendChild(li);
  });
}

// 初期読み込み
loadRanking();
