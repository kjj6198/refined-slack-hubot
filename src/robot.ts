import SlackClient, { RawSlackMessage } from './client';
import HubotScript, { Command } from './services/HubotScript';

const scripts = HubotScript.readScripts();

function preProcessMessage(script: Command, message: RawSlackMessage, client: SlackClient) {
  if (
    typeof script.isAuthedUser === 'function' &&
    !script.isAuthedUser(message.user, message, client)
  ) {
    client.send(message.channel, '*ERROR:* You are not authed users.');
    return false;
  }

  if (typeof script.enableChannels === 'function' && !script.enableChannels(message, client)) {
    client.send(
      message.channel,
      `*ERROR:* ${script.name || 'this'} command can only run in certain channels.`
    );
    return false;
  }

  return true;
}

export default class Robot {
  static client: SlackClient;

  static run() {
    const client = new SlackClient(process.env.HUBOT_SLACK_TOKEN);
    Robot.client = client;
    client.start();
  }

  static handleScript(message: RawSlackMessage, script: Command) {
    if (typeof script.command === 'string') {
      if (
        message.text.includes(script.command) &&
        preProcessMessage(script, message, Robot.client)
      ) {
        script.action(script.command, message, Robot.client);
      }
      return;
    }

    if (script.command instanceof RegExp) {
      const matches = message.text.match(script.command);
      if (matches && preProcessMessage(script, message, Robot.client)) {
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
