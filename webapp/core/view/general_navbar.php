<nav class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="index.php?view=dashboard" style ="margin-top:-5px!important;">
               <img src="assets/images/aloha_logo_prod.png" style="height:27px;" alt="" border="0"/>
               <!--<h1 style ="margin:0px!important;font-size:20px!important;">Aloha! IVR - AVP</h1>
               <h2 style ="margin:0px!important;font-size:10px!important;">Autmomated Verifcation Platform</h2>-->
          </a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li><a href="index.php?view=test">Tests</a></li>
            <li><a href="index.php?view=sample">Samples</a></li>
            <li><a href="index.php?view=number">Numbers</a></li>
            <li><a href="index.php?view=audio">Audios</a></li>
            <li><a href="index.php?view=country">Countries</a></li>
            <li><a href="index.php?view=type">Types</a></li>
            <li><a href="index.php?view=status">Status</a></li>
            <!--<li><a href="index.php?view=log">Logs</a></li>-->
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li><a href="#">Welcome <?php echo ucwords(str_replace('.',' ',get_username()));?></a></li>
            <li><a href="logout.php">Logout</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>