import express from 'express';
import bodyParser from 'body-parser';
import notifyRouter from './routers/notify';

const app = express();

app.disable('x-powered-by');
app.enable('trust proxy');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app
  .use('/api/v1', notifyRouter)
  .use('/', (req, res, next) => {
    res.send('ok');
  })

export default app;