<?php
function getAdherent($prenom, $nom){
	$db = PDOFactory::getConnection();
	$search = $db->prepare('SELECT * FROM users WHERE user_prenom=? AND user_nom=?');
	$search->bindParam(1, $prenom);
	$search->bindParam(2, $nom);
	$search->execute();
	$res = $search->fetch(PDO::FETCH_ASSOC);
	return $res;
}

function getLieu($id){
	$db = PDOFactory::getConnection();
	$search = $db->prepare('SELECT * FROM salle WHERE salle_id=?');
	$search->bindParam(1, $id);
	$search->execute();
	$res = $search->fetch(PDO::FETCH_ASSOC);
	return $res;
}

function generateReference() {
	$length = 10;
	$characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$chars_length = strlen($characters);
	$reference = '';
	for ($i = 0; $i < $length; $i++) {
		$reference .= $characters[rand(0, $chars_length - 1)];
	}
	return $reference;
}
?>
