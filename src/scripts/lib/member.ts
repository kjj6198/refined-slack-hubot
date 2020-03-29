import { RawSlackMessage } from '../../client';

const members = [];

const channels = [];

export const isMember = (userId: string) => members.some(user => user.id === userId);
export const channelIsValid = (message: RawSlackMessage) =>
  channels.some(channel => channel === message.channel);

export default members;
