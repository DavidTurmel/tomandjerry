var express = require('express');
var app = express();
var http = require('http').Server(app).listen(80,'104.46.38.91');;
var io = require('socket.io')(http);

var lobbyUsers = {};
var users = {};
var activeGames = {};

app.use(express.static('public'));

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  console.log('new connection ' + socket.id);

  socket.on('login', function(userId) {
    console.log(userId + ' joining lobby');
    socket.userId = userId;

    if (!users[userId]) {
      console.log('creating new user');
      users[userId] = {userId: socket.userId, games:{}};
    } else {
      console.log('user found!');
      Object.keys(users[userId].games).forEach(function(gameId) {
        console.log('gameid - ' + gameId);
      });
    }

    socket.emit('login', {users: Object.keys(lobbyUsers),
                          games: Object.keys(users[userId].games)});

    lobbyUsers[userId] = socket;

    socket.broadcast.emit('joinlobby', socket.userId);
  });

  socket.on('invite', function(opponentId) {

    console.log('got an invite from: ' + socket.userId + ' --> ' + opponentId);

    socket.broadcast.emit('leavelobby', socket.userId);
    socket.broadcast.emit('leavelobby', opponentId);

    var game = {
      id: Math.floor((Math.random() * 100) + 1),
      users: {jerry: socket.userId, tom: opponentId}
    };

    socket.gameId = game.id;
    activeGames[game.id] = game;

    users[game.users.jerry].games[game.id] = game.id;
    users[game.users.tom].games[game.id] = game.id;

    console.log('starting game: ' + game.id);
    lobbyUsers[game.users.jerry].emit('joingame', {game: game, color: 'jerry'});
    lobbyUsers[game.users.tom].emit('joingame', {game: game, color: 'tom'});

    delete lobbyUsers[game.users.jerry];
    delete lobbyUsers[game.users.tom];

    socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});

  });

  var lastPosition = { x: 0, y: 0 };
  var players;

  socket.emit('update_position', lastPosition, function(){
    console.log('envoi des données au client')
  });

  socket.on('receive_position', function (data) {
    console.log('réception des données côté serveur');
     lastPosition = data;
    console.log(lastPosition.xjerry);
    console.log(lastPosition.xtom);
     socket.broadcast.emit('update_position', data); // send `data` to all other clients
  });

  socket.on('disconnect', function(msg) {

    console.log(msg);

    if (socket && socket.userId && socket.gameId) {
      console.log(socket.userId + ' disconnected');
      console.log(socket.gameId + ' disconnected');
    }

    delete lobbyUsers[socket.userId];

    socket.broadcast.emit('logout', {
      userId: socket.userId,
      gameId: socket.gameId
    });

  });

  /////////////////////
  // Dashboard messages
  /////////////////////

  socket.on('dashboardlogin', function() {
    console.log('dashboard joined');
    socket.emit('dashboardlogin', {games: activeGames});
  });

});

http.listen(80, function() {
    console.log('listening on *: ' + 80);
});
