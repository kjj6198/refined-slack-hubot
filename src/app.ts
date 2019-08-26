import server from './server';
import Robot from './robot';

require('dotenv').config();

server.listen(process.env.PORT || 8080);
Robot.run();
