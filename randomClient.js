var net = require('net');

var name = process.argv[2] || 'randomizer';
var connectionOptions = {
	host: process.argv[3] || 'localhost',
	port: 12345
};
var socket = null;

start();
setInterval(makeGuess, 5000);

function start() {
	socket = net.connect(connectionOptions, function () {
		socket.write('name: ' + name);
	});
	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		console.log(data);
	});
	socket.on('end', function () {
		socket = null;
		setTimeout(start, 5000);
	});
}

function makeGuess() {
	if (socket) {
		socket.write('guess: ' + getRandomInt(0, 100));
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
