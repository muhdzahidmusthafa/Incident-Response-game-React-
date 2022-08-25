import React from 'react';

import { GameChoiceItem } from './GameChoiceItem';

export class GameChoicesList extends React.Component {
  render() {
    const { choices } = this.props;
    
    const gameChoiceItems = choices.map((choice, i) => (
        <GameChoiceItem
          key={i}
          choice={choice}
        />
      )
    );

    return (
      <div className="game-choices-list">
        <p className="game-choices-info">
          { choices.length > 1 ? 'Click below to make your decision' : 'Click below to proceed:' }
        </p>
        {gameChoiceItems}
      </div>
    );
  }
}