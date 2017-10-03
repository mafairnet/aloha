<?php 

    $message = "";

    if(isset($_POST['submit']))
    {
        include 'core/config/users.php';
        include 'core/business/security.php'; 
        
        
        if(isset($_POST['username']) && isset($_POST['password']))
        {
            $message = validate_user($_POST['username'],$_POST['password']);
        }
        else
        {
            $message = "Provide all the required data!";
        }
    }
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Metro, a sleek, intuitive, and powerful framework for faster and easier web development for Windows Metro Style.">
    <meta name="keywords" content="HTML, CSS, JS, JavaScript, framework, metro, front-end, frontend, web development">
    <meta name="author" content="Sergey Pimenov and Metro UI CSS contributors">

    <link rel='shortcut icon' type='image/x-icon' href='favicon.ico' />

    <title>PTH Aloha</title>

    <link href="assets/css/metro.css" rel="stylesheet">
    <link href="assets/css/metro-icons.css" rel="stylesheet">
    <link href="assets/css/metro-responsive.css" rel="stylesheet">

    <script src="assets/js/jquery-2.1.3.min.js"></script>
    <script src="assets/js/metro.js"></script>
 
    <style>
        .login-form {
            width: 25rem;
            height: 18.75rem;
            position: fixed;
            top: 50%;
            margin-top: -9.375rem;
            left: 50%;
            margin-left: -12.5rem;
            background-color: #ffffff;
            opacity: 0;
            -webkit-transform: scale(.8);
            transform: scale(.8);
            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
            border-radius: 10px;
        }
    </style>

    <script>

        /*
        * Do not use this is a google analytics fro Metro UI CSS
        * */
        if (window.location.hostname !== 'localhost') {

            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-58849249-3', 'auto');
            ga('send', 'pageview');

        }


        $(function(){
            var form = $(".login-form");

            form.css({
                opacity: 1,
                "-webkit-transform": "scale(1)",
                "transform": "scale(1)",
                "-webkit-transition": ".5s",
                "transition": ".5s"
            });
        });
    </script>
</head>
<body class="bg-darkTeal" style="background:#fff!important;">
    <div class="login-form padding20">
        <form method="post">
            <!--<h1 class="text-light">Aloha! <sup><small>IVR/AVP</small></sup> </h1>-->
            <img src="assets/images/aloha_logo_prod.png" style="height:70px;" alt="" border="0"/><sup><small>IVR/AVP</small></sup>
            <h6>Inbound Voice Recording / Automated Verification Platform</h6>
            <?php if($message!=""){ echo "<p>".$message."</p>";}?>
            <hr class="thin"/>
            <br />
            <div class="input-control text full-size" data-role="input">
                <label for="user_login">Username:</label>
                <input type="text" name="username" id="user_login">
                <button class="button helper-button clear"><span class="mif-cross"></span></button>
            </div>
            <br />
            <br />
            <div class="input-control password full-size" data-role="input">
                <label for="user_password">Password:</label>
                <input type="password" name="password" id="user_password">
                <button class="button helper-button reveal"><span class="mif-looks"></span></button>
            </div>
            <br />
            <br />
            <div class="form-actions">
                <button type="submit" name="submit" class="button primary">Login</button>
                <button type="button" class="button link">Cancel</button>
            </div>
        </form>
    </div>
</body>
</html>