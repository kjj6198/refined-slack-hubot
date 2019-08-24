import Robot from '../robot';
import { rawSlackMessage } from '../data/SlackMessage';

jest.mock('../client');
import SlackClient from '../client';
import { Command } from '../services/HubotScript';

describe('Robot', () => {
  it('should call client.start()', () => {
    const spy = jest.spyOn(SlackClient.prototype, 'start');

    Robot.run();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not respond if user is not authed', () => {
    const script: Command = {
      name: 'test',
      isAuthedUser: () => false,
      command: 'test',
      action: () => {}
    };

    Robot.run();
    Robot.handleScript(rawSlackMessage, script);
    expect(Robot.client.send).toHaveBeenCalledWith(
      rawSlackMessage.channel,
      '*ERROR:* You are not authed users.'
    );
  });

  it('should respond if user is authed', () => {
    const script: Command = {
      name: 'test',
      isAuthedUser: () => true,
      command: 'test',
      action: jest.fn()
    };

    Robot.run();
    rawSlackMessage.text = 'test';
    Robot.handleScript(rawSlackMessage, script);
    expect(script.action).toHaveBeenCalled();
  });

  it('should not respond if channel is not in `enableChannels`', () => {
    const script: Command = {
      name: 'test',
      isAuthedUser: () => true,
      enableChannels: () => false,
      command: 'test',
      action: () => {}
    };

    Robot.run();
    rawSlackMessage.text = 'test';
    Robot.handleScript(rawSlackMessage, script);
    expect(Robot.client.send).toHaveBeenCalledWith(
      rawSlackMessage.channel,
      '*ERROR:* test command can only run in certain channels.'
    );
  });

  it('should respond to text correctly if matched', () => {
    const script: Command = {
      name: 'test',
      command: 'text',
      action: jest.fn()
    };
    Robot.run();
    rawSlackMessage.text = 'text';
    Robot.handleScript(rawSlackMessage, script);
    expect(script.action).toHaveBeenCalled();

    (script.action as any).mockRestore();
    rawSlackMessage.text = 'test';
    Robot.handleScript(rawSlackMessage, script);
    expect(script.action).not.toHaveBeenCalled();
  });

  it('should respond to RegExp', () => {
    const script: Command = {
      name: 'test',
      command: /test/,
      action: jest.fn()
    };

    Robot.run();
    Robot.handleScript(rawSlackMessage, script);
    expect(script.action).toHaveBeenCalledWith(
      rawSlackMessage.text.match(script.command),
      rawSlackMessage,
      Robot.client
    );
  });
});
