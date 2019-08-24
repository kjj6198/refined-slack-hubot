import Robot from '../robot';

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

  it('should not response if user is not authed', () => {
    const script: Command = {
      name: 'test',
      isAuthedUser: () => false
    };

    Robot.handleScript(script);
    expect(Robot.client.send).toHaveBeenCalledWith('aa');
  });
});
