<?php
require_once "db_connect.php";
// Feeding holidays to the calendar
$db = PDOFactory::getConnection();
$fetch_start = $_GET["fetch_start"];
$fetch_end = $_GET["fetch_end"];
try{
	// Fetching holidays
	$calendar = $db->prepare("SELECT * FROM holidays WHERE holiday_date >= '$fetch_start' AND holiday_date < '$fetch_end'");
	$calendar->execute();
	$events = array();

	/** Remplissage récursif d'un tableau et encodage JSON **/
	while($row_calendar = $calendar->fetch(PDO::FETCH_ASSOC)){
		$e = array();
		$e['id'] = $row_calendar['holiday_id'];
		$e['title'] = "Jour chômé";
		$e['start'] = $row_calendar['holiday_date']." 06:00:00";
		$e['end'] = $row_calendar['holiday_date']." 24:00:00";
		$e['type'] = "holiday";
		// Paramètre propriétaire de Fullcalendar.js qui sert à délimiter un évènement
		// à ses heures de début et de fin.
		$time_end = new DateTime($fetch_end);
		$time_start = new DateTime($fetch_start);
		$interval = $time_end->diff($time_start);
		if($interval->days > 6)
			$e['allDay'] = true;
		else
			$e['allDay'] = false;

		//echo $interval->days;
		array_push($events, $e);
	}

	echo json_encode($events);
	exit();
} catch(PDOException $e) {
	echo $e->getMessage();
}
?>
