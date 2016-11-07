<?php
require_once "db_connect.php";
$db = PDOFactory::getConnection();

if(isset($_POST["tag"]) && isset($_POST["target"]) && isset($_POST["type"])){
	if(is_numeric($_POST["tag"])){
		$tag = intval($_POST["tag"]);
	} else {
		$tag = $_POST["tag"];
	}
	$target = $_POST["target"];
	$type = $_POST["type"];

	associateTag($db, $tag, $target, $type);
}

function associateTag($db, $tag, $target, $type){
	if(isset($target)){
		if(!is_numeric($tag)){
			$tag = $db->query("SELECT rank_id FROM tags_".$type." WHERE rank_name='$tag'")->fetch(PDO::FETCH_COLUMN);
		}

		$query = "INSERT IGNORE INTO assoc_".$type."_tags(".$type."_id_foreign, tag_id_foreign) VALUES($target, $tag)";
		$attach = $db->query($query);

		echo $db->lastInsertId();
		return $db->lastInsertId();
	}
}
?>
