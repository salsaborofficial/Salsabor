    <?php
require_once 'functions/db_connect.php';
$db = PDOFactory::getConnection();

$queryAdherents = $db->query('SELECT * FROM adherents');
?>
<html>
<head>
    <meta charset="UTF-8">
    <title>Adhérents | Salsabor</title>
    <?php include "includes.php";?>
</head>
<body>
  <?php include "nav.php";?>
   <div class="container-fluid">
       <div class="row">
           <?php include "side-menu.php";?>
           <div class="col-sm-10 main">
               <h1 class="page-title"><span class="glyphicon glyphicon-user"></span> Base Clients</h1>
			  <div class="btn-toolbar">
                   <a href="eleve_add.php" role="button" class="btn btn-primary"><span class="glyphicon glyphicon-plus"></span> Inscrire un adhérent</a>
               </div> <!-- btn-toolbar -->
				<div class="input-group input-group-lg search-form">
					<span class="input-group-addon"><span class="glyphicon glyphicon-filter"></span></span>
					<input type="text" id="search" class="form-control" placeholder="Tapez pour rechercher...">
				</div>
               <table class="table table-striped">
               	<thead>
               		<tr>
               			<th>Nom</th>
               			<th>Mail</th>
               			<th></th>
               		</tr>
               	</thead>
               	<tbody id="filter-enabled">
               		<?php while($adherents = $queryAdherents->fetch(PDO::FETCH_ASSOC)){ ?>
               		<tr>
               			<td><?php echo $adherents['eleve_prenom']." ".$adherents['eleve_nom'];?></td>
               			<td><?php echo $adherents['mail'];?></td>
               			<td><a href="eleve_details.php?id=<?php echo $adherents['eleve_id'];?>" class="btn btn-default"><span class="glyphicon glyphicon-search"></span> Détails...</a></td>
               		</tr>
					<?php } ?>
               	</tbody>
               </table>
           </div>
       </div>
   </div>
   <?php include "scripts.php";?>    
</body>
</html>