<?php
session_start();
if(!isset($_SESSION["username"])){
	header('location: portal');
}
require_once 'functions/db_connect.php';
$db = PDOFactory::getConnection();

$produits = $db->query("SELECT * FROM produits");
?>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Forfaits | Salsabor</title>
		<?php include "styles.php";?>
	</head>
	<body>
		<?php include "nav.php";?>
		<div class="container-fluid">
			<div class="row">
				<?php include "side-menu.php";?>
				<div class="col-sm-offset-3 col-lg-10 col-lg-offset-2 main">
					<legend><span class="glyphicon glyphicon-credit-card"></span> Forfaits
						<a href="forfait_add.php" role="button" class="btn btn-primary"><span class="glyphicon glyphicon-plus"></span> Ajouter un forfait</a>
					</legend>
					<?php while($produit = $produits->fetch(PDO::FETCH_ASSOC)){
	$validite_semaines = $produit["validite_initiale"] / 7;
	if($validite_semaines < 1){
		$validite = $produit["validite_initiale"]." jour(s)";
	} else {
		$validite = $validite_semaines." semaine(s)";
	}
					?>
					<div class="col-sm-6 col-md-4 panel-product-container">
						<div class="panel panel-product">
							<div class="panel-body">
								<p class="product-title"><?php echo $produit["produit_nom"];?></p>
								<?php $labels = $db->prepare("SELECT * FROM assoc_product_tags apt
						JOIN tags_session ts ON apt.tag_id_foreign = ts.rank_id
						WHERE product_id_foreign = ?
						ORDER BY tag_color DESC");
	$labels->bindParam(1, $produit["produit_id"], PDO::PARAM_INT);
	$labels->execute(); ?>
								<p>Valable <?php echo $validite;?></p>
								<div class="tags-display">
									<h5>
										<?php while($label = $labels->fetch(PDO::FETCH_ASSOC)){
		if($label["is_mandatory"] == 1){
			$label_name = "<span class='glyphicon glyphicon-star'></span> ".$label["rank_name"];
		} else {
			$label_name = $label["rank_name"];
		}
										?>
										<span class="label label-salsabor" title="Supprimer l'étiquette" id="product-tag-<?php echo $label["entry_id"];?>" data-target="<?php echo $label["entry_id"];?>" data-targettype="product" style="background-color:<?php echo $label["tag_color"];?>"><?php echo $label_name;?></span>
										<?php } ?>
									</h5>
								</div>
								<?php if($produit["description"] != ""){ ?>
								<p class="product-description"><?php echo $produit["description"];?></p>
								<?php } else { ?>
								<p class="product-description purchase-sub">Pas de description</p>
								<?php } ?>
								<p class="product-price"><?php echo $produit["tarif_global"];?> €</p>
								<a href="forfait/<?php echo $produit["produit_id"];?>" class="btn btn-default btn-block"><span class="glyphicon glyphicon-search"></span> Détails...</a>
							</div>
						</div>
					</div>
					<?php } ?>
				</div>
			</div>
		</div>
		<?php include "scripts.php";?>
	</body>
</html>
