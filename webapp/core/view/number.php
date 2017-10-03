<?php
  include 'core/business/aloha.php'
?>
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    
    <?php include 'core/view/styles_libraries.php';?>
    
    <script>
      var type = <?php echo getCatalog('type');?>;
      var number = <?php echo getCatalog('number');?>;
      var country = <?php echo getCatalog('country');?>;

      $( document ).ready(function() {
        $(".select-country").select2({
          data: country.data, text: 'name'
        });
        console.log("Countries 'loaded'");
        $(".select-type").select2({
          data: type.data
        });
      });
    </script>
  </head>
  <body>
    
    <?php include 'core/view/general_navbar.php';?>

    <div id="page_container">
      
      
      <p align="right">
        <button type="button" class="btn btn-default" id="add_number">
            <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small> Add Number(s)
        </button>
      </p>

      <div class="row">
          <div class="table-responsive col-md-12">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Number Catalog</h3>
              </div>
                <div class="panel-body">
                  <table id="table_<?php echo $view;?>" class="table table-striped" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Number</th>
                        <th>Country</th>
                        <th>Type</th>
                        <th>Parent</th>
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
        
        <h2>Number Form</h2>
        <form class="form add" id="form_<?php echo $view;?>" data-id="" novalidate>

          <div class="input_container">
            <label for="<?php echo $view;?>_country">Country: <span class="required">*</span></label>
            <div class="field_container">
              <select style="width:100%" class="select-country" name="<?php echo $view;?>_country" id="<?php echo $view;?>_country" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_type">Type: <span class="required">*</span></label>
            <div class="field_container">
              <select style="width:100%" class="select-type" name="<?php echo $view;?>_type" id="<?php echo $view;?>_type" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>
          
          <div class="input_container">
            <label for="<?php echo $view;?>_number">Number(s): <span class="required">*</span></label>
            <div class="field_container">
              <!--<textarea class="text" name="<?php echo $view;?>_number" id="<?php echo $view;?>_number" value="" required cols="40" rows="5"></textarea>-->
              <input type="text" class="text" name="<?php echo $view;?>_number" id="<?php echo $view;?>_number" value="" required>
            </div>
          </div>
          
          
          <!--<div class="button_container">-->
          
            <div class="btn-group pull-right" role="group">
              <button tyoe="submit" class="btn btn-default action" style="width:120px!important;">
                Add <?php echo $view;?>
              </button>
              <button type="button" class="btn btn-default bootstrap_lightbox_close" style="width:120px!important;">
                Cancel
              </button>
            </div>
          <!--</div>-->
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