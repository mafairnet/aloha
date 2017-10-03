<?php
  include 'core/business/aloha.php'
?>
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <?php $webplayeviewEnabled =true;?>
    
    <?php include 'core/view/styles_libraries.php';?>
    
    <script>
      var type = <?php echo getCatalog('type');?>;
      var number = <?php echo getCatalog('number');?>;
      var country = <?php echo getCatalog('country');?>;

      $( document ).ready(function() {
        
      });
    </script>
  </head>
  <body>
    
    <?php include 'core/view/general_navbar.php';?>

    <div id="page_container">
      <br/>

      <div class="container-fluid">

        
        
        <div class="row">
          <div class="col-md-4">
            <h1 style ="padding-left:20px!important;">Welcome to ...</h1>
            <img src="assets/images/aloha_logo_prod.png" style="height:80px;" alt="" border="0"/>
            <h2 style ="margin:0px!important;font-size:10px!important;padding-left:40px!important;">IVR Autmomated Verifcation Platform</h2>
            
          </div>
          <div class="col-md-8">
            <div class="row tile_count">
              <div class="col-md-3 col-sm-6 col-xs-9 tile_stats_count">
                <span class="glyphicon glyphicon-dashboard"></span><span class="count_top"> Pending samples</span>
                <div id="pending_samples" class="count">Loading...</div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-9 tile_stats_count">
                <span class="glyphicon glyphicon-ok"></span><span class="count_top"> Succeeded samples</span>
                <div id="succeeded_samples" class="count">Loading...</div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-9 tile_stats_count">
                <span class="glyphicon glyphicon-warning-sign"></span><span class="count_top"> Samples To Check</span>
                <div id="tocheck_samples" class="count green">Loading...</div>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-9 tile_stats_count">
                <span class="glyphicon glyphicon-remove"></span><span class="count_top"> Failed Samples</span>
                <div id="failed_samples" class="count">Loading...</div>
              </div>
            </div>
          </div>
        </div>
        <br/><br/>
        <!--<div class="row">
          <br/>
          <div class="col-md-12">
            <div class="btn-group btn-group-justified" role="group"  aria-label="...">
              <div class="btn-group">
              <button type="button" class="btn btn-default" style="text-align:left!important;" id="add_test" role="group">
                <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small>New Test</button>
              </div>
              <div class="btn-group">
              <button type="button" class="btn btn-default" style="text-align:left!important;" id="add_test" role="group">
                <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small>Check Results</button>
              </div>
              <div class="btn-group">
              <button type="button" class="btn btn-default" style="text-align:left!important;" id="add_test" role="group">
                <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small>Numbers Catalog</button>
              </div>
            </div>
            <br/><br/>
          </div>
        </div>-->
        <div class="row">
          <div class="table-responsive col-md-12">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Last Samples</h3>
              </div>
                <div class="panel-body">
                  <table id="calls_data" class="table table-striped" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>TEST</th>
                        <th>NUMBER</th>
                        <th>TAPE</th>
                        <th>IVR-AUDIO</th>
                        <th>DATETIME</th>
                        <th>STATUS</th>
                        <th>FUNCTIONSS</th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      

    </div>

    <div class="lightbox_bg"></div>

    <div class="lightbox_container">
      <div class="lightbox_close"></div>
      <div class="lightbox_content">
        
        <h2>Add Extension</h2>
        <form class="form add" id="form_<?php echo $view;?>" data-id="" novalidate>

          <div class="input_container">
            <label for="<?php echo $view;?>_name">Extension: <span class="required">*</span></label>
            <div class="field_container">
              <input type="text" class="text" name="<?php echo $view;?>_name" id="<?php echo $view;?>_name" value="" required>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_department">Department: <span class="required">*</span></label>
            <div class="field_container">
              <select class="select-department" name="<?php echo $view;?>_department" id="<?php echo $view;?>_department" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_server">Server: <span class="required">*</span></label>
            <div class="field_container">
              <select class="select-server" name="<?php echo $view;?>_server" id="<?php echo $view;?>_server" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_user">User: <span class="required">*</span></label>
            <div class="field_container">
              <select class="select-user" name="<?php echo $view;?>_user" id="<?php echo $view;?>_user" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_type">Type: <span class="required">*</span></label>
            <div class="field_container">
              <select class="select-extension-type" name="<?php echo $view;?>_type" id="<?php echo $view;?>_type" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_status">Status: <span class="required">*</span></label>
            <div class="field_container">
              <select class="select-extension-status" name="<?php echo $view;?>_status" id="<?php echo $view;?>_status" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="button_container">
            <button type="submit">Add <?php echo $view;?></button>
          </div>
        </form>
        
      </div>
    </div>

    <noscript id="noscript_container">
      <div id="noscript" class="error">
        <p>JavaScript support is needed to use this page.</p>
      </div>
    </noscript>

    <div id="message_container">
      <div id="message" class="success">
        <p>This is a success message.</p>
      </div>
    </div>

    <div id="loading_container">
      <div id="loading_container2">
        <div id="loading_container3">
          <div id="loading_container4">
            Loading, please wait...
          </div>
        </div>
      </div>
    </div>

    <footer class="footer" id="footer-bar">
      <div class="row">
          <div class="col-md-10">
            <h1>Audio Player</h1>
          </div>
          <div class="col-md-2">
            <p align="right">
              <button class="btn btn-danger btn-sm" id="delete-test" style="width:80px!important;" onclick="stopAudio()">
                <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                Close
              </button>
            </p>
          </div>
      </div>
      <div id="waveForm-timeline" class="container-wave-timeline"></div>
      <div id="waveForm" class="container-wave"></div>
      <div id="waveForm-control" class="container-wave-control">         
         <button id="btnPlayPause" class="btn btn-primary">
            <i class="glyphicon glyphicon-pause"></i>
         </button>
         <span></span>
                  
         <div class="waveForm-control-volume">
            <i id="imgVolume" class="glyphicon glyphicon-volume-up"></i>
            <div class="volume-range">
               <input id="volumeRange" type="range" min="0" max="1" value="1" step="0.1">            
            </div>                          
         </div>
         
      </div>      
   </footer>

  </body>
</html>