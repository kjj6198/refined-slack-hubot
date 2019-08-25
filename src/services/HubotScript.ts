import MemoryStorage from './MemoryStorage';
import SlackClient, { RawSlackMessage } from '../client';

export type Command = {
  command: RegExp | string;
  action: (match, message: RawSlackMessage, client: SlackClient) => void;
  name: string;
  description?: string;
  enableChannels?: (message: RawSlackMessage, client: SlackClient) => boolean;
  author?: () => string;
  isAuthedUser?: (
    userId: string,
    message: RawSlackMessage,
    client: SlackClient
  ) => boolean;
};

function checkIfDuplicatedScripts(scripts: Array<Command>) {
  const scriptNames: {
    [name: string]: boolean;
  } = {};

  scripts.forEach(script => {
    if (scriptNames[script.name]) {
      throw Error(`there is already a script called ${script.name}`);
    }

    scriptNames[script.name] = true;
  });
}

export default class HubotScript {
  static readScripts(
    loader: () => Array<Command> = () => require('../scripts').default
  ) {
    let scripts: Array<Command> = MemoryStorage.get('scripts');

    if (!scripts) {
      scripts = loader();
      checkIfDuplicatedScripts(scripts);
      MemoryStorage.set('scripts', scripts);
    }

    return scripts;
  }
}
