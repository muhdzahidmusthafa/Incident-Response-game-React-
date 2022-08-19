import { setText, setChoices } from "../actions/textActions";
import { addToLog, setCurrentNodeKey } from "../actions/gameLogActions";
import { setVariables } from "../actions/variablesActions";
import { checkIfGameOver, checkIfGameFail, checkIfGameEnded } from "./helpers";

// Import Redux store from index.js where it is created.
// Store can be accessed with .getState() and can .dispatch() actions.
import { store } from "../index";

import constants from "../globals/constants";

export default class GameManager {
  // Check if the JSON data for a module has been loaded into the
  // Redux store - return true or false.
  static checkIfModuleLoaded(moduleName) {
    let startingKey = "";

    if (moduleName === constants.MODULE_INCIDENT) {
      startingKey = constants.INCIDENT_STARTING_KEY;
    }

    return startingKey in store.getState().data.textData;
  }

  // Call this method to load text and choices into the Redux store based
  // on the current node key.
  static loadGame() {
    this.loadText();
    this.loadChoices();
  }

  // This method loads text from the JSON text data into the Redux store
  // based on the current node key.
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

  // This method loads choices from the JSON choices data into the Redux
  // store based on the current node key.
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

      // TODO: Redesign to not have to search through all data
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
    // Is this choice available to the player based on their past decisions?
    if (choice.additionalVariableCostA_Key) {
      const condition1 = this.checkPlayerVariables(
        choice.additionalVariableCostA_Key,
        choice.additionalVariableCostA_Equivalence,
        choice.additionalVariableCostA_Value
      );

      if (choice.additionalVariableCostB_Key) {
        // There are two additional variable costs

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
          // Then there's an error
          return false;
        }
      } else {
        // There's only one additional variable cost
        if (condition1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      // There are no costs for this choice, so return true
      return true;
    }
  }

