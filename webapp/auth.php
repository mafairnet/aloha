<?php 
    include 'core/config/users.php';
    require 'core/business/security.php'; 
    
    if(!check_user_auth($allowedUsers))
    {
        $actual_uri = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
        if ($actual_uri == "http://aloha.pricetravel.com.mx/index.php")
        {
            header("Location: login.php"); /* Redirect browser */
        }
        else
        {
            header("Location: /cti/devs/aloha/login.php");
        }
        exit();
    }

    
?>