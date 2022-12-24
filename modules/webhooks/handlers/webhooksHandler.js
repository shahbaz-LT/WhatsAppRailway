import webhooksHelper from '../helpers/webhooksHelper.js';
import orderHelper from '../../order/helpers/orderHelper.js';
import sessionHelper from '../../session/helpers/sessionHelper.js';
import util from '../../../util.js';
import constants from '../../../constants.js';
import e from 'express';

class WebhooksHandler {
  verifyCallback(req, res) {
    var mode = req.query['hub.mode'];
    var token = req.query['hub.verify_token'];
    var challenge = req.query['hub.challenge'];

    console.log('-------------- New Request GET --------------');
    console.log('Headers:' + JSON.stringify(req.headers, null, 3));
    console.log('Body:' + JSON.stringify(req.body, null, 3));
    console.log('Request Query is : ' + JSON.stringify(req.query, null, 3));

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === '12345') {
        // Respond with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        console.log('Responding with 403 Forbidden');
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    } else {
      console.log('Replying Thank you.');
      res.json({ message: 'Thank you for the message' });
    }
  }

  async chatBot(req, res, next) {
    console.log('-------------- New Request POST --------------');
    console.log('Headers:' + JSON.stringify(req.headers, null, 3));
    console.log('Body:' + JSON.stringify(req.body, null, 3));
    const whatsApp = webhooksHelper.initializeWhatsApp();
    const msgData = whatsApp.parseMessage(req.body);
    if (msgData?.isMessage) {
      try {
        const incomingMessage = msgData.message;
        // extract the phone number of sender
        const recipientPhone = incomingMessage.from.phone;
        //extract the name of the sender
        const recipientName = incomingMessage.from.name;
        // extract the type of message (some are text, others are images, others are responses to buttons etc...)
        const typeOfMessage = incomingMessage.type;
        // extract the message id
        const messageId = incomingMessage.message_id;
        const phoneNumber = util.getTenDigitPhoneNumber(recipientPhone);

        const currSession = await sessionHelper.getValidSessionFromPhoneNumber(phoneNumber);

        switch (currSession.user_type) {
          case constants.sessionUserTypes.unknown:
            await webhooksHelper.unknownUserFlow(
              whatsApp,
              recipientPhone,
              recipientName,
              typeOfMessage,
              phoneNumber,
              incomingMessage
            );
            break;

          case constants.sessionUserTypes.customer:
            await webhooksHelper.customerUserFlow(
              whatsApp,
              recipientPhone,
              typeOfMessage,
              phoneNumber,
              incomingMessage,
              currSession
            );
            break;

          case constants.sessionUserTypes.broker:
            await webhooksHelper.brokerUserFlow(
              whatsApp,
              recipientPhone,
              typeOfMessage,
              phoneNumber,
              incomingMessage,
              currSession
            );
            break;

          default:
            await whatsApp.sendText({
              message: 'User not registered. Kindly contact LetsTransport',
              recipientPhone: recipientPhone,
            });
            break;
        }
        await whatsApp.markMessageAsRead({
          messageId,
        });
        return res.sendStatus(200);
      } catch (error) {
        console.log('<--- Error in catch block of /api/webhook POST Method --->');
        console.log('Error is : ' + util.getErrorMessage(err));
        return res.sendStatus(500);
      }
    }
  }

  init(app) {
    app.get('/api/webhook', this.verifyCallback);
    app.post('/api/webhook', this.chatBot);
  }
}

export default new WebhooksHandler();
