import constants from "../globals/constants";

export function checkIfGameOver(currentNodeKey) {
  return (
    currentNodeKey === constants.FAIL_KEY ||
    currentNodeKey === constants.END_KEY
  );
}

export function checkIfGameEnded(currentNodeKey) {
  if (currentNodeKey === constants.END_KEY) {
    if (localStorage.getItem("LEADERBOARDDATA")) {
      JSON.parse(localStorage.getItem("LEADERBOARDDATA")).push({
        name: localStorage.getItem("LOGINDATA"),
        Score: localStorage.getItem("start_second"),
      });
    } else {
      localStorage.setItem(
        "LEADERBOARDDATA",
        JSON.stringify([
          {
            name: localStorage.getItem("LOGINDATA"),
            score: localStorage.getItem("start_second"),
          },
        ])
      );
    }
  }
  return currentNodeKey === constants.END_KEY;
}

export function checkIfGameFail(currentNodeKey) {
  return currentNodeKey === constants.FAIL_KEY;
}
