import React from "react";
import "./Style.css";
import { Link } from "react-router-dom";

export class OptionPage extends React.Component {
  componentDidMount() {
    if (!localStorage.getItem("LEADERBOARDDATA")) {
      localStorage.setItem("LEADERBOARDDATA", JSON.stringify([
        { name: "zahid", score: "39" },
        { name: "zain", score: "89" },
      ]));
    }
  }
  render() {
    return (
      <div className="menu-page fade-in">
        <h1 className="menu-title">Security Awareness</h1>
        <h4 className="menu-tagline">An incident response training game</h4>
        <div className="d-flex justify-content-center">
          <p className="menu-info">
            Start the game and help your company from attacks
          </p>
        </div>
        <button className="MenuButton">
          <Link
            to="/playexisting"
            className="navbar-brand"
            style={{ color: "cyan" }}
          >
            <h4>New Game</h4>
          </Link>
        </button>
        <br/>
        <button className="MenuButton">
          <Link
            to="/leadboard"
            className="navbar-brand"
            style={{ color: "cyan" }}
          >
            <h4>Leader Board</h4>
          </Link>
        </button>
        <br></br>
        <br></br>
        <button
          onClick={() => {
            localStorage.removeItem("LOGINDATA");
            window.location.reload();
          }}
          className="MenuButton"
          style={{ color: "cyan" }}
        >
          LogOut
        </button>
      </div>
    );
  }
}
export default OptionPage;
