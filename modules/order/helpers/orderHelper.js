import order from '../models/index.js';
import customerHelper from '../../customer/helpers/customerHelper.js';
import util from '../../../util.js';
class OrderHelper {
  async createOrder(phoneNumber, data) {
    try {
      console.log('In Order Creation : ');
      const customerId = await customerHelper.getCustomerIdFromPhoneNumber(phoneNumber);
      data['customer_id'] = customerId;
      const newOrder = await order.create(data);
      console.log(newOrder);
      return newOrder;
    } catch (err) {
      console.log(`<--- Error in Creating Order for Phoen Number ${phoneNumber} --->`);
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }

  async getOrderById(orderId) {
    try {
      const currOrder = await order.findById(orderId);
      return currOrder;
    } catch (err) {
      console.log('<--- Error in Fetching Order from OrderId --->');
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }

  async getOrderListFromPhoneNumber(phoneNumber) {
    try {
      const customerId = await customerHelper.getCustomerIdFromPhoneNumber(phoneNumber);
      const orderResult = await order.find({
        customer_id: customerId,
      });
      return orderResult;
    } catch (err) {
      console.log(`<--- Error in Fetching Order List from Phone Number : ${phoneNumber}  --->`);
      console.log('Error is : ' + util.getErrorMessage(err));
    }
  }
}

export default new OrderHelper();
