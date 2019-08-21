import MemoryStorage from './MemoryStorage';
import SlackClient, {
  SlackUser,
  SlackMessage,
  RawSlackMessage
} from '../client';

export type Command = {
  command: RegExp | string;
  action: (match, message: RawSlackMessage, client: SlackClient) => void;
  name?: string;
  description?: string;
  enableChannels?: (message: RawSlackMessage, client: SlackClient) => boolean;
  author?: () => string;
  isAuthedUser?: (
    userId: string,
    message: RawSlackMessage,
    client: SlackClient
  ) => boolean;
};

export default class HubotScript {
  static readScripts() {
    let scripts: Array<Command> = MemoryStorage.get('scripts');

    if (!scripts) {
      console.log('loading scripts from `scripts` folder');
      scripts = require('../scripts');
      MemoryStorage.set('scripts', scripts);
    }

    return scripts;
  }
}
