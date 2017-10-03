<?php 
    
	function check_user_auth(){
        global $allowedUsers;

        session_start();
        if( isset($_SESSION["aloha-auth_user"]) && $_SESSION["aloha-auth_user"] === TRUE ){
            return TRUE;
        } else {
            return FALSE;
        }
    }
    
    function get_username_data()
    {
        return $_SESSION["aloha-username"].",".$_SESSION["aloha-admin"];
    }

    function get_username()
    {
        return $_SESSION["aloha-username"];
    }
    
    function set_user_auth($user,$admin)
    {
        session_start();
        $_SESSION["aloha-auth_user"] = TRUE;
        $_SESSION["aloha-username"] = $user;
        $_SESSION["aloha-admin"] = $admin;
        //Set some other data here that you need
        session_commit();
        //redirect to a protected page
        header("Location: index.php"); /* Redirect browser */
        exit();
    }
    
    function validate_user($username,$password)
    {
        global $allowedUsers;

        foreach($allowedUsers as $val)
        {
            if($username == $val[0] && md5($password) == $val[1])
            {
                $admin  = $val[2];
                set_user_auth($username,$admin);
            }
            else
            {
                $message = "Not valid credentials!";
            }
        }
        return $message;
    }
    
    function logout()
    {
        // Initialize the session.
        // If you are using session_name("something"), don't forget it now!
        session_start();
        
        // Unset all of the session variables.
        $_SESSION = array();
        
        // If it's desired to kill the session, also delete the session cookie.
        // Note: This will destroy the session, and not just the session data!
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Finally, destroy the session.
        session_destroy();
        header("Location: index.php");
    }
?>