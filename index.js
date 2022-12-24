import express from 'express';
import mongoose from 'mongoose';
import Customer from './modules/customer/index.js';
import Order from './modules/order/index.js';
import Webhooks from './modules/webhooks/index.js';
import util from './util.js';
import process from './env.js';

const app = express();
app.use(express.json());

mongoose.set('strictQuery', false);
function mongoConnector() {
  try {
    mongoose.connect(process.env.mongoUrl);
    console.log('MongoDB Connection established');
  } catch (err) {
    console.log('MongoDB Error' + util.getErrorMessage(err));
  }
}

mongoose.Promise = global.Promise;

async function checker() {
  try {
    await mongoose.model('customer').findOne();
  } catch (err) {
    console.log('MongoDB Error' + util.getErrorMessage(err));
  }
}

Webhooks.init(app);
Customer.init(app);
Order.init(app);

app.get('/', (req, res) => {
  res.status(200).send('Hello, this is the WhatsApp-Railway Project');
});

//Route Errors
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(8080, () => {
  console.log('WebHook server listening at http://localhost:8080');
});

mongoConnector();
