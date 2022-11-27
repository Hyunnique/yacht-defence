const mongoose = require('mongoose');

function connect() {
	return new Promise(function(resolve, reject) {
		if (process.env.NODE_ENV !== 'production') {
			mongoose.set('debug', true);
		}
		mongoose.set('bufferCommands', true);

		mongoose.connect('mongodb+srv://yachtDefense:FblN8p3793iipdvB@hyunnique-cluster.c531o.mongodb.net/yacht-defense?retryWrites=true&w=majority',
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => {
			resolve("connected");
		})
		.catch(err => {
			reject(err);
		});
	});
	
}

mongoose.connection.on('disconnected', () => {
	setTimeout(connect, 5000);
});
	
module.exports.connect = connect;
module.exports.PlayData = require('./PlayData');