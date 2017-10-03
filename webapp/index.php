<?php 
	header("Access-Control-Allow-Origin: *");
	include 'auth.php';
	$webplayeviewEnabled =false;
	$fileUploaderEnabled = false;
	
	if (isset($_GET['view']))
	{
		switch($_GET['view'])
		{
			case "dashboard":
				$view = "dashboard";
				break;
			case "number":
				$view = "number";
				break;
			case "country":
				$view = "country";
				break;
			case "sample":
				$view = "sample";
				break;
			case "test":
				$view = "test";
				break;
			case "type":
				$view = "type";
				break;
			case "status":
				$view = "status";
				break;
			case "audio":
				$view = "audio";
				break;
			default:
				$view = "dashboard";
		}	
	}
	else
	{
		$view = "dashboard";
	}
	
	include 'core/view/'.$view.'.php';
?>