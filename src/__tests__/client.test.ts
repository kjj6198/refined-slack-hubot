import SlackClient from '../client';
import { slackChannelResponse, slackUserReponse } from '../data/SlackResponse';
import { rawSlackMessage } from '../data/SlackMessage';

describe('SlackClient', () => {
  let client;
  beforeEach(() => {
    client = new SlackClient('xxx-xxxxx-xxxx');
  });

  it('should throw error if no token', () => {
    expect(() => {
      new SlackClient(null);
    }).toThrowError();

    expect(() => {
      new SlackClient();
    }).toThrowError();
  });

  it('should listen related rtm events', () => {
    const testClient = new SlackClient('xxx');

    ['message', 'error', 'hello', 'disconnect'].forEach(type => {
      // since rtm is private variable, I need to expose it by as any
      expect((testClient as any).rtm.on).toHaveBeenCalled();
    });
  });

  it('should `getChannelInfo` by calling slack channels.info', async () => {
    client.apiClient.channels = {
      info: jest.fn().mockReturnValue(Promise.resolve(slackChannelResponse))
    };
    const result = await client.getChannelInfo('hello-world');
    expect(client.apiClient.channels.info).toHaveBeenCalledWith({
      channel: 'hello-world'
    });
    expect(result).toEqual(slackChannelResponse.channel);
    client.apiClient.channels.info.mockRestore();
  });

  it('should throw error when ok is false', async () => {
    const error = new Error('channels.info returns error');
    client.apiClient.channels = {
      info: jest.fn().mockReturnValue(
        Promise.resolve({
          ...slackChannelResponse,
          ok: false
        })
      )
    };
    const result = await client.getChannelInfo('channelId');
    expect(result).toEqual(error);
    client.apiClient.channels.info.mockRestore();
  });

  it.skip('should use group API if channel is private', () => {
    client.apiClient.channels = {
      info: jest.fn().mockReturnValue(Promise.resolve(slackChannelResponse))
    };
  });

  it('should getUserInfo correctly by calling users.info', async () => {
    client.apiClient.users = {
      info: jest.fn().mockReturnValue(Promise.resolve(slackUserReponse))
    };

    const result = await client.getUserInfo('userId');
    expect(client.apiClient.users.info).toHaveBeenCalledWith({
      user: 'userId'
    });
    expect(result).toEqual(slackUserReponse.user);

    client.apiClient.users.info.mockRestore();
  });

  it('send text message by calling postMessage if no blocks provided', async () => {
    const channel = '#frontend';
    const text = 'hi from hubot';
    client.apiClient.chat = {
      postMessage: jest.fn().mockReturnValue(
        Promise.resolve({
          ok: true,
          message: {}
        })
      )
    };

    const result = await client.send(channel, text);
    expect(client.apiClient.chat.postMessage).toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      message: {}
    });
  });

  it('log if when sending message has error', async () => {
    const expected = new Error('too_many_attachments');
    client.apiClient.chat = {
      postMessage: jest.fn().mockReturnValue(Promise.reject(expected))
    };
    const spy = jest.spyOn(console, 'log');
    await client.send('#a', 'b');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('can add custom event type to rtm client', () => {
    const noop = () => '';
    client.on('message', noop);
    expect((client as any).rtm.on).toHaveBeenCalledWith('message', noop);
  });

  it('disconnect and remove all events when calling disconnect', () => {
    client.disconnect();
    expect((client as any).rtm.disconnect).toHaveBeenCalled();
    expect((client as any).rtm.removeAllListeners).toHaveBeenCalled();
  });

  it('start connecting rtm client', async () => {
    (client as any).rtm.start.mockReturnValue(
      Promise.resolve({
        ok: true,
        self: {}
      })
    );

    await client.start();
    expect((client as any).rtm.start).toHaveBeenCalled();
  });
});

describe('client#handleMessage', () => {
  let client;
  beforeEach(() => {
    client = new SlackClient('xxx-xxxxx-xxxx');
  });

  it('should not respond message from bot self', async () => {
    (client as any).robot = {
      id: 'self',
      name: 'self'
    };
    rawSlackMessage.user = 'self';
    const result = await (client as any).handleMessage(rawSlackMessage);

    expect(result).toBe(false);
  });

  it.skip('should replace message if mention robot', async () => {
    (client as any).robot = {
      id: 'self',
      name: 'self'
    };
    rawSlackMessage.text = `<@self> deploy alpha project`;
    await (client as any).handleMessage(rawSlackMessage);

    expect(rawSlackMessage.text).toBe('deploy alpha project');
  });
});
