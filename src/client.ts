import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import MemoryStorage from './services/MemoryStorage';
import HubotScript from './services/HubotScript';
import block from './services/SlackBlock';

// const MESSAGE_REGEX = /<([@#!])?([^>|]+)(?:\|([^>]+))?>/g;

// type SlackError = {
//   code: string;
//   data: {
//     ok: boolean,
//     error: string,
//     response_metadata: any
//   };
// }

// type RawSlackMessage = {
//   client_msg_id: string;
//   suppress_notification: boolean;
//   type: string;
//   text: string;
//   user: string;
//   team: string;
//   user_team: string;
//   channel: string;
//   event_ts: string;
//   ts: string;
// }

// type Hubot = {
//   id: string;
//   name: string;
// };

// export type SlackUser = {
//   id: string;
//   team_id?: string;
//   name: string;
//   tz: string;
//   tz_label: string;
//   profile: {
//     title: string;
//     phone: string;
//     real_name: string;
//     display_name: string;
//   },
//   imageURL: {
//     small?: string;
//     medium?: string;
//     large?: string;
//   }
// };

// export type Text = {
//   type: "mrkdwn" | "plaintext";
//   text: string;
//   emoji?: boolean;
// };

// export type Block = {
//   type: "section" | "context" | "divider",
//   text?: Text,
//   fields: Array<Text>
// }

// export type RichMessage = {
//   token?: string;
//   channel: string;
//   text: string;
//   as_user: boolean;
//   blocks?: Array<Block>;
// };

// // think about testibility
// class SlackClient {
//   private rtm: RTMClient;
//   private apiClient: WebClient;
//   private robot: Hubot;

//   constructor(slackToken?: string, robot?) {
//     const token = process.env.HUBOT_SLACK_TOKEN || slackToken;
//     if (!token) {
//       throw Error('SlackClient requires `HUBOT_SLACK_TOKEN`');
//     }
    
//     this.apiClient = new WebClient(token);
//     this.rtm = new RTMClient(token);

//     this.rtm.on('message', this.handleMessage);
//     this.rtm.on('error', (err: SlackError) => {
//       // TODO: do logging
//     });

//     this.rtm.on('error', console.error);
//     this.rtm.on('disconnect', console.log);
//     this.rtm.on('disconnect', () => console.log('time to say goodbye!'))

//     process.on('uncaughtException', () => {
//       console.log('error1!')
//     });
    
//     process.on('unhandledRejection', (e) => {
//       console.log(e);
//     });
//   }

//   async getChannelInfo(channelId: string): Promise<any> {
//     const channel = MemoryStorage.get(`channels-${channelId}`);
//     if (channel) {
//       return Promise.resolve(channel);
//     }

//     this.apiClient.channels.info({
//       channel: channelId,
//     }).then(result => {
//       return result.channel;
//     });
//   }

//   async getUserInfo(userId: string): Promise<SlackUser> {
//     const user = MemoryStorage.get(`users-${userId}`) as SlackUser;
//     if (user) {
//       return Promise.resolve(user);
//     }

//     return this.apiClient.users.info({
//       user: userId
//     }).then((u: any) => {
//       MemoryStorage.set(`users-${userId}`, u.user);
//       return u.user;
//     });
//   }

//   // wrapper for webClient
//   async do(group: string, action: string, params: string) {
//     return this.apiClient[group][action](params);
//   }

//   async send(channel: string, message: string | RichMessage) {
//     if (typeof message === 'string') {
//       return this.apiClient.chat.postMessage({
//         as_user: true,
//         text: message,
//         channel,
//       });
//     }

//     return this.apiClient.chat.postMessage({
//       as_user: true,
//       channel,
//       ...message,
//     });
//   }

//   start() {
//     if (this.rtm) {
//       this.rtm.start()
//         .then(response => {
//           if (response.ok) {
//             const bot = response.self as Hubot;
//             this.robot = bot;
//             console.log('Successfully login as %s', bot.name);
//           }
//         })
//         .catch((err: SlackError) => {
//           console.error('[ERROR] can not login. error:', err.data.error);
//         });
//     }
//   }

//   handleMessage = async (message: RawSlackMessage) => {
//     // 1. map userId to actual user
//     // 2. identify type
//     const scripts = HubotScript.readScripts();
//     const markup = scripts.filter(s => s.name || s.description).map(s => `
//       <strong>Name: ${s.name}</strong>
//       <text>${s.description}</text>
//     `).join('');

//     console.log(block`
//       ${scripts.map(s => `<strong>${s.name}</strong>`).join('')}
//     `);
    
//     // const scripts = HubotScript.readScripts();
//     // console.log(scripts, message);
//     // if (message.text === `<@${this.robot.id}> help`) {
//     //   const component = block`
//     //   ${scripts.filter(s => s.name || s.description).map(s => `
//     //     <section><strong>Name: ${s.name}</strong></section>
//     //     <text>${s.description}</text>
//     //   `).join('')}
//     //   `;
//     //   console.log(component);
//     //   this.send(message.channel, component);
//     // }

//     // if (message.user) {
//     //   const user = await this.getUserInfo(message.user);
//     //   const channel = await this.getChannelInfo(message.channel);

//     //   if (message.type === 'message') {
        
//     //     scripts.filter(s => {
//     //       if (typeof s.command === 'string') {
//     //         return message.text.indexOf(s.command) > -1
//     //       }

//     //       return s.command.test(message.text);
//     //     })
//     //     .forEach(s => {
          
//     //     });
//     //   }
//     // }

//     // grab all scripts from scripts folder or config file
//   }
// }

// new SlackClient().start();

const t = [1,2,3].map(a => `<p href="aa">${a}</p>`).join('');
console.log(t);
console.log(block`
  <section
    text=${block`
    <strong>hello</strong>
    <strong>hello</strong>  
    ${t}
    `}
  >
`);