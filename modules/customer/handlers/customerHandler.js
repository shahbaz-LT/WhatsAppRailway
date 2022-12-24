import customer from '../models/index.js';

class CustomerHandler {
	async create(req,res,next){
		try {
			const body = req.body;
			const resp = await customer.create(body);
			return res.status(200).json({ message: resp });
		}
		catch (err) {
			res.status(400).json({ message: err.message});
		}
	}

	init(app) {
		app.post('/api/customer', this.create);
	}
}

export default new CustomerHandler();