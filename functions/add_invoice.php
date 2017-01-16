<?php
include "db_connect.php";
$db = PDOFactory::getConnection();

parse_str($_POST["values"], $values);

$invoice_seller_id = $values["invoice_seller_id"];
$invoice_token = $values["invoice_token"];
$invoice_period = "01/".$values["invoice_period"];

$period = DateTime::createFromFormat("d/m/Y", $invoice_period)->format("Y-m-d");

$period_start = date("Y-m-01", strtotime($period));
$period_end = date("Y-m-t", strtotime($period));

// Create the invoice
$query = "INSERT INTO invoices(invoice_seller_id, invoice_token, invoice_period)
VALUES($invoice_seller_id, '$invoice_token', '$period')";

$db->beginTransaction();
$db->query($query);
$invoice_id = $db->lastInsertId();
$db->commit();

// Associate all the corresponding sessions
$db->query("UPDATE sessions SET invoice_id = $invoice_id WHERE session_start > '$period_start' AND session_end < '$period_end' AND session_teacher = $invoice_seller_id");

// Associate all the corresponding prestations
$db->query("UPDATE prestations SET invoice_id = $invoice_id WHERE prestation_start > '$period_start' AND session_end < '$period_end' AND prestation_handler = $invoice_seller_id");

echo $invoice_id;
?>
