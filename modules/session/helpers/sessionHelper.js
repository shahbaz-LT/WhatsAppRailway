import session from '../models/index.js';
import util from '../../../util.js';
import constants from '../../../constants.js';

class SessionHelper {
	async createNewSessionFromPhoneNumber(phoneNumber) {
		try {
			const body = {};
			body.user_phone = phoneNumber;
			const res = await session.create(body);
			return res;
		} catch (err) {
			console.log(
				`<--- Error in Creating Session for Mobile Number -> : ${phoneNumber} --->`
			);
			console.log('Error is : ' + util.getErrorMessage(err));
		}
	}

	async getSessionFromPhoneNumber(phoneNumber) {
		try {
			const res = await session.findOne({ user_phone: phoneNumber });
			return res;
		} catch (err) {
			console.log(
				`<--- Error in Fetching Session from Mobile Number :${phoneNumber} --->`
			);
			console.log('Error is : ' + util.getErrorMessage(err));
		}
	}

	async updateMultipleFieldsInSession(phoneNumber, fieldsToUpdate, newValues) {
		try {
			const updateQuery = util.setUpdateMultipleFieldsQueryMaker(
				fieldsToUpdate,
				newValues
			);
			updateQuery.returnNewDocument = true;
			const res = await session.findOneAndUpdate(
				{ user_phone: phoneNumber },
				updateQuery
			);
			return res;
		} catch (err) {
			console.log(
				`<--- Error in Updating Multiple Field of Session from Mobile Number :${phoneNumber} --->`
			);
			console.log('Error is : ' + util.getErrorMessage(err));
		}
	}

	async restartSession(phoneNumber) {
		try {
			const res = await this.updateMultipleFieldsInSession(
				phoneNumber,
				['user_type', 'step', 'data'],
				[constants.sessionUserTypes.unknown, constants.sessionSteps.zero, {}]
			);
			console.log('Restarting Session ');
			return res;
		} catch (err) {
			console.log(
				`<--- Error in Restarting Session from Mobile Number :${phoneNumber} --->`
			);
			console.log('Error is : ' + util.getErrorMessage(err));
		}
	}

	async getValidSessionFromPhoneNumber(phoneNumber) {
		try {
			const oldSession = await this.getSessionFromPhoneNumber(phoneNumber);
			if (!util.isUndefined(oldSession)) {
				const minuteDifference = util.getTimeDifferenceInMinutes(new Date(oldSession.updated_at).getTime(), Date.now());
				if (minuteDifference >= constants.sessionValidity) {
					const restartedSession = this.restartSession(phoneNumber);
					return restartedSession;
				} else {
					return oldSession;
				}
			} else {
				const newSession = await this.createNewSessionFromPhoneNumber(
					phoneNumber
				);
				return newSession;
			}
		} catch (err) {
			console.log(
				`<--- Error in getting Valid Session from Mobile Number :${phoneNumber} --->`
			);
			console.log('Error is : ' + util.getErrorMessage(err));

		}
	}

	// async addKeyValueInDataOfSessionUsingPhoneNumber(phoneNumber, key, value) {
	//   try{
	//      const currSession = await this.getSessionFromPhoneNumber(phoneNumber);
	//      const prevData = currSession.data;
	//      prevData[key] = value;
	//      return prevData;
	//   }
	//   catch(err){
	//     console.log(
	//       `<--- Error in adding ${key} in Data Field of Session of  Mobile Number :${phoneNumber} --->`
	//     );
	//     console.log("Error is : " + util.getErrorMessage(err));
	//   }
	// }
}

export default new SessionHelper();
