import SlackClient, { SlackMessage, RawSlackMessage } from './client';
import HubotScript from './services/HubotScript';

const scripts = HubotScript.readScripts();
export default class Robot {  
  static run() {
    const client = new SlackClient();
    client.start();
  }

  static handleMessage(message: RawSlackMessage, client: SlackClient) {
    scripts.forEach(script => {
      
      if (typeof script.isAuthedUser === 'function' && !script.isAuthedUser(message.user, message, client)) {
        client.send(message.channel, 'You are not auth users.');
        return
      }

      if (typeof script.enableChannels === 'function' && !script.enableChannels(message, client))  {
        client.send(message.channel, `${script.name || 'this'} command can only run in certain channels.`);
        return;
      }

      if (typeof script.command === 'string') {
        if (message.text.includes(script.command)) {
          script.action(script.command, message, client);
        }
        return
      }

      if (script.command instanceof RegExp) {
        const matches = message.text.match(script.command);
        if (matches) {
          script.action(matches, message, client);
        }
      }
    });
  }
}
