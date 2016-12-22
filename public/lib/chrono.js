var compte = 30;

function decompte() {

	if(compte <= 1) {
		pluriel = "";
	} else {
		pluriel = "s";
	}

	document.getElementById("compt").innerHTML = compte + " seconde" + pluriel;

	compte--;
};
