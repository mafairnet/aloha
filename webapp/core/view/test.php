<?php
  include 'core/business/aloha.php'
?>
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    
    <?php include 'core/view/styles_libraries.php';?>
    
    <script>
      var number = <?php echo getCatalog('number');?>;
      var frequency = <?php echo getCatalog('frequency');?>;

      //console.log("Catalog:"+number.data);
      
      $( document ).ready(function() {
        var testNumberSelect = $(".select-number").select2({
          data: number.data,
          placeholder: "Select an option",
          tags: true,
          tokenSeparators: ['/',',',';'," "],
          templateResult: tagFormatResult,
          escapeMarkup: function (markup) { 
              uniqueTexts = null; 
              return markup; 
          }, 
          matcher: function (params, data) {
              if(!uniqueTexts){
                  uniqueTexts = []; 
              }
              var modifiedData = null;

              if ($.trim(params.term) === '' || data.text.indexOf(params.term) > -1) {
                  if(uniqueTexts.indexOf(data.text) == -1)
                  {
                      modifiedData = data;
                      uniqueTexts.push(modifiedData.text);
                  }
              }

              if(modifiedData)
              {
                  return modifiedData;
              }

              return null;
          }
        });

        $(".select-frequency").select2({
          data: frequency.data, text: 'name'
        });

        document.getElementsByClassName('select2-search__field')[0].onkeypress = function(e){
           //console.log(e); 
           if (e.code != "Comma" && e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
              //console.log('Digits only');
              $("#test-number-error").html("Digits Only or commas").show().fadeOut("slow");
                      return false;
           }
        }

        function tagFormatResult(tag) {
          if (tag.loading) {
            return "Loading . . .";
          } 
          else 
          {
            var length = $('#tagsContainer .select2-selection__choice').filter(function () {
              return $(this).attr("title").toUpperCase() === tag.text.toUpperCase();
            }).length;

            if (length == 1) {
              return tag.text;
            }

            if (tag.text) {

              if(getOptionCount(tag.text) >1)
                return tag.text;
              else
                return tag.text + "";
            }
            return tag.text + "";
          }
        }

        function getOptionCount(tagText)
        {
          var count = 0;
          var selectBoxOptions = $("#Tags option");
          $(selectBoxOptions).each(function(){
            if(tagText == $(this).text())
              count++;//increment the counter if option text is matching with tag text
          });
          return count;
        }
        
      });
    </script>
  </head>
  <body>
    
    <?php include 'core/view/general_navbar.php';?>

    <div id="page_container">

      <p align="right">
        <button type="button" class="btn btn-default" id="add_test">
            <small><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></small> New Test
        </button>
      </p>

      <div class="row">
          <div class="table-responsive col-md-12">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Test Registry</h3>
              </div>
                <div class="panel-body">
                  <table id="table_<?php echo $view;?>" class="table table-striped" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Frecuency</th>
                        <th>Programmed Date</th>
                        <th>Status</th>
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
        
        <h2>Test Form</h2>
        <form class="form add" id="form_<?php echo $view;?>" data-id="" novalidate>

          <div class="input_container">
            <label for="<?php echo $view;?>_name">Name: <span class="required">*</span></label>
            <div class="field_container">
              <input type="text" class="text" name="<?php echo $view;?>_name" id="<?php echo $view;?>_name" value="" required>
            </div>
          </div>

          

          <div class="input_container">
            <label for="<?php echo $view;?>_number">Number(s): <span class="required">*</span></label>
            <div class="field_container">
              <select multiple style="width:100%" class="select-number" name="<?php echo $view;?>_number" id="<?php echo $view;?>_number" required>
                <!--<option value="" selected="selected">Select an option</option>-->
              </select>
            </div>
          </div>

          <div class="input_container">
            <label for="<?php echo $view;?>_frequency">Frequency: <span class="required">*</span></label>
            <div class="field_container">
              <select style="width:100%" class="select-frequency" name="<?php echo $view;?>_frequency" id="<?php echo $view;?>_frequency" required>
                <option value="" selected="selected">Select an option</option>
              </select>
            </div>
          </div>

          <div class="input_container">
            <label for="<?php echo $view;?>_programmed_date">Start Date: <span class="required">*</span></label>
            <div class="field_container">
              <div class='input-group date' id='datetimepicker_start_date' style="width:100%">
                <input type='text' class="form-control" name="<?php echo $view;?>_programmed_date" id="<?php echo $view;?>_programmed_date" required/>
                <!--<span class="input-group-addon">
                  <span class="glyphicon glyphicon-calendar"></span>
                </span>-->
              </div>
            </div>
          </div>

          <div class="input_container">
            <label for="<?php echo $view;?>_end_programmed_date">End Date: <span class="required">*</span></label>
            <div class="field_container">
              <div class='input-group date' id='datetimepicker_end_date' style="width:100%">
                <input type='text' class="form-control" name="<?php echo $view;?>_end_programmed_date" id="<?php echo $view;?>_end_programmed_date" required/>
                <!--<span class="input-group-addon">
                  <span class="glyphicon glyphicon-calendar"></span>
                </span>-->
              </div>
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