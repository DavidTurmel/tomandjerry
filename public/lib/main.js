'use strict';

(function tomJerryGame(){
//JAVASCRIPT GAME

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

document.getElementById('background').style.width = "512px";
document.getElementById('background').style.height = "480px";
document.getElementById('background').style.left = 0;
document.getElementById('background').style.top = 0;

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
		console.log('collision entre joueurs');
    scoretom += 1;
		reset();
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
  (parseInt(document.getElementById(player).style.top)) <= (parseInt(document.getElementById("background").style.top))) {
    document.getElementById(player).style.left = '0px';
    document.getElementById(player).style.top = '0px';
  }
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000, "jerry");
  update(delta / 1000, "tom");

  checkCollision(player);

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

});
