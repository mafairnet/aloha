<?php
  include 'core/business/aloha.php'
?>
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    
    <?php include 'core/view/styles_libraries.php';?>
    
    <script>
      /*$( document ).ready(function() {
        $(".select-status").select2({
          data: status.data, text: 'name'
        });
        console.log("Countries 'loaded'");
        $(".select-status").select2({
          data: status.data
        });
      });*/
    </script>
  </head>
  <body>
    
    <?php include 'core/view/general_navbar.php';?>

    <div id="page_container">
      
      
      <p align="right">
        <button type="button" class="btn btn-default" id="add_status">
            <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small> Add Status
        </button>
      </p>

      <div class="row">
          <div class="table-responsive col-md-12">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Status Catalog</h3>
              </div>
                <div class="panel-body">
                  <table id="table_<?php echo $view;?>" class="table table-striped" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Functions</th>
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

    <div class="lightbox_bg"></div>

    <div class="lightbox_container">
      <!--<div class="lightbox_close"></div>-->
      <div class="lightbox_content">
        
        <h2>Status Form</h2>
        <form class="form add" id="form_<?php echo $view;?>" data-id="" novalidate>

          <div class="input_container">
            <label for="<?php echo $view;?>_name">Name: <span class="required">*</span></label>
            <div class="field_container">
              <input type="text" class="text" name="<?php echo $view;?>_name" id="<?php echo $view;?>_name" value="" required>
            </div>
          </div>

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

  </body>
</html>