const SUPABASE_URL = 'https://iirzcvptqjnswimxoyds.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';

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
  data.forEach(({ name }) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    menuSelect.appendChild(option);
  });

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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=menu_name`, {
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
