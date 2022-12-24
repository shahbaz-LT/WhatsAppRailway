function isUndefined(str, emptyStringCheck) {
	if (
		typeof str === 'undefined' ||
    str === null ||
    str === 'undefined' ||
    str === 'null'
	) {
		return true;
	}
	if (
		emptyStringCheck &&
    typeof str === 'string' &&
    str.toString().trim().length === 0
	) {
		return true;
	}
	return false;
}

function getTenDigitPhoneNumber(phoneNumber) {
	return phoneNumber.substring(2);
}

function setUpdateMultipleFieldsQueryMaker(fieldsToUpdate, newValues) {
	const updateQuery = { $set: {} };
	for (let i = 0; i < fieldsToUpdate.length; i++) {
		updateQuery.$set[fieldsToUpdate[i]] = newValues[i];
	}
	return updateQuery;
}

function getErrorMessage(
	err,
	defaultErrorMessage = ' Internal Server Error'
) {
	let errorMessage;
	if (!isUndefined(err) && !isUndefined(err.message, true)) {
		errorMessage = err.message;
	} else if (!isUndefined(err)) {
		errorMessage = err;
	} else {
		errorMessage = defaultErrorMessage;
	}
	if (typeof errorMessage != 'string') {
		errorMessage = JSON.stringify(errorMessage);
	}
	return errorMessage;
}

function getTimeDifferenceInMinutes(date1,date2){
	const differenceInMilliSeconds = Math.abs(date1 - date2);
	const differenceInMinutes = (Math.floor((differenceInMilliSeconds)/1000))/60;

	return differenceInMinutes;
}
export default {
	isUndefined: isUndefined,
	getTenDigitPhoneNumber: getTenDigitPhoneNumber,
	setUpdateMultipleFieldsQueryMaker: setUpdateMultipleFieldsQueryMaker,
	getErrorMessage: getErrorMessage,
	getTimeDifferenceInMinutes : getTimeDifferenceInMinutes,
};