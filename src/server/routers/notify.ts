import { Router, Request, Response, NextFunction } from 'express';
const notifyRouter = Router();
import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.HUBOT_SLACK_TOKEN);

notifyRouter.post('/notify', (req: Request, res: Response) => {
  const {
    channel,
    message,
    blocks,
    attachments,
    thread_ts,
  } = req.body;

  if (channel) {
    client.chat.postMessage({
      channel,
      text: message || '',
      blocks,
      attachments,
      as_user: true,
      thread_ts,
    }).then(result => {
      if (result.ok) {
        res.status(200).json({
          message: 'ok'
        });
      }
    }).catch(err => {
      res.status(400).json(err);
    });

    return;
  }

  res.status(400).json({
    message: 'missing channelId or related information',
  });
});

export default notifyRouter;