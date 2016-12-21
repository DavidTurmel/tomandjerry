
(function () {

      var socket;
      var serverGame;
      var username;
      var playerColor;
      var game;
      var board;
      var usersOnline = [];
      var myGames = [];
      socket = io();

      //////////////////////////////
      // Socket.io handlers
      //////////////////////////////

      socket.on('login', function(msg) {
        usersOnline = msg.users;
        updateUserList();
      });

      socket.on('joinlobby', function (msg) {
        addUser(msg);
      });

       socket.on('leavelobby', function (msg) {
        removeUser(msg);
      });

      socket.on('gameadd', function(msg) {

      });

      socket.on('gameremove', function(msg) {

      });

      socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );
        playerColor = msg.color;
        initGame(msg.game);
        decompte();

        $('#page-lobby').hide();
        $('#page-game').show();
        $('#background').show();

      });

      socket.on('logout', function (msg) {
        removeUser(msg.username);
      });


      //////////////////////////////
      // Menus
      //////////////////////////////

      $('#login').on('click', function() {
        username = $('#username').val();
        if (username.length > 0) {
          $('#userLabel').text(username);
          socket.emit('login', username);
          $('#page-login').hide();
          $('#page-lobby').show();
        }
      });

      var addUser = function(userId) {
        usersOnline.push(userId);
        updateUserList();
      };

      var removeUser = function(userId) {
        for (var i=0; i<usersOnline.length; i++) {
          if (usersOnline[i] === userId) {
            usersOnline.splice(i, 1);
          }
        }
        updateUserList();
      };

      var updateUserList = function() {
        document.getElementById('userList').innerHTML = '';
        usersOnline.forEach(function(user) {
          $('#userList').append($('<button>')
                        .text(user)
                        .on('click', function() {
                          socket.emit('invite',  user);
                        }));
        });
      };

      //////////////////////////////
      // Tom and Jerry Game
      //////////////////////////////

      var initGame = function (serverGameState) {
        serverGame = serverGameState;

          var cfg = {
            player: playerColor,
          };

          socket.on('update_position', function (data) {

            var player = data.player;

            var x = data.x;
            var y = data.y;

            document.getElementById(player).style.left = x;
            document.getElementById(player).style.top = y;

          });

          document.getElementById('background').style.width = "800px";
          document.getElementById('background').style.height = "446px";
          document.getElementById('background').style.left = 0;
          document.getElementById('background').style.top = 0;

          var jerry = null;

          jerry = document.createElement('div');
          jerry.id = "jerry";
          jerry.style.left = 0;
          jerry.style.top = 0;
          jerry.style.position = "absolute";
          jerry.style.width = "50px";
          jerry.style.height = "39px";
          jerry.style.backgroundImage = "url('img/jerry_50.png')";

          window.document.getElementById('background').appendChild(jerry);

          var tom = null;

          tom = document.createElement('div');
          tom.id = "tom";
          tom.style.left = 0;
          tom.style.top = 0;
          tom.style.position = "absolute";
          tom.style.width = "50px";
          tom.style.height = "53px";
          tom.style.backgroundImage = "url('img/tom_50.png')";

          window.document.getElementById('background').appendChild(tom);

          var scorejerry = 0;
          var scoretom = 0;

          // INITIALISATION DU CLAVIER
          var keysDown = {};

          window.addEventListener("keydown", function (e) {
            keysDown[e.keyCode] = true;
          });

          window.addEventListener("keyup", function (e) {
            delete keysDown[e.keyCode];
          });

          // Mise à jour du jeu quand tom attrape  jerry (ou quand jerry échape a tom)
          var reset = function () {

            jerry.style.left = '10px';
            jerry.style.top = '10px';

            tom.style.left = '740px';
            tom.style.top = '383px';

          };

          // DEPLACEMENT DES JOUEURS

          var update = function (modifier, player) {
            if (38 in keysDown) {
          		document.getElementById(player).style.top = (parseInt(document.getElementById(player).style.top)) - (256 * modifier) + 'px';
          	}
            if (40 in keysDown) {
          		document.getElementById(player).style.top = (parseInt(document.getElementById(player).style.top)) + (256 * modifier) + 'px';
          	}
            if (37 in keysDown) {
          		document.getElementById(player).style.left = (parseInt(document.getElementById(player).style.left)) - (256 * modifier) + 'px';
          	}
            if (39 in keysDown) {
          		document.getElementById(player).style.left = (parseInt(document.getElementById(player).style.left)) + (256 * modifier) + 'px';
            }

            //COLLISION ENTRE JOUEURS - SI TOM ATTRAPE JERRY
            if (
          		(parseInt(document.getElementById("jerry").style.left)) <= ((parseInt(document.getElementById("tom").style.left)) + 50)
          		&& (parseInt(document.getElementById("tom").style.left)) <= ((parseInt(document.getElementById("jerry").style.left)) + 50)
          		&& (parseInt(document.getElementById("jerry").style.top)) <= ((parseInt(document.getElementById("tom").style.top)) + (parseInt(document.getElementById("tom").style.height)))
          		&& (parseInt(document.getElementById("tom").style.top)) <= ((parseInt(document.getElementById("jerry").style.top)) + (parseInt(document.getElementById("jerry").style.height)))
          	) {
              scoretom += 1;
              $('#jerry').hide();
              $('#tom').hide();
              $('#resultat').text('Tom a attrapé Jerry !');
              setTimeout(function(){
                $('#resultat').text('');
                $('#jerry').show();
                $('#tom').show();
                reset();
              }, 3000);
          	}

            //SI LE COMPTE A REBOURS EST A ZERO - JERRY GAGNE
            if(compte == 0 || compte < 0) {
              compte = 0;
              clearInterval(timer);
              scorejerry += 1;
              $('#jerry').hide();
              $('#tom').hide();
              $('#resultat').text('Jerry a échappé à Tom !');
              setTimeout(function(){
                $('#resultat').text('');
                $('#jerry').show();
                $('#tom').show();
                reset();
              }, 3000);
              compte = 30;
            }

            if (38 in keysDown || 40 in keysDown || 37 in keysDown || 39 in keysDown) {
              if (cfg.player) {
                socket.emit('receive_position', {
                  player: cfg.player,
                  x: document.getElementById(cfg.player).style.left,
                  y: document.getElementById(cfg.player).style.top
                });
              };
            }


          };

          var checkCollision = function(player){
            //COLLISION AVEC LA MAP - BAS HAUT DROITE ET GAUCHE
            if (((parseInt(document.getElementById(player).style.left))+50) >= (parseInt(document.getElementById("background").style.width))) {
              document.getElementById(player).style.left = '750px';
            }else if (((parseInt(document.getElementById(player).style.top))+(parseInt(document.getElementById(player).style.height))) >= (parseInt(document.getElementById("background").style.height))) {
              document.getElementById(player).style.top = (parseInt(document.getElementById('background').style.height)-(parseInt(document.getElementById(player).style.height)))+'px';
            }else if ((parseInt(document.getElementById(player).style.left)) <= (parseInt(document.getElementById("background").style.left))) {
              document.getElementById(player).style.left = '0px';
            }else if (((parseInt(document.getElementById(player).style.top))) <= (parseInt(document.getElementById("background").style.top))) {
              document.getElementById(player).style.top = '0px';
            }

            //COLLISION AVEC LA MAP - COIN BAS DROITE
            if ((((parseInt(document.getElementById(player).style.left))+50) >= (parseInt(document.getElementById("background").style.width))) &&
            (((parseInt(document.getElementById(player).style.top))+(parseInt(document.getElementById(player).style.height))) >= (parseInt(document.getElementById("background").style.height)))) {
              document.getElementById(player).style.left = '750px';
              document.getElementById(player).style.top = (parseInt(document.getElementById('background').style.height)-(parseInt(document.getElementById(player).style.height)))+"px";
            //COLLISION AVEC LA MAP - COIN HAUT DROITE
          }else if (((parseInt(document.getElementById(player).style.left))+50) >= (parseInt(document.getElementById("background").style.width)) &&
            (parseInt(document.getElementById(player).style.top)) <= (parseInt(document.getElementById("background").style.top))) {
              document.getElementById(player).style.left = '750px';
              document.getElementById(player).style.top = '0px';
            }

            //COLLISION AVEC LA MAP - COIN BAS GAUCHE
            if (((parseInt(document.getElementById(player).style.left)) <= (parseInt(document.getElementById("background").style.left))) &&
            (((parseInt(document.getElementById(player).style.top))+(parseInt(document.getElementById(player).style.height))) >= (parseInt(document.getElementById("background").style.height)))) {
              document.getElementById(player).style.left = '0px';
              document.getElementById(player).style.top = (parseInt(document.getElementById('background').style.height)-(parseInt(document.getElementById(player).style.height)))+"px";
            //COLLISION AVEC LA MAP - COIN HAUT GAUCHE
            }else if ((parseInt(document.getElementById(player).style.left)) <= (parseInt(document.getElementById("background").style.left)) &&
              (parseInt(document.getElementById(player).style.top)) <= (parseInt(document.getElementById("background").style.top))){
                document.getElementById(player).style.left = '0px';
                document.getElementById(player).style.top = '0px';
            }

          }

          // The main game loop
          var main = function () {
          	var now = Date.now();
          	var delta = now - then;

          	update(delta / 1000, cfg.player);

            checkCollision(cfg.player);

          	then = now;

          	// Request to do this again ASAP
          	requestAnimationFrame(main);
          };

          // Cross-browser support for requestAnimationFrame
          var w = window;
          requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

          // Let's play this game!
          var then = Date.now();
          reset();
          main();

      }

})();
