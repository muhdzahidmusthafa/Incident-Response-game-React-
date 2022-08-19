// Webpack loads JSON files by default - parses as JavaScript objects
import ChoicesJSON from '../storyModules/module01CHOICES.json';
import TextJSON from '../storyModules/module01TEXT.json';

import constants from '../globals/constants';

export default class TextManager {

  // This method loads JSON story data and returns an object
  // structured like this:
  // {
  //   textData: data,
  //   linkNodesData: data,
  //   choicesData: data
  // }
  static loadModule(moduleNumber) {
    console.log('%c Loading story module ' + moduleNumber + '... ', 'color:white; background:orange;');

    if (moduleNumber === constants.MODULE_INCIDENT) {
      return this.loadJSON(TextJSON, ChoicesJSON);
    } else {
      console.log('%c Error: Invalid story module. ', 'color:white; background:red;');
      return {};
    }
  }

  // Use this method to asynchronously load the JSON story data.
  // It returns a promise, so it can be chained with .then() or .catch().
  static loadModuleAsync(moduleNumber) {
    console.log('%c Loading story module ' + moduleNumber + '... ', 'color:white; background:orange;');

    return new Promise((resolve, reject) => {
      if (moduleNumber === constants.MODULE_INCIDENT) {
        const data = this.loadJSON(TextJSON, ChoicesJSON);
                
        if(data) {
          console.log('%c Successfully loaded story module ' + moduleNumber + '. ', 'color:white; background:green;');
          resolve(data);
        } else {
          console.log('%c Error: Failed to load story module. ', 'color:white; background:red;');
          reject({error: 'Failed to load story module'});
        }        

      } else {
        console.log('%c Error: Invalid story module. ', 'color:white; background:red;');
        reject({error: 'Invalid story module'});
      }
    });
  }

  // This method is used to structure and return the JSON story data.
  // It sets the data keys (such as AA000AA000AA) to be keys in the objects.
  // Don't use this method directly. Use either loadModule() or loadModuleAsync().
  // (Create React App is not currently configured to support private methods).
  static loadJSON(moduleText, moduleChoices, moduleLinkNodes) {
    let data = {
        textData: {},
        linkNodesData: {},
        choicesData: {}
      }

    for (const i in moduleText) {
      data.textData[moduleText[i].KEY] = moduleText[i].TEXT;
    }

    for (const j in moduleChoices) {
      data.choicesData[moduleChoices[j].KEY] = moduleChoices[j];
    }

    for (const k in moduleLinkNodes) {
      data.linkNodesData[moduleLinkNodes[k].KEY] = moduleLinkNodes[k];
    }

    return data;
  }
}
