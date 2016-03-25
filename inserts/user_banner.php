<div class="user-banner">
	<div class="user-pp">
		<img src="<?php echo $details["photo"];?>" alt="" class="profile-picture">
	</div>
	<p class="legend"><?php echo $details["user_prenom"]." ".$details["user_nom"];?></p>
	<div class="user-summary">
		<div class="col-lg-6">
			<p><span class="glyphicon glyphicon-envelope"></span> <?php echo $details["mail"];?></p>
			<p><span class="glyphicon glyphicon-barcode"></span> <?php echo $details["user_rfid"];?></p>
		</div>
		<div class="col-lg-6">
			<p><span class="glyphicon glyphicon-earphone"></span> <?php echo $details["telephone"];?></p>
			<p><span class="glyphicon glyphicon-home"></span> <?php echo $details["rue"];?> - <?php echo $details["code_postal"]." ".$details["ville"];?></p>
		</div>
	</div>
</div>
