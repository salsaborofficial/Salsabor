<?php
session_start();
if(!isset($_SESSION["username"])){
	header('location: portal');
}
?>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Participations | Salsabor</title>
		<?php include "styles.php";?>
		<?php include "scripts.php";?>
		<script src="assets/js/products.js"></script>
		<script src="assets/js/participations.js"></script>
	</head>
	<body>
		<?php include "nav.php";?>
		<div class="container-fluid">
			<div class="row">
				<?php include "side-menu.php";?>
				<div class="col-sm-offset-3 col-lg-10 col-lg-offset-2 main">
					<legend><span class="glyphicon glyphicon-map-marker"></span> Participations</legend>
					<div class="container-fluid active-sessions-container">
						<p class='sub-legend active-sessions-title'><span></span> cours sont actuellement ouverts</p>
					</div>
				</div>
			</div>
		</div>
		<?php include "inserts/sub_modal_product.php";?>
	</body>
</html>