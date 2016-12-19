
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
            console.log("données reçues");

            var xjerry = data.xjerry;
            var yjerry = data.yjerry;
            var xtom = data.xtom;
            var ytom = data.ytom;

            document.getElementById('jerry').style.left = xjerry;
            document.getElementById('jerry').style.top = yjerry;
            document.getElementById('tom').style.left = xtom;
            document.getElementById('tom').style.top = ytom;
          });

          document.getElementById('background').style.width = "512px";
          document.getElementById('background').style.height = "480px";
          document.getElementById('background').style.left = 0;
          document.getElementById('background').style.top = 0;

          var jerry = null;

          jerry = document.createElement('div');
          jerry.id = "jerry";
          jerry.style.left = 0;
          jerry.style.top = 0;
          jerry.style.position = "absolute";
          jerry.style.width = "20px";
          jerry.style.height = "20px";
          jerry.style.backgroundColor = "blue";

          window.document.getElementById('background').appendChild(jerry);

          var tom = null;

          tom = document.createElement('div');
          tom.id = "tom";
          tom.style.left = 0;
          tom.style.top = 0;
          tom.style.position = "absolute";
          tom.style.width = "20px";
          tom.style.height = "20px";
          tom.style.backgroundColor = "red";

          window.document.getElementById('background').appendChild(tom);

          var scorejerry = 0;
          var scoretom = 0;

          console.log(scoretom);

          // INITIALISATION DU CLAVIER
          var keysDown = {};

          window.addEventListener("keydown", function (e) {
            keysDown[e.keyCode] = true;
          });

          window.addEventListener("keyup", function (e) {
            delete keysDown[e.keyCode];
          });

          socket.on('refreshUsers', function(users){
            console.log(users.jerry);
          });

          // Mise à jour du jeu quand tom attrape  jerry (ou quand jerry échape a tom)
          var reset = function () {

            jerry.style.left = '10px';
            jerry.style.top = '10px';

            tom.style.left = '482px';
            tom.style.top = '450px';

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
          		(parseInt(document.getElementById("jerry").style.left)) <= ((parseInt(document.getElementById("tom").style.left)) + 20)
          		&& (parseInt(document.getElementById("tom").style.left)) <= ((parseInt(document.getElementById("jerry").style.left)) + 20)
          		&& (parseInt(document.getElementById("jerry").style.top)) <= ((parseInt(document.getElementById("tom").style.top)) + 20)
          		&& (parseInt(document.getElementById("tom").style.top)) <= ((parseInt(document.getElementById("jerry").style.top)) + 20)
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


          };

          var checkCollision = function(player){
            //COLLISION AVEC LA MAP - BAS HAUT DROITE ET GAUCHE
            if (((parseInt(document.getElementById(player).style.left))+20) >= (parseInt(document.getElementById("background").style.width))) {
              document.getElementById(player).style.left = '492px';
            }else if (((parseInt(document.getElementById(player).style.top))+20) >= (parseInt(document.getElementById("background").style.height))) {
              document.getElementById(player).style.top = '460px';
            }else if (((parseInt(document.getElementById(player).style.left))) <= (parseInt(document.getElementById("background").style.left))){
              document.getElementById(player).style.left = '0px';
            }else if (((parseInt(document.getElementById(player).style.top))) <= (parseInt(document.getElementById("background").style.top))) {
              document.getElementById(player).style.top = '0px';
            }

            //COLLISION AVEC LA MAP - COIN BAS DROITE
            if (((parseInt(document.getElementById(player).style.left))+20) >= (parseInt(document.getElementById("background").style.width)) &&
            ((parseInt(document.getElementById(player).style.top))+20) >= (parseInt(document.getElementById("background").style.height))) {
              document.getElementById(player).style.left = '492px';
              document.getElementById(player).style.top = '460px';
            //COLLISION AVEC LA MAP - COIN HAUT DROITE
            }else if (((parseInt(document.getElementById(player).style.left))+20) >= (parseInt(document.getElementById("background").style.width)) &&
            (parseInt(document.getElementById(player).style.top)) <= (parseInt(document.getElementById("background").style.top))) {
              document.getElementById(player).style.left = '492px';
              document.getElementById(player).style.top = '0px';
            }

            //COLLISION AVEC LA MAP - COIN BAS GAUCHE
            if ((parseInt(document.getElementById(player).style.left)) <= (parseInt(document.getElementById("background").style.left)) &&
            ((parseInt(document.getElementById(player).style.top))+20) >= (parseInt(document.getElementById("background").style.height))) {
              document.getElementById(player).style.left = '0px';
              document.getElementById(player).style.top = '460px';
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

            socket.emit('receive_position', {
              xjerry: document.getElementById('jerry').style.left,
              yjerry: document.getElementById('jerry').style.top,
              xtom: document.getElementById('tom').style.left,
              ytom: document.getElementById('tom').style.top
            });

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
