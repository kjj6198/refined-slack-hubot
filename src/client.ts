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
  rawMessage: RawSlackMessage;
  type: string;
  text: string;
  channel: any;
  user: any;
  event_ts: string;
  ts: string;
};

export type RawSlackMessage = {
  type: string;
  text: string;
  user: string;
  team: string;
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
  real_name: string;
  tz_offset: number;
  tz: string;
  tz_label: string;
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  is_stranger: boolean;
  updated: number;
  is_app_user: boolean;
  has_2fa: boolean;
  locale: string;
  profile: {
    phone: string;
    real_name: string;
    display_name: string;
    avatar_hash: string;
    status_text: string;
    status_emoji: string;
    real_name_normalized: string;
    display_name_normalized: string;
    email: string;
    image_original: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
    team: string;
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

export type SlackChannel = {
  id: string;
  name: string;
  is_channel?: boolean;
  is_group?: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  is_shared: boolean;
  is_org_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  last_read: string;
  unread_count: number;
  unread_count_display: number;
  members: Array<string>;
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  previous_names: Array<string>;
};

export type SlackChannelResult = {
  ok: boolean;
  channel: SlackChannel;
};

const catchError = err =>
  console.log(`SlackClient#send() error: ${err.message}`);
// think about testibility
export default class SlackClient {
  private rtm: RTMClient;
  private apiClient: WebClient;
  private robot: Hubot;

  constructor(slackToken?: string) {
    const token = slackToken;
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

    this.rtm.on('message.im', this.handleMessage);

    this.rtm.on('error', console.error);
    this.rtm.once('hello', () =>
      console.log('Successfully connected from server')
    );
    this.rtm.once('disconnect', () => console.log('time to say goodbye!'));
  }

  async getPrivateChannelInfo(channelId: string): Promise<any> {
    return this.apiClient.groups
      .info({
        channel: channelId
      })
      .then(result => {
        return result.channel;
      })
      .catch(err => {
        console.log(
          `channel can not found, maybe I don\'t have permission. Error: ${err.message}`
        );
      });
  }

  async getChannelInfo(channelId: string): Promise<SlackChannel | SlackError> {
    const channel = MemoryStorage.get(`channels-${channelId}`) as SlackChannel;
    if (channel) {
      return Promise.resolve(channel);
    }

    return this.apiClient.channels
      .info({
        channel: channelId
      })
      .then((result: SlackChannelResult) => {
        if (result.ok) {
          MemoryStorage.set(`channels-${channelId}`, result.channel);
          return result.channel;
        }

        throw Error('channels.info returns error');
      })
      .catch(err => {
        if (err.code === 'slack_webapi_platform_error') {
          if (
            !err.data.ok &&
            err.data.error === 'method_not_supported_for_channel_type'
          ) {
            return this.getPrivateChannelInfo(channelId);
          }
        }

        return err;
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

  // TODO: maybe add more params
  async send(channel: string, text: string, blocks?: any, ts?: string) {
    const baseOptions = {
      as_user: true,
      channel,
      text,
      link_names: true
    };

    if (!blocks) {
      return this.apiClient.chat
        .postMessage({
          ...baseOptions,
          thread_ts: ts
        })
        .catch(catchError);
    }

    return this.apiClient.chat
      .postMessage({
        ...baseOptions,
        blocks,
        mrkdwn: true,
        thread_ts: ts
      })
      .catch(catchError);
  }

  on(type, callback) {
    this.rtm.on(type, callback);
  }

  disconnect() {
    this.rtm.disconnect();
    this.rtm.removeAllListeners();
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

  private handleMessage = async (
    message: RawSlackMessage
  ): Promise<boolean> => {
    // ignore self sent message
    if (message.user === this.robot.id) {
      return false;
    }

    if (!message.text) {
      return false;
    }

    // TODO: what if user add script after robot is running?
    const scripts = HubotScript.readScripts();
    const trimedMessage = message.text.trim();

    // @robot help
    // maybe put it in other place?
    // Hubot.handleMessage can be a good place to do that
    if (trimedMessage === `<@${this.robot.id}> help`) {
      const component = block`
        <p><mention id="${message.user}" type="user" /></p>
        <${Help} scripts=${scripts} />
      `;

      this.send(message.channel, `<@${message.user}>`, flatten(component));
      return true;
    }

    // grab user and channel data.
    // we might want to send to slack if error occurs.
    // just leave to user currently.
    try {
      // const channel = this.getChannelInfo(message.channel);
      // const user = this.getUserInfo(message.user);
      // only respond for mention
      if (trimedMessage.indexOf(`<@${this.robot.id}>`) === 0) {
        message.text = message.text.replace(`<@${this.robot.id}>`, '');
        Robot.handleMessage(message);
      }
    } catch (err) {
      console.log('can not handle message: %s', err.message);
    }
  };
}
