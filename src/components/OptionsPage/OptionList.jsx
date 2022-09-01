import React from "react";

import { Link } from "react-router-dom";

import constants from "../../globals/constants";
import GameManager from "../../mechanics/GameManager";
import { checkIfGameOver } from "../../mechanics/helpers";

import "./Style.css";

export class MenuList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="menu-list">
        <h3>
          <button className="MenuButton">
            <Link to="/game" onClick={this.startNewGame}>
              New Game
            </Link>
          </button>
        </h3>
      </div>
    );
  }
}
