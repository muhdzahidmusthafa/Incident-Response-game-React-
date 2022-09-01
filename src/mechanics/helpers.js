import constants from "../globals/constants";

export function checkIfGameOver(currentNodeKey) {
  return (
    currentNodeKey === constants.FAIL_KEY ||
    currentNodeKey === constants.END_KEY
  );
}

export function checkIfGameEnded(currentNodeKey) {
  if (currentNodeKey === constants.END_KEY) {
    console.log("dmfjgnjhjgnjhnj yaha aaya tha ");
    if (localStorage.getItem("LEADERBOARDDATA")) {
      let json = {
        name: localStorage.getItem("LOGINDATA"),
        score: localStorage.getItem("start_second"),
      };
      console.log("json data ", json);
      let find_index = null;
      let lead_board_data = JSON.parse(localStorage.getItem("LEADERBOARDDATA"));
      lead_board_data.map((element, index) => {
        if (element.name == localStorage.getItem("LOGINDATA")) {
          find_index = index;
        }
      });
      if (find_index == null) {
        lead_board_data[lead_board_data.length] = json;
      } else {
        lead_board_data[find_index] = json;
      }
      localStorage.setItem("LEADERBOARDDATA", JSON.stringify(lead_board_data));

      console.log("setn hone ki kosis huwa ");
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
