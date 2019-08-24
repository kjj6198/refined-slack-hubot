import SlackClient, { RawSlackMessage } from './client';
import HubotScript, { Command } from './services/HubotScript';

const scripts = HubotScript.readScripts();

export default class Robot {
  static client: SlackClient;

  static run() {
    const client = new SlackClient(process.env.HUBOT_SLACK_TOKEN);
    client.start();
    Robot.client = client;
  }

  static handleScript(message: RawSlackMessage, script: Command) {
    if (
      typeof script.isAuthedUser === 'function' &&
      !script.isAuthedUser(message.user, message, Robot.client)
    ) {
      Robot.client.send(message.channel, '*ERROR:* You are not authed users.');
      return;
    }

    if (
      typeof script.enableChannels === 'function' &&
      !script.enableChannels(message, Robot.client)
    ) {
      Robot.client.send(
        message.channel,
        `*ERROR:* ${script.name ||
          'this'} command can only run in certain channels.`
      );
      return;
    }

    if (typeof script.command === 'string') {
      if (message.text.includes(script.command)) {
        script.action(script.command, message, Robot.client);
      }
      return;
    }

    if (script.command instanceof RegExp) {
      const matches = message.text.match(script.command);
      if (matches) {
        script.action(matches, message, Robot.client);
      }
    }
  }

  // for now just run all scripts synchronously, if command takes long time,
  // other command might wait for it.
  static handleMessage(message: RawSlackMessage) {
    scripts.forEach(script => {
      Robot.handleScript(message, script);
    });
  }
}
