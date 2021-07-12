const Client = require('../model/client');


module.exports.render = async (req, res) => {
	try {
		const clients = await Client.find({ attended: false }).sort({ endDate: 'desc' });
		let queues = [[], []];
		for (let i = 0; i < clients.length; i++) {
			if (clients[i].endDate.getTime() < Date.now()) {
				clients[i].attended = true;
				clients[i].id = null;
				await clients[i].save();
				clients.splice(i, 1);
				continue;
			}

			switch (clients[i].queue) {
				case 0:
					queues[0].push(clients[i]);
					break;
				case 1:
					queues[1].push(clients[i]);
					break;
				default:
					console.log(`error: ${clients[i].queue}`);
			}
		}

		res.render('index', { clients: queues });
	} catch (error) {
		console.log(error);
		res.redirect('/');
	}
}

module.exports.create = async (req, res) => {
	try {
		const newClient = req.body;
		const clients = await Client.find({ attended: false }).sort({ endDate: 'desc' });

		//* basic server-side validation
		if (!newClient.id || !newClient.name) {
			throw new Error('Required data is empty');
		} else {
			for (let i = 0; i < clients.length; i++) {
				if (clients[i].id == newClient.id) {
					throw new Error('Client already booked in queue');
					//break;
				}
			}
		}


		//* choose fastest queue
		let timeQueue0 = 0;
		let timeQueue1 = 0;
		let lastClientInLine = [];
		for (let i = 0; i < clients.length; i++) {
			if (clients[i].endDate.getTime() < Date.now()) {
				clients[i].attended = true;
				clients[i].id = null;
				await clients[i].save();
				continue;
			}
			console.log('entering: ' + clients[i]);

			switch (clients[i].queue) {
				case 0:
					timeQueue0 += clients[i].endDate.getTime() - Date.now();
					lastClientInLine[0] = clients[i];
					break;
				case 1:
					timeQueue1 += clients[i].endDate.getTime() - Date.now();
					lastClientInLine[1] = clients[i];
					break;
				default:
					console.log(`error: ${clients[i].queue}`);
			}
		}

		if (timeQueue0 < timeQueue1) {
			newClient.queue = 0
		} else {
			newClient.queue = 1;
		}


		//* assign time
		if (clients.length !== 0 && lastClientInLine[newClient.queue]) {
			newClient.startDate = new Date(lastClientInLine[newClient.queue].endDate.getTime());
		} else {
			newClient.startDate = new Date(Date.now());
		}

		switch (newClient.queue) {
			case 0:
				newClient.endDate = new Date(newClient.startDate.getTime() + 2 * 60 * 1000); // min * s * ms
				break;
			case 1:
				newClient.endDate = new Date(newClient.startDate.getTime() + 3 * 60 * 1000); // min * s * ms
				break;
			default:
				console.log(`error: ${newClient.queue}`);
		}


		//* save in db
		const client = new Client(newClient);
		await client.save();
	} catch (error) {
		console.log(error.message);
	} finally {
		res.redirect('/');
	}
}