<?php
require_once "db_connect.php";
$db = PDOFactory::getConnection();

/** Forcefully activates a product **/

$product_id = $_POST["product_id"];

/** Check if the product has already been activated before **/
$details = $db->query("SELECT pa.date_activation AS produit_adherent_activation, pa.actif AS produit_adherent_actif, date_expiration, date_fin_utilisation, validite_initiale FROM produits_adherents pa
						JOIN produits p ON pa.id_produit_foreign = p.produit_id
						WHERE id_produit_adherent = '$product_id'")->fetch(PDO::FETCH_ASSOC);

if($details["produit_adherent_activation"] != "0000-00-00 00:00:00" && $details["produit_adherent_activation"] != NULL && $details["produit_adherent_actif"] == "0"){
	$date_activation = $details["produit_adherent_activation"];
	$date_expiration = $details["date_expiration"];
} else {
	if(isset($_POST["start_date"]) || $_POST["start_date"] == "0"){
		$date_activation = $_POST["start_date"];
	} else {
		$date_activation = date_create("now")->format("Y-m-d");
	}
	$date_expiration = date("Y-m-d 00:00:00", strtotime($date_activation.'+'.$details["validite_initiale"].'DAYS'));
	$queryHoliday = $db->prepare("SELECT * FROM jours_chomes WHERE date_chomee >= ? AND date_chomee <= ?");
	$queryHoliday->bindParam(1, $date_activation);
	$queryHoliday->bindParam(2, $date_expiration);
	$queryHoliday->execute();

	$j = 0;

	for($i = 0; $i <= $queryHoliday->rowCount(); $i++){
		$exp_date = date("Y-m-d 00:00:00",strtotime($date_expiration.'+'.$i.'DAYS'));
		$checkHoliday = $db->prepare("SELECT * FROM jours_chomes WHERE date_chomee=?");
		$checkHoliday->bindParam(1, $exp_date);
		$checkHoliday->execute();
		if($checkHoliday->rowCount() != 0){
			$j++;
		}
		$totalOffset = $i + $j;
		$new_exp_date = date("Y-m-d 00:00:00",strtotime($date_expiration.'+'.$totalOffset.'DAYS'));
	}
}

$activate = $db->query("UPDATE produits_adherents
						SET actif='1', date_fin_utilisation = NULL, date_activation = '$date_activation', date_expiration = '$date_expiration'
						WHERE id_produit_adherent = '$product_id'");

echo json_encode(array($date_activation, $date_expiration));
?>