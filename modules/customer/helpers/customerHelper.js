import customer from '../models/index.js';
import util from '../../../util.js';

class CustomerHelper{

	async getCustomerIdFromPhoneNumber(phoneNumber){
		try {
			const customerRes = await customer.findOne({phone : phoneNumber});
			return customerRes._id;
		}
		catch(err){
			console.log(`<--- Error in Fetching Customer ID from Phone Number for ${phoneNumber} --->`);
			console.log('Error is : ' + util.getErrorMessage(err));
		}
	}
}

export default new CustomerHelper();