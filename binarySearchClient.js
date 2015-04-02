var net = require('net');

var name = process.argv[2] || 'BinarySearch';
var connectionOptions = {
	host: process.argv[3] || 'localhost',
	port: 12345
};

var pattern = /^\?\s+([<>])\s+(\d+)$/;
var min = 0;
var max = 100;

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
		if (data.indexOf('new game') >= 0) {
			min = 0;
			max = 100;
		}
		if (pattern.test(data)) {
			var matches = data.match(pattern);
			var number = parseInt(matches[2], 10);
			if (matches[1] == '>') {
				min = Math.max(min, number + 1);
			} else {
				max = Math.min(max, number - 1);
			}
		}
	});

	socket.on('end', function () {
		socket = null;
		setTimeout(start, 5000);
	});
}

function makeGuess() {
	if (socket) {
		var guess = Math.round((max - min) / 2) + min;
		socket.write('guess: ' + guess);
	}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
