import { setText, setChoices } from "../actions/textActions";
import { addToLog, setCurrentNodeKey } from "../actions/gameLogActions";
import { setVariables } from "../actions/variablesActions";
import { checkIfGameOver, checkIfGameFail, checkIfGameEnded } from "./helpers";

// Import Redux store 
import { store } from "../index";

import constants from "../globals/constants";

export default class GameManager {
  // Check if the JSON data for a module has been loaded
  static checkIfModuleLoaded(moduleName) {
    let startingKey = "";

    if (moduleName === constants.MODULE_INCIDENT) {
      startingKey = constants.INCIDENT_STARTING_KEY;
    }

    return startingKey in store.getState().data.textData;
  }

  
  static loadGame() {
    this.loadText();
    this.loadChoices();
  }

  
  static loadText() {
    const key = store.getState().game.currentNodeKey;
    let text = "";

    if (checkIfGameFail(key)) {
      text = constants.FAIL_TEXT;
    } else if (checkIfGameEnded(key)) {
      text = constants.END_TEXT;
    } else {
      text = store.getState().data.textData[key];
      text = text.split(constants.LINE_BREAK_SEPARATOR);
    }

    store.dispatch(setText(text));
  }

  
  static loadChoices() {
    let stringTest;
    let choices = [];

    const currentNodeKey = store.getState().game.currentNodeKey;

    if (checkIfGameFail(currentNodeKey)) {
      choices.push({
        key: constants.FAIL_KEY,
        text: constants.END_CHOICE,
        colorClass: "color-choice",
      });
    } else if (checkIfGameEnded(currentNodeKey)) {
      choices.push({
        key: constants.END_KEY,
        text: constants.END_CHOICE,
        colorClass: "color-choice",
      });
    } else {
      const choicesData = store.getState().data.choicesData;

      
      for (const i in choicesData) {
        stringTest = choicesData[i].KEY;

        if (stringTest.substring(0, 12) === currentNodeKey) {
          if (this.checkChoice(i)) {
            const choiceData = choicesData[i];

            let choice = {
              key: choiceData.KEY,
              text: choiceData.text,
            };

            choices.push(choice);
          }
        }
      }
    }

    store.dispatch(setChoices(choices));
  }

