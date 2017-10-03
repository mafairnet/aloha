$(document).ready(function(){
  // On page load: datatable
  var table_view = $('#table_number').dataTable({
    "ajax": "core/controller/number.php?job=get_numbers",
    "columns": [
      { "data": "id",   "sClass": "id", "width": "5%" },
      { "data": "number",   "sClass": "number", "width": "20%"  },
      { "data": "country",   "sClass": "country", "width": "20%"  },
      { "data": "type",   "sClass": "type" , "width": "15%" },
      { "data": "parent",   "sClass": "parent" , "width": "20%" },
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
  var form_number = $('#form_number');
  form_number.validate();

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

  // Add button
  $(document).on('click', '#add_number', function(e){
    e.preventDefault();
    $('.lightbox_content h2').text('Add Number');
    $('#form_number .action').text('Add Number');
    $('#form_number').attr('class', 'form add');
    $('#form_number').attr('data-id', '');
    $('#form_number .field_container label.error').hide();
    $('#form_number .field_container').removeClass('valid').removeClass('error');
    $('#form_number #number_country').val('').change();
    $('#form_number #number_type').val('').change();
    $('#form_number #number_number').val('');
    show_lightbox();
  });

  // Add submit form
  $(document).on('submit', '#form_number.add', function(e){
    e.preventDefault();
    // Validate form
    if (form_number.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var form_data = $('#form_number').serialize();
      console.log(form_data);
      var request   = $.ajax({
        url:          'core/controller/number.php?job=add_number',
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
            var extension_name = $('#number_number').val();
            show_message("number '" + number_number + "' added successfully.", 'success');
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
    
    var id      = $(this).data('id');
    var request = $.ajax({
      url:          'core/controller/number.php?job=get_number',
      cache:        false,
      data:         'id=' + id,
      dataType:     'json',
      contentType:  'application/json; charset=utf-8',
      type:         'get'
    });
    console.log(request);
    request.done(function(output){
      if (output.result == 'success'){
        console.log("Test data:  "+output.data[0].type);
        $('.lightbox_content h2').text('Edit Number');
        $('#form_number .action').text('Edit number');
        $('#form_number').attr('class', 'form edit');
        $('#form_number').attr('data-id', id);
        $('#form_number .field_container label.error').hide();
        $('#form_number .field_container').removeClass('valid').removeClass('error');
        $('#form_number #number_number').val(output.data[0].number);
        $('#form_number #number_country').val(output.data[0].country).change();
        $('#form_number #number_type').val(output.data[0].type).change();
        
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
  $(document).on('submit', '#form_number.edit', function(e){
    e.preventDefault();
    // Validate form
    if (form_number.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var id        = $('#form_number').attr('data-id');
      var form_data = $('#form_number').serialize();
      var request   = $.ajax({
        url:          'core/controller/number.php?job=edit_number&id=' + id,
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
            var number_name = $('#number_number').val();
            show_message("number '" + number_name + "' edited successfully.", 'success');
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
    var number_number = $(this).data('name');
    if (confirm("Are you sure you want to delete '" + number_number + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/number.php?job=delete_number&id=' + id,
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
            show_message("number '" + number_number + "' deleted successfully.", 'success');
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