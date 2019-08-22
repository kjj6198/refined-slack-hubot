import { SlackChannel, SlackChannelResult, SlackUser } from '../client';

export const slackChannel: SlackChannel = {
  id: 'G024BE91L',
  name: 'secretplans',
  is_group: true,
  created: 1360782804,
  creator: 'U024BE7LH',
  is_archived: false,
  is_mpim: false,
  is_general: true,
  is_shared: true,
  is_org_shared: true,
  is_member: true,
  is_private: true,
  members: ['U024BE7LH'],
  previous_names: ['a', 'b', 'c'],
  topic: {
    value: 'Secret plans on hold',
    creator: 'U024BE7LV',
    last_set: 1369677212
  },
  purpose: {
    value: 'Discuss secret plans that no-one else should know',
    creator: 'U024BE7LH',
    last_set: 1360782804
  },

  last_read: '1401383885.000061',
  unread_count: 0,
  unread_count_display: 0
};

export const slackChannelResponse: SlackChannelResult = {
  ok: true,
  channel: slackChannel
};

export const slackUser: SlackUser = {
  id: 'W012A3CDE',
  team_id: 'T012AB3C4',
  name: 'spengler',
  real_name: 'Egon Spengler',
  tz: 'America/Los_Angeles',
  tz_label: 'Pacific Daylight Time',
  tz_offset: -25200,
  locale: 'jp',
  profile: {
    phone: '080-1234-5678',
    team: 'abc',
    avatar_hash: 'ge3b51ca72de',
    status_text: 'Print is dead',
    status_emoji: ':books:',
    real_name: 'Egon Spengler',
    display_name: 'spengler',
    real_name_normalized: 'Egon Spengler',
    display_name_normalized: 'spengler',
    email: 'spengler@ghostbusters.example.com',
    image_original: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_24: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_32: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_48: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_72: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_192: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_512: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg'
  },
  is_admin: true,
  is_owner: false,
  is_primary_owner: false,
  is_restricted: false,
  is_ultra_restricted: false,
  is_bot: false,
  is_stranger: false,
  updated: 1502138686,
  is_app_user: false,
  has_2fa: false
};

export const slackUserReponse: {
  ok: boolean;
  user: SlackUser;
} = {
  ok: true,
  user: slackUser
};