  // This method checks for additional variables in the playerVariables object.
  // It checks on the player's past decisions based on a reference (the variable cost key),
  // the equivalence (logical operator), and value to be checked for. It then
  // returns a boolean (true or false) result.
  static checkPlayerVariables(reference, equivalence, value) {
    const playerVariables = store.getState().variables.playerVariables;
    const defaultValue = 0;

    // Search for reference and value pair in playerVariables object.
    // If found, checks for whether it's >, <, etc. to the value provided.
    // If it doesn't pass the test to the value, or if not found, it returns false.

    // Empty string, null, undefined, and 0 are all falsy
    if (!equivalence) {
      // Just search for whether the additional variable is present - value doesn't matter
      return reference in playerVariables;
    } else if (equivalence === "=") {
      // Check for presence of variable and value
      return playerVariables[reference] === value;
    } else if (equivalence === "!=" && !value) {
      // Checks if the additional variable is present at all and returns false if present, true if not
      // - opposite of first check in this series. e.g. if !(01JennethDead), then returns true.
      return !(reference in playerVariables);
    } else if (equivalence === "!=" && value) {
      if (
        reference in playerVariables &&
        playerVariables[reference] !== value
      ) {
        return true;
      } else if (value !== defaultValue) {
        // Variable not found, so assume default value (0)
        return true;
      } else {
        return false;
      }
    } else if (equivalence === "<") {
      if (reference in playerVariables && playerVariables[reference] < value) {
        return true;
      } else if (value < defaultValue) {
        // Variable not found, so assume default value (0)
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

    // ------------------Randomize destinations------------------
    let dieRollDestinationA;
    let dieRollDestinationB;
    let dieRollDestinationC;
    let dieRollDestinationD;

    // Empty string, null, undefined, and 0 are all falsy.
    if (!choice.destinationA_percentage) {
      // There's only one destination, go to destinationA.
      this.loadStoryNode(choice.destinationA);
    } else if (!choice.destinationC_percentage) {
      // There's no third destination, so it's between destinationA and destinationB.
      // Can't just check second destination percentage, because there may or may not be a third.
      dieRollDestinationA = this.rollDie() * choice.destinationA_percentage;
      dieRollDestinationB = this.rollDie() * choice.destinationB_percentage;

      if (dieRollDestinationA > dieRollDestinationB) {
        // go to destinationA
        this.loadStoryNode(choice.destinationA);
      } else {
        // go to destinationB
        this.loadStoryNode(choice.destinationB);
      }
    } else if (!choice.destinationD_percentage) {
      // There's no fourth destination, so it's between destinationA, destinationB, and destinationC
      dieRollDestinationA = this.rollDie() * choice.destinationA_percentage;
      dieRollDestinationB = this.rollDie() * choice.destinationB_percentage;
      dieRollDestinationC = this.rollDie() * choice.destinationC_percentage;

      if (
        dieRollDestinationA > dieRollDestinationB &&
        dieRollDestinationA > dieRollDestinationC
      ) {
        // go to destinationA
        this.loadStoryNode(choice.destinationA);
      } else if (dieRollDestinationB > dieRollDestinationC) {
        // go to destinationB

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

  // Write player variables to object in Redux store.
  // These additional variables keep track of specific player decisions
  // that can be evaluated later in the story.
  // Expects to receive variables as an array of objects (can be only one object):
  // [
  //   {
  //     key: additionalVariableBoostA_Key,
  //     value: additionalVariableBoostA_Value
  //   },
  //   {
  //     key: additionalVariableBoostB_Key,
  //     value: additionalVariableBoostB_Value
  //   }
  // ]
  static writeToPlayerVariables(variablesArray) {
    // Get current playerVariables from the Redux store and copy it (since it is read only).
    const playerVariables = Object.assign(
      {},
      store.getState().variables.playerVariables
    );

    variablesArray.forEach((variable) => {
      // Check if the variable already exists in playerVariables.
      // If it does, update it.
      if (variable.key in playerVariables) {
        const original = playerVariables[variable.key];
        playerVariables[variable.key] = original + variable.value;
      } else {
        // If variable doesn't exist, add it to playerVariables.
        playerVariables[variable.key] = variable.value;
      }
    });

    // Dispatch updated playerVariables object to Redux store.
    // Object should retain same structure in which it was received.
    store.dispatch(setVariables(playerVariables));
  }

  // Load the next story node based on the destination key sent as an argument.
  static loadStoryNode(destination) {
    // Check for either fail or game end conditions.
    if (checkIfGameOver(destination)) {
      this.updateCurrentNode(destination);
    } else {
      // Link node keys are prefixed with an X, so check for it here.
      // If it's not a link node, it's a normal node, so just set it as the new current node.
      if (!this.checkKeyForLinkNode(destination)) {
        this.updateCurrentNode(destination);
      } else {
        // Link node logic - loop through as many link nodes as necessary.
        // Link nodes are used to test for past decisions through the playerVariables object.
        let newDestination = this.processLinkNode(destination);

        while (this.checkKeyForLinkNode(newDestination)) {
          newDestination = this.processLinkNode(newDestination);
        }

        this.updateCurrentNode(newDestination);
      }
    }

    this.loadGame();
  }

  // Link node keys are prefixed with an X, so check for it here.
  static checkKeyForLinkNode(nodeKey) {
    return nodeKey.substring(0, 1) === constants.LINK_NODE_PREFIX;
  }

  // Dispatch an action to update the currentNodeKey in the Redux store.
  static updateCurrentNode(destination) {
    store.dispatch(setCurrentNodeKey(destination));
  }

  // This method is used to examine a link node and determine how to proceed based
  // on whether or not the player has met certain conditions based on past decisions.
  // The method loads all link nodes that match the given destination key, then checks
  // the requirements of each link node based on the playerVariables object in the
  // Redux store. The method returns a new destination (which may be another link node).
  static processLinkNode(destination) {
    let loadedLinkNodes = [];
    let stringTest;
    let test1 = false;
    let test2 = false;
    let test3 = false;

    // Load the link nodes matching the key pattern into an array.
    // There can be multiple link nodes for a particular key in order to create
    // complex condition chains, such as: IF 01MarryJeneth, go to destination 1,
    // ELSE, go to destination 2. Keys in the same pattern match:
    // XAA001AJ001BD01, XAA001AJ001BD02 - They are the same except for the last
    // two digits, so test for the same first twelve characters.
    const linkNodesData = store.getState().data.linkNodesData;

    // TODO: Redesign to not have to search through all data
    for (const i in linkNodesData) {
      stringTest = linkNodesData[i].KEY;
      if (stringTest.substring(0, 13) === destination) {
        loadedLinkNodes.push(linkNodesData[i]);
      }
    }

    // TODO: Review logic
    // In this loop, we check for past decisions (playerVariables) based on
    // requirements in the link node. This can't be a forEach because we need
    // to be able to terminate early and return a destination.
    for (let i = 0; i < loadedLinkNodes.length; i++) {
      const linkNode = loadedLinkNodes[i];

      if (linkNode.variable1 !== "ELSE") {
        // Empty string, null, undefined, and 0 are all falsy.
        if (!linkNode.variable2) {
          // If there's not second variable, then just check for variable1
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
          // If there's no third variable, then check for variable1 and variable2
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
          // Check for variable1, variable2, and variable3
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
        // -------------------------------------------------------------------------
        // Test the individual variables in combination
        // -------------------------------------------------------------------------
        // Empty string, null, undefined, and 0 are all falsy.
        if (!linkNode.operator1) {
          // If there are no logical operators like && or ||, then this is a single test.
          if (test1) {
            // Go to destination
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
        // variable1 is ELSE and just go to destination.
        return this.getRandomLinkNodeDestination(linkNode);
      }
    }
    // If nothing is found, an error has occurred.
    console.log("%c processLinkNode() error", "color:white; background:red;");
    return null;
  }

  // Return a destination based on the link node's percentages.
  static getRandomLinkNodeDestination(linkNode) {
    let dieRollA;
    let dieRollB;
    let dieRollC;
    let dieRollD;

    // Empty string '', null, undefined, and 0 are all falsy.
    if (!linkNode.destinationA_percentage) {
      // There's only one destination, so go to destinationA.
      return linkNode.destinationA;
    } else if (!linkNode.destinationC_percentage) {
      // There's no third destination, so it's between destinationA and destinationB
      dieRollA = this.rollDie() * linkNode.destinationA_percentage;
      dieRollB = this.rollDie() * linkNode.destinationB_percentage;

      if (dieRollA > dieRollB) {
        return linkNode.destinationA;
      } else {
        return linkNode.destinationB;
      }
    } else if (!linkNode.destinationD_percentage) {
      // There's no fourth destination, so it's between destinationA, destinationB, and destinationC
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
