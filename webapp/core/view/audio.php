<?php
  include 'core/business/aloha.php';
  include 'core/business/audio.php';
?>
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <?php
      $webplayeviewEnabled =true;
      $fileUploaderEnabled = true;
    ?>
    
    <?php include 'core/view/styles_libraries.php';?>
    
    <script>
      var type = <?php echo getCatalog('type');?>;
      var number = <?php echo getCatalog('number');?>;
      var country = <?php echo getCatalog('country');?>;

      $( document ).ready(function() {
         if( $('#form_message').length )         // use this if you are using id to check
          {
              // it exists
              $('#form_message').fadeIn('fast').delay(5000).fadeOut('slow');
          }
        
      });
    </script>
  </head>
  <body>
    
    <?php include 'core/view/general_navbar.php';?>

    <div id="page_container">
    
      

      <div class="container-fluid">

        <p align="right">
          <button type="button" class="btn btn-default" id="add_test">
              <small><span class="glyphicon glyphicon-upload" aria-hidden="true"></span></small> Upload Audio
          </button>
        </p>

        <?php if($message!=""){?>
          <div class="alert alert-success" role="alert" id="form_message"><?php echo $message;?></div>
        <?php }?>
        
        <div class="row">
          <div class="table-responsive col-md-12">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Audio Catalog</h3>
              </div>
                <div class="panel-body">
                  <table id="table_<?php echo $view;?>" class="table table-striped" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>TAPE</th>
                        <th>STATUS</th>
                        <th>FUNCTIONS</th>
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
      <div class="lightbox_content">
        
        <h2>Upload Audio</h2>
        <form class="form add" id="form_<?php echo $view;?>" data-id="" novalidate action="core/business/<?php echo $view;?>.php" method="post" enctype="multipart/form-data">

          <!--<div class="input_container">
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
          
          <div class="btn-group pull-right" role="group">
              <button type="submit" class="btn btn-default action" style="width:120px!important;">
                Add <?php echo $view;?>
              </button>
              <button type="button" class="btn btn-default bootstrap_lightbox_close" style="width:120px!important;">
                Cancel
              </button>
            </div>-->
            <input type="file" name="files">
			      <div class="btn-group pull-right" role="group">
              <button type="submit" class="btn btn-default action" style="width:120px!important;">
                Add <?php echo $view;?>
              </button>
              <button type="button" class="btn btn-default bootstrap_lightbox_close" style="width:120px!important;">
                Cancel
              </button>
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