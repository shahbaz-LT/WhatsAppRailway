import mongoose from 'mongoose';
import pkg from 'validator';
import constants from '../../../constants.js';
const { isMobilePhone, isInt } = pkg;

const sessionSchema = mongoose.Schema(
	{
		user_phone: {
			type: String,
			validate: [isMobilePhone, 'Invalid phone number'],
			required: [true, 'User Phone Number required'],
			unique: [true, 'Session with entered Phone Number Already Exists'],
		},
		user_type: {
			type: String,
			enum: Object.values(constants.sessionUserTypes),
			default: constants.sessionUserTypes.unknown,
		},
		step: {
			type: String,
			enum: Object.values(constants.sessionSteps),
			default: constants.sessionSteps.zero,
			validate: [isInt, 'Step value should be an integer'],
		},
		data: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const session = mongoose.model('session', sessionSchema);
export default session;
