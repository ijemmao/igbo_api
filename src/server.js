import express from 'express';
import mongoose from 'mongoose';
import { testRouter, router } from './routers';
import logger from './middleware/logger';
import { PORT, MONGO_URI, SWAGGER_OPTIONS } from './config';

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('🗄 Database is connected');
});

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.use('*', logger);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(SWAGGER_OPTIONS)));

/* Grabs data from MongoDB */
app.use('/api/v1/search', router);

/* Grabs data from JSON dictionary */
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/v1/test', testRouter);
}

const server = app.listen(PORT, () => {
  console.log(`🟢 Server started on port ${PORT}`);
});

server.clearDatabase = () => {
  mongoose.connection.db.dropDatabase();
};

export default server;