  static checkChoice(choiceKey) {
    const choice = store.getState().data.choicesData[choiceKey];
    
    if (choice.additionalVariableCostA_Key) {
      const condition1 = this.checkPlayerVariables(
        choice.additionalVariableCostA_Key,
        choice.additionalVariableCostA_Equivalence,
        choice.additionalVariableCostA_Value
      );

      if (choice.additionalVariableCostB_Key) {
        

        const condition2 = this.checkPlayerVariables(
          choice.additionalVariableCostB_Key,
          choice.additionalVariableCostB_Equivalence,
          choice.additionalVariableCostB_Value
        );

        if (choice.additionalVariableCost_Operator === "&&") {
          if (condition1 && condition2) {
            return true;
          } else {
            return false;
          }
        } else if (choice.additionalVariableCost_Operator === "||") {
          if (condition1 || condition2) {
            return true;
          } else {
            return false;
          }
        } else {
          
          return false;
        }
      } else {
        
        if (condition1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      
      return true;
    }
  }

 
  static checkPlayerVariables(reference, equivalence, value) {
    const playerVariables = store.getState().variables.playerVariables;
    const defaultValue = 0;

    if (!equivalence) {
      
      return reference in playerVariables;
    } else if (equivalence === "=") {

      return playerVariables[reference] === value;
    } else if (equivalence === "!=" && !value) {
      
      return !(reference in playerVariables);
    } else if (equivalence === "!=" && value) {
      if (
        reference in playerVariables &&
        playerVariables[reference] !== value
      ) {
        return true;
      } else if (value !== defaultValue) {
        
        return true;
      } else {
        return false;
      }
    } else if (equivalence === "<") {
      if (reference in playerVariables && playerVariables[reference] < value) {
        return true;
      } else if (value < defaultValue) {
        
        return true;
      } else {
        return false;
      }
    } else if (equivalence === "<=") {
      if (reference in playerVariables && playerVariables[reference] <= value) {
        return true;
      } else if (value <= defaultValue) {
        // Variable not found, so assume default value (0)
        return true;
      } else {
        return false;
      }
    } else if (equivalence === ">") {
      if (reference in playerVariables && playerVariables[reference] > value) {
        return true;
      } else if (value > defaultValue) {
        // Variable not found, so assume default value (0)
        return true;
      } else {
        return false;
      }
    } else if (equivalence === ">=") {
      if (reference in playerVariables && playerVariables[reference] >= value) {
        return true;
      } else if (value >= defaultValue) {
        // Variable not found, so assume default value (0)
        return true;
      } else {
        return false;
      }
    } else {
      // In case anything goes wrong, defaults to returning false
      console.log(
        "%c checkPlayerVariables() error ",
        "color:white; background:red;"
      );
      return false;
    }
  }

  // Write story node decision to gameLog.
  // Dispatch action using Redux.
  static writeToGameLog(textNodeKey, choiceNodeKey) {
    store.dispatch(addToLog(textNodeKey, choiceNodeKey));
  }

  static makeDecision(choiceNodeKey) {
    const currentNodeKey = store.getState().game.currentNodeKey;
    this.writeToGameLog(currentNodeKey, choiceNodeKey);

    const choice = store.getState().data.choicesData[choiceNodeKey];

    
    let dieRollDestinationA;
    let dieRollDestinationB;
    let dieRollDestinationC;
    let dieRollDestinationD;

    // Empty string, null, undefined, and 0 are all falsy.
    if (!choice.destinationA_percentage) {
      // There's only one destination, go to destinationA.
      this.loadStoryNode(choice.destinationA);
    } else if (!choice.destinationC_percentage) {
      
      dieRollDestinationA = this.rollDie() * choice.destinationA_percentage;
      dieRollDestinationB = this.rollDie() * choice.destinationB_percentage;

      if (dieRollDestinationA > dieRollDestinationB) {
        // go to destinationA
        this.loadStoryNode(choice.destinationA);
      } else {
        
        this.loadStoryNode(choice.destinationB);
      }
    } else if (!choice.destinationD_percentage) {
      
      dieRollDestinationA = this.rollDie() * choice.destinationA_percentage;
      dieRollDestinationB = this.rollDie() * choice.destinationB_percentage;
      dieRollDestinationC = this.rollDie() * choice.destinationC_percentage;

      if (
        dieRollDestinationA > dieRollDestinationB &&
        dieRollDestinationA > dieRollDestinationC
      ) {
        
        this.loadStoryNode(choice.destinationA);
      } else if (dieRollDestinationB > dieRollDestinationC) {
        

        this.loadStoryNode(choice.destinationB);
      } else {
        // go to destinationC
        this.loadStoryNode(choice.destinationC);
      }
    } else {
      // There are four destinations
      dieRollDestinationA = this.rollDie() * choice.destinationA_percentage;
      dieRollDestinationB = this.rollDie() * choice.destinationB_percentage;
      dieRollDestinationC = this.rollDie() * choice.destinationC_percentage;
      dieRollDestinationD = this.rollDie() * choice.destinationD_percentage;

      if (
        dieRollDestinationA > dieRollDestinationB &&
        dieRollDestinationA > dieRollDestinationC &&
        dieRollDestinationA > dieRollDestinationD
      ) {
        // go to destinationA
        this.loadStoryNode(choice.destinationA);
      } else if (
        dieRollDestinationB > dieRollDestinationC &&
        dieRollDestinationB > dieRollDestinationD
      ) {
        // go to destinationB
        this.loadStoryNode(choice.destinationB);
      } else if (dieRollDestinationC > dieRollDestinationD) {
        // go to destinationC
        this.loadStoryNode(choice.destinationC);
      } else {
        // go to destinationD
        this.loadStoryNode(choice.destinationD);
      }
    }
  }

  // Helper method to generate random number between 1-100
  static rollDie() {
    return Math.floor(Math.random() * 100) + 1;
  }

  static writeToPlayerVariables(variablesArray) {
    const playerVariables = Object.assign(
      {},
      store.getState().variables.playerVariables
    );

    variablesArray.forEach((variable) => {
      
      if (variable.key in playerVariables) {
        const original = playerVariables[variable.key];
        playerVariables[variable.key] = original + variable.value;
      } else {
        
        playerVariables[variable.key] = variable.value;
      }
    });

    
    store.dispatch(setVariables(playerVariables));
  }

  
  static loadStoryNode(destination) {
    if (checkIfGameOver(destination)) {
      this.updateCurrentNode(destination);
    } else {
      
      if (!this.checkKeyForLinkNode(destination)) {
        this.updateCurrentNode(destination);
      } else {
       
        let newDestination = this.processLinkNode(destination);

        while (this.checkKeyForLinkNode(newDestination)) {
          newDestination = this.processLinkNode(newDestination);
        }

        this.updateCurrentNode(newDestination);
      }
    }

    this.loadGame();
  }

  
  static checkKeyForLinkNode(nodeKey) {
    return nodeKey.substring(0, 1) === constants.LINK_NODE_PREFIX;
  }

  
  static updateCurrentNode(destination) {
    store.dispatch(setCurrentNodeKey(destination));
  }
  static processLinkNode(destination) {
    let loadedLinkNodes = [];
    let stringTest;
    let test1 = false;
    let test2 = false;
    let test3 = false;
    const linkNodesData = store.getState().data.linkNodesData;
    for (const i in linkNodesData) {
      stringTest = linkNodesData[i].KEY;
      if (stringTest.substring(0, 13) === destination) {
        loadedLinkNodes.push(linkNodesData[i]);
      }
    }

    
    for (let i = 0; i < loadedLinkNodes.length; i++) {
      const linkNode = loadedLinkNodes[i];

      if (linkNode.variable1 !== "ELSE") {
        
        if (!linkNode.variable2) {
          
          if (
            this.checkPlayerVariables(
              linkNode.variable1,
              linkNode.equivalence1,
              linkNode.value1
            )
          ) {
            test1 = true;
          }
        } else if (!linkNode.variable3) {
          
          if (
            this.checkPlayerVariables(
              linkNode.variable1,
              linkNode.equivalence1,
              linkNode.value1
            )
          ) {
            test1 = true;
          }

          if (
            this.checkPlayerVariables(
              linkNode.variable2,
              linkNode.equivalence2,
              linkNode.value2
            )
          ) {
            test2 = true;
          }
        } else {
          
          if (
            this.checkPlayerVariables(
              linkNode.variable1,
              linkNode.equivalence1,
              linkNode.value1
            )
          ) {
            test1 = true;
          }

          if (
            this.checkPlayerVariables(
              linkNode.variable2,
              linkNode.equivalence2,
              linkNode.value2
            )
          ) {
            test2 = true;
          }

          if (
            this.checkPlayerVariables(
              linkNode.variable3,
              linkNode.equivalence3,
              linkNode.value3
            )
          ) {
            test3 = true;
          }
        }
        
        if (!linkNode.operator1) {
          
          if (test1) {
            
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "&&" && !linkNode.operator2) {
          if (test1 && test2) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "||" && !linkNode.operator2) {
          if (test1 || test2) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "&&" && linkNode.operator2 === "&&") {
          if (test1 && test2 && test3) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "||" && linkNode.operator2 === "&&") {
          if ((test1 || test2) && test3) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "&&" && linkNode.operator2 === "||") {
          if ((test1 && test2) || test3) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        } else if (linkNode.operator1 === "||" && linkNode.operator2 === "||") {
          if (test1 || test2 || test3) {
            return this.getRandomLinkNodeDestination(linkNode);
          }
        }
      } else {
        
        return this.getRandomLinkNodeDestination(linkNode);
      }
    }
    
    console.log("%c processLinkNode() error", "color:white; background:red;");
    return null;
  }

  
  static getRandomLinkNodeDestination(linkNode) {
    let dieRollA;
    let dieRollB;
    let dieRollC;
    let dieRollD;

    
    if (!linkNode.destinationA_percentage) {
      
      return linkNode.destinationA;
    } else if (!linkNode.destinationC_percentage) {
      
      dieRollA = this.rollDie() * linkNode.destinationA_percentage;
      dieRollB = this.rollDie() * linkNode.destinationB_percentage;

      if (dieRollA > dieRollB) {
        return linkNode.destinationA;
      } else {
        return linkNode.destinationB;
      }
    } else if (!linkNode.destinationD_percentage) {
      
      dieRollA = this.rollDie() * linkNode.destinationA_percentage;
      dieRollB = this.rollDie() * linkNode.destinationB_percentage;
      dieRollC = this.rollDie() * linkNode.destinationC_percentage;

      if (dieRollA > dieRollB && dieRollA > dieRollC) {
        return linkNode.destinationA;
      } else if (dieRollB > dieRollC) {
        return linkNode.destinationB;
      } else {
        return linkNode.destinationC;
      }
    } else {
      // There are four destinations
      dieRollA = this.rollDie() * linkNode.destinationA_percentage;
      dieRollB = this.rollDie() * linkNode.destinationB_percentage;
      dieRollC = this.rollDie() * linkNode.destinationC_percentage;
      dieRollD = this.rollDie() * linkNode.destinationD_percentage;

      if (dieRollA > dieRollB && dieRollA > dieRollC && dieRollA > dieRollD) {
        return linkNode.destinationA;
      } else if (dieRollB > dieRollC && dieRollB > dieRollD) {
        return linkNode.destinationB;
      } else if (dieRollC > dieRollD) {
        return linkNode.destinationC;
      } else {
        return linkNode.destinationD;
      }
    }
  }
}
