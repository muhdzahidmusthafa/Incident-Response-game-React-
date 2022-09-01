import React from "react";

import { Link } from "react-router-dom";

import constants from "../../globals/constants";
import GameManager from "../../mechanics/GameManager";
import { checkIfGameOver } from "../../mechanics/helpers";
import imagesndjs from "../../assets/960x0.jpeg"
import ghjk from "../../assets/COMING_SOON.jpeg"

import "./Style.css";

export class MenuList extends React.Component {
  constructor(props) {
    super(props);

    this.startNewGame = this.startNewGame.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  startNewGame() {
    const { startGame, resetTextChoices, resetVariables } = this.props;
    localStorage.setItem("start_second", 0);

    // Dispatch Redux actions
    startGame();
    resetTextChoices();
    resetVariables();

    this.loadData();
  }

  loadData() {
    const { loadModuleData, setLoading } = this.props;

    // Check if text data is already loaded - only load if it's not
    if (!GameManager.checkIfModuleLoaded(constants.MODULE_INCIDENT)) {
      // Set loading flag for GameLoadingContainer
      setLoading(true);
      // Dispatch Redux action to load text data
      loadModuleData(constants.MODULE_INCIDENT);
    }
  }

  // the startNewGame function
  render() {
    const { gameStarted, currentNodeKey } = this.props;
    const gameOver = checkIfGameOver(currentNodeKey);

    return (
      <div className="menu-list">
        <h3>
          <div>
          <div style={{float: "left", width: "45%", height:"400px", backgroundImage:`url(${imagesndjs})`,backgroundSize: 'cover' ,borderRadius:"20px"}}>
            {/* <img src={imagesndjs} style={{width:"250px", height:"250px"}}/> */}
        <button className="optionButton">
            <Link to="/game" onClick={this.startNewGame}>
              Data Breach
            </Link>
          </button>
    </div>
    <div style={{float: "right", width: "45%", height:"400px", backgroundImage:`url(${ghjk})`,backgroundSize: 'cover', borderRadius:"20px"}}>
    {/* <button className="Disabled">Work In Progress</button> */}
    </div>
          </div>
          
        </h3>
        
      </div>
    );
  }
}
