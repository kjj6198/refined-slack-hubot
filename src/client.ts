import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import MemoryStorage from './services/MemoryStorage';
import HubotScript from './services/HubotScript';
import block from './services/SlackBlock';
import Help from './components/Help';

const MESSAGE_REGEX = /<([@#!])?([^>|]+)(?:\|([^>]+))?>/g;

type SlackError = {
  code: string;
  data: {
    ok: boolean;
    error: string;
    response_metadata: any;
  };
};

type RawSlackMessage = {
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

  constructor(slackToken?: string, robot?) {
    const token = process.env.HUBOT_SLACK_TOKEN || slackToken;
    if (!token) {
      throw Error('SlackClient requires `HUBOT_SLACK_TOKEN`');
    }

    this.apiClient = new WebClient(token);
    this.rtm = new RTMClient(token);

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
      });
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

  async send(channel: string, text: string, blocks: any) {
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

  handleMessage = async (message: RawSlackMessage) => {
    // ignore self sent message
    if (message.user === this.robot.id) {
      return;
    }

    // TODO: what if user add script after robot is running?
    const scripts = HubotScript.readScripts();

    if (message.text === `<@${this.robot.id}> help`) {
      const component = block`
        <${Help} scripts=${scripts} />
      `.flat();

      console.log(component);
      this.send(message.channel, '', component);
    }
    const user = await this.getUserInfo(message.user);

    // if (message.user) {

    //   const channel = await this.getChannelInfo(message.channel);

    //   if (message.type === 'message') {

    //     scripts.filter(s => {
    //       if (typeof s.command === 'string') {
    //         return message.text.indexOf(s.command) > -1
    //       }

    //       return s.command.test(message.text);
    //     })
    //     .forEach(s => {

    //     });
    //   }
    // }

    // grab all scripts from scripts folder or config file
  };
}

new SlackClient().start();
