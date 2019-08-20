import SlackBlock from './services/SlackBlock';
import SlackClient from './client';

class Robot {
  client: SlackClient;

  constructor(client: SlackClient) {
    this.client = client;
  }
}
