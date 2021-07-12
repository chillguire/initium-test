const express = require('express');
const router = express.Router();

const queue = require('../controller/queue');


router.route('/')
	.get(queue.render)
	.post(queue.create);

module.exports = router;