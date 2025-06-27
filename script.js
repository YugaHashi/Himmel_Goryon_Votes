const SUPABASE_URL = "https://iirzcvptqjnswimxoyds.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（略）"; // anonキー

async function vote(menu_name, comment) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
    method: "POST",
    headers: {
  "Content-Type": "application/json", // 必須
  "apikey": "あなたのSupabaseのanonキー",
  "Authorization": "Bearer あなたのSupabaseのanonキー"
},
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify([
      {
        menu_name: menu_name,
        comment: comment
      }
    ])
  });

  if (!res.ok) throw new Error("エラーが発生しました");

  return await res.json();
}

async function loadRanking() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();

  const counts = {};
  data.forEach((vote) => {
    counts[vote.menu_name] = (counts[vote.menu_name] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const rankingDiv = document.getElementById("ranking");
  if (sorted.length === 0) {
    rankingDiv.textContent = "まだ投票がありません。";
  } else {
    rankingDiv.innerHTML = sorted
      .map(([menu, count], i) => `${i + 1}. ${menu} - ${count}票`)
      .join("<br>");
  }
}

document.getElementById("voteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const menu = document.getElementById("menuSelect").value;
  const comment = document.getElementById("comment").value;

  const resultDiv = document.getElementById("resultMessage");
  try {
    await vote(menu, comment);
    resultDiv.textContent = "✅ 投票が完了しました！";
    await loadRanking();
  } catch (err) {
    resultDiv.textContent = "❌ エラーが発生しました。もう一度お試しください。";
  }
});

loadRanking();
