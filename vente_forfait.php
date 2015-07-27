<?php
require_once 'functions/db_connect.php';
$db = PDOFactory::getConnection();
include 'functions/ventes.php';

$queryProduits = $db->query("SELECT * FROM produits");

if(isset($_POST["submit"])){
    vente();
}
?>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vente | Salsabor</title>
    <?php include "includes.php";?>
</head>
<body>
  <?php include "nav.php";?>
   <div class="container-fluid">
       <div class="row">
           <?php include "side-menu.php";?>
           <div class="col-sm-10 main">
               <h1 class="page-title"><span class="glyphicon glyphicon-road"></span> Vente d'un produit</h1>
               <form action="" method="post" target="_blank">
                 <div class="btn-toolbar">
                   <a href="dashboard.php" role="button" class="btn btn-default"><span class="glyphicon glyphicon-arrow-left"></span> Annuler et retourner au panneau d'administration</a>
                   <input type="submit" name="submit" role="button" class="btn btn-primary" value="ENREGISTRER">
                </div> <!-- btn-toolbar -->   
                  <div class="alert alert-custom alert-success" id="user-added" style="display:none;">Tarif ajouté avec succès</div>
                   <div class="form-group">
                       <label for="produit">Choisissez le forfait</label>
                        <div class="input-group">
                           <select name="produit" class="form-control" id="produit-select" onfocus="feedDetails()" onchange="feedDetails();";>
                           <?php while($produits = $queryProduits->fetch(PDO::FETCH_ASSOC)){ ?>
                               <option value="<?php echo $produits["produit_id"];?>"><?php echo $produits["produit_nom"];?></option>
                           <?php } ?>
                           </select>
                           <span role="button" class="input-group-btn" >
                               <a href="#produit-details" class="btn btn-default" data-toggle="collapse" aria-expanded="false"><span class="glyphicon glyphicon-search"></span> Détails...</a>
                           </span>
                           <input type="hidden" name="volume_horaire" value="">
                           <input type="hidden" name="autorisation_report" value="">
                       </div>
                       <div id="produit-details" class="collapse">
                           <div id="produit-content" class="well"></div>
                       </div>
                   </div>
                   <div class="form-group">
                       <label for="personne">Acheteur du forfait</label>
                       <input type="text" name="identite_prenom" id="identite_prenom" class="form-control" placeholder="Prénom" onChange="ifAdherentExists()">
                       <input type="text" name="identite_nom" id="identite_nom" class="form-control" placeholder="Nom" onChange="ifAdherentExists()">
                       <input type="hidden" name="personne_id" value="">
                        <div class="align-right">
							<p class="error-alert" id="err_adherent"></p>
							<a href="#user-details" role="button" class="btn btn-primary" value="create-user" id="create-user" style="display:none;" data-toggle="collapse" aria-expanded="false" aria-controls="userDetails">Créer</a>
               	        </div>
						<div id="user-details" class="collapse">
               	        	<div class="well">
               	        		<div class="form-group">
               	        			<label for="" class="control-label">Adresse postale</label>
               	        			<input type="text" name="rue" id="rue" placeholder="Adresse" class="form-control">
								</div>
								<div class="form-group">
									<input type="text" name="code_postal" id="code_postal" placeholder="Code Postal" class="form-control">
								</div>
								<div class="form-group">
									<input type="text" name="ville" id="ville" placeholder="Ville" class="form-control">
								</div>
								<div class="form-group">
									<label for="text" class="control-label">Adresse mail</label>
									<input type="text" name="mail" id="mail" placeholder="Adresse mail" class="form-control">
								</div>
								<div class="form-group">
									<label for="telephone" class="control-label">Numéro de téléphone</label>
									<input type="text" name="telephone" id="telephone" placeholder="Numéro de téléphone" class="form-control">
								</div>
								<div class="form-group">
									<label for="date_naissance" class="control-label">Date de naissance</label>
									<input type="date" name="date_naissance" id="date_naissance" class="form-control">
								</div>
								<div class="form-group">
									<label for="rfid" class="control-label">Code carte</label>
									<div class="input-group">
										<input type="text" name="rfid" class="form-control" placeholder="Scannez une nouvelle puce pour récupérer le code RFID">
										<span role="buttton" class="input-group-btn"><a class="btn btn-primary" role="button" name="fetch-rfid">Lancer la détection</a></span>
									</div>
								</div>
               	        		<a class="btn btn-primary" onClick="addAdherent()">AJOUTER</a>
               	        	</div>
               	        </div>
                   </div>
                   <div class="form-group">
                       <label for="echeances">Nombre d'échéances mensuelles</label>
                       <input type="text" name="echeances" class="form-control" placeholder="">
                   </div>
                   <div class="form-group">
                       <label for="date_activation">Date souhaitée d'activation</label>
                       <div class="input-group">
                           <input type="date" name="date_activation" class="form-control" onchange="evaluateExpirationDate()">
                           <span role="buttton" class="input-group-btn"><a class="btn btn-default" role="button" date-today="true" onclick="evaluateExpirationDate()">Insérer aujourd'hui</a></span>
                       </div>
                   </div>
                   <div class="form-group">
                       <label for="date_expiration">Date prévue d'expiration (à titre indicatif, pas de modification possible)</label>
                       <input type="date" name="date_expiration" class="form-control">
                   </div>
                   <div class="form-group">
                       <label for="prix_achat">Prix du forfait souhaité</label>
                       <input type="text" name="prix_achat" id="prix_calcul" class="form-control">
                   </div>
               </form>
           </div>
       </div>
   </div>
   <?php include "scripts.php";?>
   <script>
       var json;
        function feedDetails(){
            var id = $("#produit-select").find(":selected").val();
            $.post("functions/feed_product_details.php",{id}).done(function(data){
                $("#produit-content").empty();
                window.json = JSON.parse(data);
                var jours = json.validite_initiale;
                var arep = json.autorisation_report;
                var line = "Volume horaire : "+json.volume_horaire+" heures";
                line += "<br>Valable pendant "+json.validite_initiale+" jours ("+(jours/7)+" semaines) à partir de l'activation";
                line += "<br>Le paiement peut être réglé en maximum "+json.echeances_paiement+" fois.";
                line += "<br>L'extension de durée ";
                line += (arep==0)?"n'est pas":"est";
                line += " autorisée";
                $("#produit-content").append(line);

                $("*[name='echeances']").attr('placeholder', 'Maximum : '+json.echeances_paiement);
                $("*[name='volume_horaire']").val(json.volume_horaire);
                $("*[name='autorisation_report']").val(json.autorisation_report);
                evaluateExpirationDate();
                calculatePrice();
            });
        }
       
       function evaluateExpirationDate(){
           var date_activation = new moment($("*[name='date_activation']").val());
           if(window.json){
               var date_desactivation = date_activation.add(window.json.validite_initiale, 'days').format('YYYY-MM-DD');
               $("*[name='date_expiration']").val(date_desactivation);
           }
       }
       
       function calculatePrice(){
           $("#prix_calcul").val(window.json.tarif_global);
       }
	   
	   var listening = false;
	   var wait;
	   $("[name='fetch-rfid']").click(function(){
		   if(!listening){
			   wait = setInterval(function(){fetchRFID()}, 2000);
			   $("[name='fetch-rfid']").html("Détection en cours...");
			   listening = true;
		   } else {
			   clearInterval(wait);
			   $("[name='fetch-rfid']").html("Lancer la détection");
			   listening = false;
		   }
	   });
	   function fetchRFID(){
		   $.post('functions/fetch_rfid.php').done(function(data){
			  if(data != ""){
				  $("[name='rfid']").val(data);
				  clearInterval(wait);
				  $("[name='fetch-rfid']").html("Lancer la détection");
				  listening = false;
			  } else {
				  console.log("Aucun RFID détecté");
			  }
		   });
	   }
    </script> 
</body>
</html>