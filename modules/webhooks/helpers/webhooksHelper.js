import WhatsappCloudAPI from 'whatsappcloudapi_wrapper';
import util from '../../../util.js';
import constants from '../../../constants.js';
import sessionHelper from '../../session/helpers/sessionHelper.js';
import orderHelper from '../../order/helpers/orderHelper.js';
import process from '../../../env.js';

class WebhooksHelper {
  initializeWhatsApp() {
    try {
      const whatsApp = new WhatsappCloudAPI({
        accessToken: process.env.TOKEN,
        senderPhoneNumberId: 102000939437482,
        WABA_ID: '106715428957194',
        graphAPIVersion: 'v13.0',
      });

      console.log('Whatsapp Cloud API Wrapper Working');
      return whatsApp;
    } catch (err) {
      console.log('<--- Error in Initialize WhatsApp Object --->');
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }

  async validReplyMessageSender(whatsApp, recipientPhone) {
    await whatsApp.sendText({
      message: 'Please select a valid reply to proceed further.',
      recipientPhone: recipientPhone,
    });
  }

  async exitReplyMessageSender(whatsApp, recipientPhone, phoneNumber) {
    const updatedSession = await sessionHelper.restartSession(phoneNumber);
    await whatsApp.sendText({
      message: 'Thank you for using LetsTransport WhatsApp Services',
      recipientPhone: recipientPhone,
    });
  }

  async unknownUserFlow(whatsApp, recipientPhone, recipientName, typeOfMessage, phoneNumber, incomingMessage) {
    try {
      if (typeOfMessage === 'text_message') {
        await whatsApp.sendSimpleButtons({
          message: `Hey ${recipientName},
        \nWelcome to the LetsTransport WhatsApp Service.
        \nAre you a Customer or a Broker ?`,
          recipientPhone: recipientPhone,
          listOfButtons: constants.simpleButtonListForUnknown,
        });
      } else if (typeOfMessage === 'simple_button_message') {
        const buttonId = incomingMessage.button_reply.id;

        if (buttonId === 'user_is_customer') {
          console.log('User is customer');
          const updatedSession = await sessionHelper.updateMultipleFieldsInSession(
            phoneNumber,
            ['user_type'],
            [constants.sessionUserTypes.customer]
          );
          await whatsApp.sendSimpleButtons({
            message: 'What action do you want to perform ?',
            recipientPhone: recipientPhone,
            listOfButtons: constants.simpleButtonListForCustomer,
          });
        }

        if (buttonId === 'user_is_broker') {
          const updatedSession = await sessionHelper.updateMultipleFieldsInSession(
            phoneNumber,
            ['user_type'],
            [constants.sessionUserTypes.broker]
          );
        }
      } else {
        await this.validReplyMessageSender(whatsApp, recipientPhone);
      }
    } catch (err) {
      console.log('<--- Error in Unknown User Flow --->');
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }

  async customerUserFlow(whatsApp, recipientPhone, typeOfMessage, phoneNumber, incomingMessage, currSession) {
    try {
      if (typeOfMessage === 'text_message') {
        let val, data, updatedSession;
        switch (currSession.step) {
          case constants.sessionSteps.one:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.one] = val;
            updatedSession = await sessionHelper.updateMultipleFieldsInSession(
              phoneNumber,
              ['step', 'data'],
              [constants.sessionSteps.two, data]
            );
            await whatsApp.sendText({
              message: 'Please enter the Source Pincode',
              recipientPhone: recipientPhone,
            });

            break;

          case constants.sessionSteps.two:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.two] = val;
            updatedSession = await sessionHelper.updateMultipleFieldsInSession(
              phoneNumber,
              ['step', 'data'],
              [constants.sessionSteps.three, data]
            );

            await whatsApp.sendText({
              message: 'Please enter the Destination Address',
              recipientPhone: recipientPhone,
            });
            break;

          case constants.sessionSteps.three:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.three] = val;
            updatedSession = await sessionHelper.updateMultipleFieldsInSession(
              phoneNumber,
              ['step', 'data'],
              [constants.sessionSteps.four, data]
            );

            await whatsApp.sendText({
              message: 'Please enter the Destination Pincode',
              recipientPhone: recipientPhone,
            });
            break;

          case constants.sessionSteps.four:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.four] = val;
            updatedSession = await sessionHelper.updateMultipleFieldsInSession(
              phoneNumber,
              ['step', 'data'],
              [constants.sessionSteps.five, data]
            );

            await whatsApp.sendText({
              message: 'Please enter the Volume of the order',
              recipientPhone: recipientPhone,
            });
            break;

          case constants.sessionSteps.five:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.five] = parseInt(val);
            updatedSession = await sessionHelper.updateMultipleFieldsInSession(
              phoneNumber,
              ['step', 'data'],
              [constants.sessionSteps.six, data]
            );

            await whatsApp.sendText({
              message: 'Please enter the Weight of the order',
              recipientPhone: recipientPhone,
            });
            break;

          case constants.sessionSteps.six:
            val = incomingMessage.text.body.trim();
            data = currSession.data;
            data[constants.customerStepsForPlacingOrder.six] = parseInt(val);
            const newOrder = orderHelper.createOrder(phoneNumber, data);

            await whatsApp.sendText({
              message: `Order Created Successfully, with Order-ID  : ${newOrder.id}`,
              recipientPhone: recipientPhone,
            });
            await whatsApp.sendSimpleButtons({
              message: 'What would you like to do next ?',
              recipientPhone: recipientPhone,
              listOfButtons: constants.simpleButtonListForCustomerWithExit,
            });
            break;

          case constants.sessionSteps.seven:
            break;

          case constants.sessionSteps.eight:
            break;

          case constants.sessionSteps.nine:
            val = parseInt(incomingMessage.text.body.trim());
            const currOrder = orderHelper.getOrderById(currSession.data.orderMap[val]);

            if (util.isUndefined(currOrder)) {
              await this.validReplyMessageSender(whatsApp, recipientPhone);
            } else {
              await whatsApp.sendText({
                message: `Order Id is valid. Order's volume is ${currOrder.volume}`,
                recipientPhone: recipientPhone,
              });
              await whatsApp.sendSimpleButtons({
                message: 'What would you like to do next ?',
                recipientPhone: recipientPhone,
                listOfButtons: constants.simpleButtonListForCustomerWithExit,
              });
            }
            break;

          default:
            break;
        }
      } else if (typeOfMessage === 'simple_button_message') {
        const buttonId = incomingMessage.button_reply.id;
        if (buttonId === 'place_order') {
          const updatedSession = await sessionHelper.updateMultipleFieldsInSession(
            phoneNumber,
            ['step'],
            [constants.sessionSteps.one]
          );
          console.log('User initiated to Place Order');
          await whatsApp.sendText({
            message: 'Please enter the Source Address',
            recipientPhone: recipientPhone,
          });
        }

        if (buttonId === 'get_order_status') {
          const orderList = await orderHelper.getOrderListFromPhoneNumber(phoneNumber);

          if (orderList.length === 0) {
            await whatsApp.sendText({
              message: 'You have no active orders at this moment.',
              recipientPhone: recipientPhone,
            });
            await this.exitReplyMessageSender(whatsApp, recipientPhone, phoneNumber);
          }

          data = currSession.data;
          data.orderMap = new map();
          let currMsg = '';
          for (let i = 0; i < orderList.length; i++) {
            currMsg = currMsg.concat(`Press *${i + 1}* for Order-ID - *${orderList[i]._id}* from 
            ${orderList[i].source_address} to ${orderList[i].destination_address}. \n`);

            data.orderMap[i] = orderList[i]._id;
          }

          updatedSession = await sessionHelper.updateMultipleFieldsInSession(
            phoneNumber,
            ['step', 'data'],
            [constants.sessionSteps.nine, data]
          );

          await whatsApp.sendText({
            message: currMsg,
            recipientPhone: recipientPhone,
          });
          console.log('Customer initiated to Track Order');
        }
        if (buttonId === 'exit') {
          await this.exitReplyMessageSender(whatsApp, recipientPhone, phoneNumber);
        }
      } else {
        await this.validReplyMessageSender(whatsApp, recipientPhone);
      }
    } catch (err) {
      console.log('<--- Error in Customer Flow --->');
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }

  async brokerUserFlow(whatsApp, recipientPhone, typeOfMessage, phoneNumber, incomingMessage, currSession) {
    try {
      if (typeOfMessage === 'text_message') {
      } else if (typeOfMessage === 'simple_button_message') {
        const buttonId = incomingMessage.button_reply.id;

        if (buttonId === 'update_order_status') {
          currSession = await sessionHelper.updateMultipleFieldsInSession(
            phoneNumber,
            ['step'],
            [constants.sessionSteps.two]
          );
        }

        if (buttonId === 'exit') {
          await this.exitReplyMessageSender(whatsApp, recipientPhone, phoneNumber);
        }
      } else {
        await this.validReplyMessageSender(whatsApp, recipientPhone);
      }
    } catch (err) {
      console.log('<--- Error in Broker Flow --->');
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }
}

export default new WebhooksHelper();
