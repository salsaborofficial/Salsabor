<?php
/* Daily back-up.
cron : * 4 * * * /usr/bin/php /opt/lampp/htdocs/Salsabor/functions/schedule/back_up.php
*/
$dbhost = "localhost"; // usually localhost
$dbuser = "root";
$dbpass = "GztXCDj5AE3UEDXGe";
$dbname = "Salsabor";

$backup_file = $dbname."-backup".date("Y-m-d").".sql";
system("/opt/lampp/bin/mysqldump -h $dbhost -u $dbuser -p$dbpass $dbname > /opt/lampp/htdocs/Salsabor/back-ups/$backup_file");
?>