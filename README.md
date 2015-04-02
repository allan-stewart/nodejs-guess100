# nodejs-guess100

A simple game for learning Node.js sockets.

In this game, the server picks a number between 0 and 100 (inclusive).
Clients connect to the server to make guesses.
The server gives feedback about each guess to all clients.
The client that correctly guesses the number gets a point, then the game restarts.


## Running the Server

Run `npm install` to download the dependencies,
then `node server.js` to start the server.
Use `Ctrl+C` to stop the server.


## Creating a Client

There are a number of possible messages that the server can send to a client.
They will all be strings, so setting `socket.setEncoding('utf8')`
may make things easier, as will writing out the data to the console.

There are 3 specific message types you should look for:

* `new game` - the server sends this when it's time to start guessing a new number.
* `? > 13` - the secret number is greater than 13.
* `? < 97` - the secret number is less than 97.

To send a guess, you need to write a string like this to the socket: `guess: 50`

The client can also specify a nickname to identify itself instead
of by IP address: `name: John Doe`

There are also a couple other rules:

* You can only have one client per IP address.
* The client will be disconnected if it makes requests too quickly.


## Example Clients

There are two example clients provided:

* `randomClient.js` just makes random guesses every 5 seconds.
    Usage: `node randomClient.js [name] [serverIP]`
    * `name` is the client name to send to the server. Defaults to `randomizer`.
    * `serverIP` is the IP address of the server. Defaults to `localhost`.
* `binarySearchClient.js` uses a binary search to make guesses.
    Usage: `node randomClient.js [name] [serverIP]`
    * `name` is the client name to send to the server. Defaults to `BinarySearch`.
    * `serverIP` is the IP address of the server. Defaults to `localhost`.
