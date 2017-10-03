$(document).ready(function(){
  // On page load: datatable
  var table_extension_statuses = $('#table_extension_statuses').dataTable({
    "ajax": "core/controller/extension_status.php?job=get_extension_statuses",
    "columns": [
      { "data": "id" },
      { "data": "extension_status_name",   "sClass": "extension_status_name" },
      { "data": "functions",      "sClass": "functions" }
    ],
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [-1] }
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
  var form_extension_status = $('#form_extension_status');
  form_extension_status.validate();

  // Show message
  function show_message(message_text, message_type){
    $('#message').html('<p>' + message_text + '</p>').attr('class', message_type);
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

  // Add company button
  $(document).on('click', '#add_extension_status', function(e){
    e.preventDefault();
    $('.lightbox_content h2').text('Add extension_status');
    $('#form_extension_status button').text('Add extension_status');
    $('#form_extension_status').attr('class', 'form add');
    $('#form_extension_status').attr('data-id', '');
    $('#form_extension_status .field_container label.error').hide();
    $('#form_extension_status .field_container').removeClass('valid').removeClass('error');
    $('#form_extension_status #extension_status_name').val('');
    show_lightbox();
  });

  // Add submit form
  $(document).on('submit', '#form_extension_status.add', function(e){
    e.preventDefault();
    // Validate form
    if (form_extension_status.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var form_data = $('#form_extension_status').serialize();
      console.log(form_data);
      var request   = $.ajax({
        url:          'core/controller/extension_status.php?job=add_extension_status',
        cache:        false,
        data:         form_data,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      //console.log(request);
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_extension_statuses.api().ajax.reload(function(){
            hide_loading_message();
            var extension_status_name = $('#extension_status_name').val();
            show_message("extension_status '" + extension_status_name + "' added successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Add request failed', 'error');
        }
      });
      request.fail(function(jqXHR, textStatus){
        hide_loading_message();
        show_message('Add request failed: ' + textStatus, 'error');
      });
    }
  });
  
  // Edit button
  $(document).on('click', '.function_edit a', function(e){
    e.preventDefault();
    // Get information from database
    show_loading_message();
    var id      = $(this).data('id');
    var request = $.ajax({
      url:          'core/controller/extension_status.php?job=get_extension_status',
      cache:        false,
      data:         'id=' + id,
      dataType:     'json',
      contentType:  'application/json; charset=utf-8',
      type:         'get'
    });
    //console.log(request);
    request.done(function(output){
      if (output.result == 'success'){
        $('.lightbox_content h2').text('Edit extension_status');
        $('#form_extension_status button').text('Edit extension_status');
        $('#form_extension_status').attr('class', 'form edit');
        $('#form_extension_status').attr('data-id', id);
        $('#form_extension_status .field_container label.error').hide();
        $('#form_extension_status .field_container').removeClass('valid').removeClass('error');
        $('#form_extension_status #extension_status_name').val(output.data[0].extension_status_name);
        hide_loading_message();
        show_lightbox();
      } else {
        hide_loading_message();
        show_message('Information request failed', 'error');
      }
    });
    request.fail(function(jqXHR, textStatus){
      hide_loading_message();
      show_message('Information request failed: ' + textStatus, 'error');
    });
  });
  
  // Edit submit form
  $(document).on('submit', '#form_extension_status.edit', function(e){
    e.preventDefault();
    // Validate form
    if (form_extension_status.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var id        = $('#form_extension_status').attr('data-id');
      var form_data = $('#form_extension_status').serialize();
      var request   = $.ajax({
        url:          'core/controller/extension_status.php?job=edit_extension_status&id=' + id,
        cache:        false,
        data:         form_data,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      //console.log(request);
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_extension_statuses.api().ajax.reload(function(){
            hide_loading_message();
            var extension_status_name = $('#extension_status_name').val();
            show_message("extension_status '" + extension_status_name + "' edited successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Edit request failed', 'error');
        }
      });
      request.fail(function(jqXHR, textStatus){
        hide_loading_message();
        show_message('Edit request failed: ' + textStatus, 'error');
      });
    }
  });
  
  // Delete 
  $(document).on('click', '.function_delete a', function(e){
    e.preventDefault();
    var extension_status_name = $(this).data('name');
    if (confirm("Are you sure you want to delete '" + extension_status_name + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/extension_status.php?job=delete_extension_status&id=' + id,
        cache:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_extension_statuses.api().ajax.reload(function(){
            hide_loading_message();
            show_message("extension_status '" + extension_status_name + "' deleted successfully.", 'success');
          }, true);
        } else {
          hide_loading_message();
          show_message('Delete request failed', 'error');
        }
      });
      request.fail(function(jqXHR, textStatus){
        hide_loading_message();
        show_message('Delete request failed: ' + textStatus, 'error');
      });
    }
  });
});