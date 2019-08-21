import SlackClient from '../client';

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
    expect(client.rtm.on).toHaveBeenCalled();
  });
});
