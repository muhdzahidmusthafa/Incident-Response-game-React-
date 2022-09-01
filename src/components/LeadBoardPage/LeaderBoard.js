import React from "react";
import Leaderboard from "react-leaderboard";
import "./Style.css";

export class LeaderBoardPage extends React.Component {
  constructor(props) {
    super(props);
    let LeaderBoardData = JSON.parse(localStorage.getItem("LEADERBOARDDATA"));
    this.state = {
      users:
        LeaderBoardData && LeaderBoardData !== undefined ? LeaderBoardData : [],
    };
  }
  render() {
    return (
      <div className="leadboardBox">
        {this.state.users.length > 0 ? (
          <Leaderboard users={this.state.users} paginate={1} asc={true} />
        ) : (
          <h1>No Data Found</h1>
        )}
      </div>
    );
  }
}
export default LeaderBoardPage;
