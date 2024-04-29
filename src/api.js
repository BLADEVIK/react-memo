const API_URL = "https://wedev-api.sky.pro/api/v2/leaderboard";
export async function getLeaderBoard() {
  const response = await fetch(API_URL, {
    method: "GET",
  });
  if (response.status === 404) {
    alert("Данные лидеров не получены");
  } else {
    const date = await response.json();
    return date;
  }
}

export async function postLeaderBoard({ time, name, achievements }) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      time,
      name,
      achievements,
    }),
  });
  if (response.status === 400) {
    alert("Данные лидеров не добавленны");
  } else {
    const user = await response.json();
    return user;
  }
}
