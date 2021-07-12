const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const mongoose = require('mongoose');


//** DB CONFIG
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/customerSupport';
mongoose.connect(dbURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
	console.log('DB connected');
});

//** APP CONFIG
//? general
app.use(express.urlencoded({ extended: true, }));
// app.use(express.json());

//? views and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//** ROUTES
const queueRoutes = require('./routes/queue');
app.use('/', queueRoutes);

app.all('*', (req, res, next) => {
	res.sendStatus(404);
});

//** APP.LISTEN
const port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log(`Running: ${port}`);
});