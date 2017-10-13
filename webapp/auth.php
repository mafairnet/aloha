<?php 
    include 'core/config/users.php';
    require 'core/business/security.php'; 
    
    if(!check_user_auth($allowedUsers))
    {
        header("Location: login.php"); /* Redirect browser */
        exit();
    }

    
?>