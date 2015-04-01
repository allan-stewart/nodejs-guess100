var net = require('net');
var os = require('os');
var colors = require('colors');

var guessPattern = /^guess:\s*(\d+)$/;
var namePattern = /^name:\s*(.*)$/;
var maxGuesses = 1000;
var throttleMilliseconds = 4500;
var clients = [];
var scores = {};
var nicknames = {};
var secretNumber;

newGame();

net.createServer(function (socket) {
	var guessData = {
		guesses: 0,
		lastGuess: 0
	};
	
	if (isRemoteAddressAlreadyInUse(socket.remoteAddress)) {
		socket.end('You may only play one game per IP address.');
		return;
	}
	
	clients.push(socket);
	setupSocket(socket);
	initializeNickname(socket._gameId);
	initializeScore(socket._gameId);
	
	socket.on('data', function (data) {
		if (isSetNicknameMessage(data)) {
			setNickname(socket._gameId, data);
			return;
		}
		if (isMakeGuessMessage(data)) {
			handleGuess(socket, guessData, data);
			return;
		}
		socket.write('unrecognized command: ' + data);
	});
	socket.on('error', function (error) {
		if (error.code != 'ECONNRESET') {
			log(nicknames[socket._gameId] + ' errored: ' + error.message, colors.red);
		}
		disconnect(socket);
	});
	socket.on('end', function () {
		disconnect(socket);
	});
}).listen(12345);

log('Server started at ' + getServerIp() + ':12345', colors.cyan);


function isRemoteAddressAlreadyInUse(ip) {
	var matches = clients.filter(function (socket) {
		return socket.remoteAddress == ip;
	})
	return matches.length > 0;
}

function setupSocket(socket) {
	socket.setEncoding('utf8');
	socket._gameId = socket.remoteAddress;
}

function initializeNickname(gameId) {
	if (nicknames[gameId]) {
		log(nicknames[gameId] + ' reconnected', colors.grey);
	} else {
		nicknames[gameId] = gameId;
		log(nicknames[gameId] + ' connected', colors.grey);
	}
}

function initializeScore(gameId) {
	if (!scores[gameId]) {
		scores[gameId] = {name: gameId, score: 0};
	}
}

function isSetNicknameMessage(data) {
	return namePattern.test(data);
}

function setNickname(gameId, nameData) {
	var name = nameData.match(namePattern)[1];
	if (name.length > 25) {
		name = name.substring(0, 25);
	}
	log(nicknames[gameId] + ' set a new name: ' + name, colors.grey);
	nicknames[gameId] = name;
	scores[gameId].name = name;
}

function isMakeGuessMessage(data) {
	return guessPattern.test(data);
}

function handleGuess(socket, guessData, data) {
	var now = Date.now();
	if (guessData.lastGuess + throttleMilliseconds > now) {
		socket.end('You are making guesses too quickly. Please limit to 1 guess per ' + throttleMilliseconds + 'ms.');
		return;
	}
	guessData.lastGuess = now;
	
	guessData.guesses++;
	var guess = data.match(guessPattern)[1];
	
	makeGuess(socket, guess);
	
	if (guessData.guesses >= maxGuesses) {
		socket.end('You have made ' + guessData.guesses + ' guesses. Thanks for playing. Reconnect to play more.');
	}
}

function disconnect(socket) {
	var index = clients.indexOf(socket);
	clients.splice(index, 1);
	log(nicknames[socket._gameId] + ' disconnected', colors.grey);
}

function makeGuess(socket, guess) {
	log(nicknames[socket._gameId] + ' guessed ' + guess, colors.green);
	if (secretNumber < guess) {
		broadcast('? < ' + guess);
	}
	if (secretNumber > guess) {
		broadcast('? > ' + guess);
	}
	if (guess == secretNumber) {
		var message = nicknames[socket._gameId] + ' guessed the secret number: ' + secretNumber;
		log(message, colors.cyan);
		broadcast(message);
		scores[socket._gameId].score++;
		printScores();
		newGame();
	}
}

function printScores() {
	var list = [];
	for (var ipAddress in scores) {
		var item = scores[ipAddress];
		var scoreLine = (item.score + ' ' + item.name);
		if (item.name != ipAddress) {
			scoreLine += ' (' + ipAddress + ')';
		}
		list.push(scoreLine)
	}
	list.sort();
	
	log('');
	log('Scores');
	log('--------------------------------------------------');
	log(list.join('\n'));
	log('');
}

function log(message, color) {
	color = color || colors.white;
	console.log(color(message));
}

function newGame() {
	secretNumber = getRandomInt(0, 100);
	broadcast('new game');
}

function broadcast(message) {
	clients.forEach(function (socket) {
		socket.write(message);
	});
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getServerIp() {
	var wifi = os.networkInterfaces()['Wi-Fi'];
	var ip = wifi.filter(function (item) {
		return item.internal == false && item.family == 'IPv4';
	})[0].address;
	return ip;
}
