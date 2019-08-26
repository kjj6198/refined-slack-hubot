import express from 'express';
import bodyParser from 'body-parser';
import { Router } from 'express';
import notifyRouter from './routers/notify';
import webhookRouter from './routers/webhook';

const app = express();

const apiRouter = Router();

apiRouter.use('/webhook', webhookRouter).use('/notify', notifyRouter);

app.disable('x-powered-by');
app.enable('trust proxy');
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use('/api/v1', apiRouter);

export default app;
