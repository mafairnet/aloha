<?php 
    include '../../core/config/users.php';
    include '../../core/business/security.php'; 
    
    if(!check_user_auth())
    {
        header("Location: /cti/devs/oreka/login.php"); /* Redirect browser */
        exit();
    }

    
?>