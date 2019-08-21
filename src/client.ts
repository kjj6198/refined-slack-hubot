import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import MemoryStorage from './services/MemoryStorage';
import HubotScript from './services/HubotScript';
import Robot from './robot';
import block from './services/SlackBlock';
import Help from './components/Help';
import flatten from './utils/flatten';

type SlackError = {
  code: string;
  data: {
    ok: boolean;
    error: string;
    response_metadata: any;
  };
};

export type SlackMessage = {
  rawMessage: RawSlackMessage,
  type: string,
  text: string,
  channel: any,
  user: any,
  event_ts: string,
  ts: string,
};

export type RawSlackMessage = {
  client_msg_id: string;
  suppress_notification: boolean;
  type: string;
  text: string;
  user: string;
  team: string;
  user_team: string;
  channel: string;
  event_ts: string;
  ts: string;
};

type Hubot = {
  id: string;
  name: string;
};

export type SlackUser = {
  id: string;
  team_id?: string;
  name: string;
  tz: string;
  tz_label: string;
  profile: {
    title: string;
    phone: string;
    real_name: string;
    display_name: string;
  };
  imageURL: {
    small?: string;
    medium?: string;
    large?: string;
  };
};

export type Text = {
  type: 'mrkdwn' | 'plaintext';
  text: string;
  emoji?: boolean;
};

export type Block = {
  type: 'section' | 'context' | 'divider';
  text?: Text;
  fields: Array<Text>;
};

export type RichMessage = {
  token?: string;
  channel: string;
  text: string;
  as_user: boolean;
  blocks?: Array<Block>;
};

const catchError = err =>
  console.log(`SlackClient#send() error: ${err.message}`);
// think about testibility
export default class SlackClient {
  private rtm: RTMClient;
  private apiClient: WebClient;
  private robot: Hubot;
  private messageHandler: any;

  constructor(slackToken?: string) {
    const token = process.env.HUBOT_SLACK_TOKEN || slackToken;
    if (!token) {
      throw Error('SlackClient requires `HUBOT_SLACK_TOKEN`');
    }

    this.apiClient = new WebClient(token);
    this.rtm = new RTMClient(token);
    
    // logging!!
    this.rtm.on('message', this.handleMessage);
    this.rtm.on('error', (err: SlackError) => {
      // TODO: do logging
    });

    this.rtm.on('error', console.error);
    this.rtm.once('hello', () =>
      console.log('Successfully connected from server')
    );
    this.rtm.once('disconnect', () => console.log('time to say goodbye!'));

  }

  setupMessageHandler(callback) {
    this.messageHandler = null;
    this.messageHandler = callback;
    this.messageHandler = this.messageHandler.bind(this);
  }

  async getPrivateChannelInfo(channelId: string): Promise<any> {
    return this.apiClient.groups.info({
      channel: channelId,
    }).then(result => {
      return result.channel;
    })
    .catch(err => {
      console.log(`channel can not found, maybe I don\'t have permission. Error: ${err.message}`);
    });
  }

  async getChannelInfo(channelId: string): Promise<any> {
    const channel = MemoryStorage.get(`channels-${channelId}`);
    if (channel) {
      return Promise.resolve(channel);
    }

    this.apiClient.channels
      .info({
        channel: channelId
      })
      .then(result => {
        return result.channel;
      })
      .catch(err => {
        if (err.code === 'slack_webapi_platform_error') {
          if (!err.data.ok && err.data.error === 'method_not_supported_for_channel_type') {
            return this.getPrivateChannelInfo(channelId);
          }
        }

        return null;
      })
  }

  async getUserInfo(userId: string): Promise<SlackUser> {
    const user = MemoryStorage.get(`users-${userId}`) as SlackUser;
    if (user) {
      return Promise.resolve(user);
    }

    return this.apiClient.users
      .info({
        user: userId
      })
      .then((u: any) => {
        MemoryStorage.set(`users-${userId}`, u.user);
        return u.user;
      });
  }

  // wrapper for webClient
  async do(group: string, action: string, params: string) {
    return this.apiClient[group][action](params);
  }

  async send(channel: string, text: string, blocks?: any) {
    if (!blocks) {
      return this.apiClient.chat
        .postMessage({
          as_user: true,
          text: text,
          channel
        })
        .catch(catchError);
    }

    return this.apiClient.chat
      .postMessage({
        as_user: true,
        channel,
        text,
        blocks,
        mrkdwn: true
      })
      .catch(catchError);
  }

  on(type, callback) {
    this.rtm.on(type, callback);
  }

  disconnect() {
    this.rtm.disconnect();
    this.rtm.removeAllListeners();
    process.exit(1);
  }

  start() {
    if (this.rtm) {
      this.rtm
        .start()
        .then(response => {
          if (response.ok) {
            const bot = response.self as Hubot;
            this.robot = bot;
            console.log('Successfully login as %s', bot.name);
          }
        })
        .catch((err: SlackError) => {
          console.error('[ERROR] can not login. error:', err.data.error);
        });
    }
  }

  private handleMessage = async (message: RawSlackMessage) => {
    // ignore self sent message
    if (message.user === this.robot.id) {
      return;
    }

    // TODO: what if user add script after robot is running?
    const scripts = HubotScript.readScripts();
    const trimedMessage = message.text.trim();
    // @robot help
    this.getChannelInfo(message.channel);
    if (trimedMessage === `<@${this.robot.id}> help`) {
      const component = block`
        <mention id="${message.user}" type="user" />
        <${Help} scripts=${scripts} />
      `;

      this.send(message.channel, `<@${message.user}>`, flatten(component));
      return;
    }

    // grab user and channel data.
    try {
      // only respond for mention
      if (trimedMessage.indexOf(`<@${this.robot.id}>`) === 0) {
        message.text = message.text.replace(`<@${this.robot.id}>`, '');
        Robot.handleMessage(message, this);
      }
    } catch (err) {
      console.log('can not handle message: %s', err.message);
    }
  };
}
