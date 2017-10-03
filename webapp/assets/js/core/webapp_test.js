$(document).ready(function(){

  var currentDate = new Date();

  //currentDate.setHours(currentDate.getHours() - 1);

  $('#test_programmed_date').datetimepicker(
  {
      format: 'YYYY-MM-DD HH:mm'
  });

  $('#test_end_programmed_date').datetimepicker(
  {
      format: 'YYYY-MM-DD HH:mm'
  });

  $('#test_programmed_date').data("DateTimePicker").minDate(currentDate);

  $('#test_end_programmed_date').data("DateTimePicker").minDate(currentDate);


  $("#test_programmed_date").on("dp.change", function (e) {
    $('#test_end_programmed_date').data("DateTimePicker").minDate(e.date);
  });

  $("#test_programmed_date").attr("disabled", "disabled");  

  $('#test_end_programmed_date').attr("disabled", "disabled");


  $(document.body).on("change",".select-frequency",function(){
    //alert(this.value);
    if(this.value == "7")
    {
      $("#test_programmed_date").attr("disabled", "disabled");  
      $('#test_end_programmed_date').attr("disabled", "disabled");
      $('#test_programmed_date').data("DateTimePicker").date( currentDate);
      $('#test_end_programmed_date').data("DateTimePicker").date(currentDate);
    }
    else
    {
      $("#test_programmed_date").attr("disabled", false);  
      $('#test_end_programmed_date').attr("disabled", false);
    }
  });

  // On page load: datatable
  var table_view = $('#table_test').dataTable({
    "ajax": "core/controller/test.php?job=get_tests",
    "columns": [
      { "data": "id",   "sClass": "id", "width": "5%" },
      { "data": "name",   "sClass": "name", "width": "30%"  },
      { "data": "frequency",   "sClass": "frequency", "width": "10%"  },
      { "data": "scan_date_time",   "sClass": "scan_date_time", "width": "20%"  },
      { "data": "status",   "sClass": "status" , "width": "15%" },
      { "data": "functions",   "sClass": "functions" , "width": "20%" }
    ],
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [-1] }
    ],
    dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
    ],
    "lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
    "oLanguage": {
      "oPaginate": {
        "sFirst":       " ",
        "sPrevious":    " ",
        "sNext":        " ",
        "sLast":        " ",
      },
      "sLengthMenu":    "Records per page: _MENU_",
      "sInfo":          "Total of _TOTAL_ records (showing _START_ to _END_)",
      "sInfoFiltered":  "(filtered from _MAX_ total records)"
    }
  });

  setInterval(function() {table_view.api().ajax.reload(); console.log("Updating");}, 5000);

  $("#quantity").keypress(function (e) {
     //if the letter is not digit then display error and don't type anything
     if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        //display error message
        $("#errmsg").html("Digits Only").show().fadeOut("slow");
               return false;
    }
   });
  
  // On page load: form validation
  jQuery.validator.setDefaults({
    success: 'valid',
    rules: {
      /*fiscal_year: {
        required: true,
        min:      2000,
        max:      2025
      }*/
    },
    errorPlacement: function(error, element){
      error.insertBefore(element);
    },
    highlight: function(element){
      $(element).parent('.field_container').removeClass('valid').addClass('error');
    },
    unhighlight: function(element){
      $(element).parent('.field_container').addClass('valid').removeClass('error');
    }
  });
  var form_test = $('#form_test');
  form_test.validate();

  // Show message
  function show_message(message_text, message){
    $('#message').html('<p>' + message_text + '</p>').attr('class', message);
    $('#message_container').show();
    if (typeof timeout_message !== 'undefined'){
      window.clearTimeout(timeout_message);
    }
    timeout_message = setTimeout(function(){
      hide_message();
    }, 8000);
  }
  // Hide message
  function hide_message(){
    $('#message').html('').attr('class', '');
    $('#message_container').hide();
  }

  // Show loading message
  function show_loading_message(){
    $('#loading_container').show();
  }
  // Hide loading message
  function hide_loading_message(){
    $('#loading_container').hide();
  }

  // Show lightbox
  function show_lightbox(){
    $('.lightbox_bg').show();
    $('.lightbox_container').show();
  }
  // Hide lightbox
  function hide_lightbox(){
    $('.lightbox_bg').hide();
    $('.lightbox_container').hide();
  }
  // Lightbox background
  $(document).on('click', '.lightbox_bg', function(){
    hide_lightbox();
  });
  // Lightbox close button
  $(document).on('click', '.lightbox_close', function(){
    hide_lightbox();
  });
  $(document).on('click', '.bootstrap_lightbox_close', function(){
    hide_lightbox();
  });
  // Escape keyboard key
  $(document).keyup(function(e){
    if (e.keyCode == 27){
      hide_lightbox();
    }
  });
  
  // Hide iPad keyboard
  function hide_ipad_keyboard(){
    document.activeElement.blur();
    $('input').blur();
  }

  function dateFromMysql(mySQLDate)
  {
    mySQLDate += "";
    console.log(mySQLDate);
    var convertedDate = new Date(Date.parse(mySQLDate.replace('-','/','g')));
    return convertedDate;
  }

  // Add company button
  $(document).on('click', '#add_test', function(e){
    e.preventDefault();
    
    $('.lightbox_content h2').text('Add Test');
    $('#form_test .action').text('Add Test');
    $('#form_test').attr('class', 'form add');
    $('#form_test').attr('data-id', '');
    $('#form_test .field_container label.error').hide();
    $('#form_test .field_container').removeClass('valid').removeClass('error');
    $('#form_test #test_name').val('');
    $('#form_test #test_programmed_date').data("DateTimePicker").minDate(currentDate);
    $('#form_test #test_number').val('').change();
    $('#form_test #test_frequency').val('').change();
    $("#form_test #test_programmed_date").attr("disabled", "disabled");  
    $('#form_test #test_end_programmed_date').attr("disabled", "disabled");
    $('#form_test #test_programmed_date').data("DateTimePicker").date( currentDate);
    $('#form_test #test_end_programmed_date').data("DateTimePicker").date(currentDate);
    show_lightbox();
  });

  // Add submit form
  $(document).on('submit', '#form_test.add', function(e){
    e.preventDefault();
    // Validate form
    if (form_test.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      select2SelectedTextValues = $('.select-number').select2('data');
      selectedNumberItems = "";
      for(var i = 0; i < select2SelectedTextValues.length; i++)
      {
        selectedNumberItems += "&test_number_selected[]="+select2SelectedTextValues[i].text;
      }
      var form_data = $('#form_test').serialize();
      //console.log($('.select-number').select2('data'));
      start_date = "&test_programmed_date="+$('#test_programmed_date').val();
      end_date = "&test_end_programmed_date="+$('#test_end_programmed_date').val();
      form_data += start_date + end_date + selectedNumberItems;
      console.log(form_data);
      var request   = $.ajax({
        url:          'core/controller/test.php?job=add_test',
        cache:        false,
        data:         form_data,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      console.log(request);
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_view.api().ajax.reload(function(){
            hide_loading_message();
            var test_name = $('#test_name').val();
            show_message("Test '" + test_name + "' added successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Add request failed', 'error');
        }
      });
      request.fail(function(jqXHR, texttype){
        hide_loading_message();
        show_message('Add request failed: ' + texttype, 'error');
      });
    }
  });

  // Edit button
  $(document).on('click', '.function_edit', function(e){
    e.preventDefault();
    // Get information from database
    show_loading_message();
    //$('#form_test #test_number').val([2,3]).change()
    //console.log("DATAC:"+$('#test_number').select2('val'));
    //console.log("DATACC:"+$('#test-number option'));

    /*var options = $('#test_number option');

    var values = $.map(options ,function(option) {
        return option.text;
    });*/

    //console.log("datas:" +  values);

    var id      = $(this).data('id');
    var request = $.ajax({
      url:          'core/controller/test.php?job=get_test',
      cache:        false,
      data:         'id=' + id,
      dataType:     'json',
      contentType:  'application/json; charset=utf-8',
      type:         'get'
    });
    //console.log(request);
    request.done(function(output){
      
      if (output.result == 'success'){
        
        //console.log("DATA:"+output.data[0].test_frequency);
        $('.lightbox_content h2').text('Edit Test');
        $('#form_test .action').text('Edit Test');
        $('#form_test').attr('class', 'form edit');
        $('#form_test').attr('data-id', id);
        $('#form_test .field_container label.error').hide();
        $('#form_test .field_container').removeClass('valid').removeClass('error');
        $('#form_test #test_name').val(output.data[0].test_name);
        $('#form_test #test_frequency').val(output.data[0].test_frequency).change();
        if(output.data[0].test_frequency==7)
        {
          $("#form_test #test_programmed_date").attr("disabled", "disabled");  
          $('#form_test #test_end_programmed_date').attr("disabled", "disabled");
        }
        $('#form_test #test_programmed_date').data("DateTimePicker").date(dateFromMysql(output.data[0].test_programmed_date));
        $('#form_test #test_end_programmed_date').data("DateTimePicker").date(dateFromMysql(output.data[0].test_end_programmed_date));
        numbers = output.data[0].test_number.split(",");
        console.log("ODATA: "+numbers); 
        $('#form_test #test_number').val(numbers).change();
        hide_loading_message();
        show_lightbox();
      } else {
        hide_loading_message();
        show_message('Information request failed', 'error');
      }
    });
    request.fail(function(jqXHR, texttype){
      hide_loading_message();
      show_message('Information request failed: ' + texttype, 'error');
    });
  });
  
  // Edit submit form
  $(document).on('submit', '#form_test.edit', function(e){
    e.preventDefault();
    // Validate form
    if (form_test.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();

      select2SelectedTextValues = $('.select-number').select2('data');
      selectedNumberItems = "";
      for(var i = 0; i < select2SelectedTextValues.length; i++)
      {
        selectedNumberItems += "&test_number_selected[]="+select2SelectedTextValues[i].text;
      }

      var id        = $('#form_test').attr('data-id');
      var form_data = $('#form_test').serialize();

      start_date = "&test_programmed_date="+$('#test_programmed_date').val();
      end_date = "&test_end_programmed_date="+$('#test_end_programmed_date').val();
      form_data += start_date + end_date + selectedNumberItems;

      console.log(form_data);

      var request   = $.ajax({
        url:          'core/controller/test.php?job=edit_test&id=' + id,
        cache:        false,
        data:         form_data,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      console.log(request);
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_view.api().ajax.reload(function(){
            hide_loading_message();
            var test_name = $('#test_name').val();
            show_message("Test '" + test_name + "' edited successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Edit request failed', 'error');
        }
      });
      request.fail(function(jqXHR, texttype){
        hide_loading_message();
        show_message('Edit request failed: ' + texttype, 'error');
      });
    }
  });
  
  // Delete 
  $(document).on('click', '.function_delete', function(e){
    e.preventDefault();
    var test_name = $(this).data('name');
    if (confirm("Are you sure you want to delete '" + test_name + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/tes.php?job=test&id=' + id,
        cache:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_view.api().ajax.reload(function(){
            hide_loading_message();
            show_message("Test '" + test_name + "' deleted successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Delete request failed', 'error');
        }
      });
      request.fail(function(jqXHR, texttype){
        hide_loading_message();
        show_message('Delete request failed: ' + texttype, 'error');
      });
    }
  });
});