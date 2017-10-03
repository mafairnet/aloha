$(document).ready(function(){
  // On page load: datatable
  var table_servers = $('#table_servers').dataTable({
    "ajax": "core/controller/server.php?job=get_servers",
    "columns": [
      { "data": "id" },
      { "data": "server_name",   "sClass": "server_name" },
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
  var form_server = $('#form_server');
  form_server.validate();

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
  $(document).on('click', '#add_server', function(e){
    e.preventDefault();
    $('.lightbox_content h2').text('Add server');
    $('#form_server button').text('Add server');
    $('#form_server').attr('class', 'form add');
    $('#form_server').attr('data-id', '');
    $('#form_server .field_container label.error').hide();
    $('#form_server .field_container').removeClass('valid').removeClass('error');
    $('#form_server #server_name').val('');
    show_lightbox();
  });

  // Add submit form
  $(document).on('submit', '#form_server.add', function(e){
    e.preventDefault();
    // Validate form
    if (form_server.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var form_data = $('#form_server').serialize();
      console.log(form_data);
      var request   = $.ajax({
        url:          'core/controller/server.php?job=add_server',
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
          table_servers.api().ajax.reload(function(){
            hide_loading_message();
            var server_name = $('#server_name').val();
            show_message("Server '" + server_name + "' added successfully.", 'success');
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
      url:          'core/controller/server.php?job=get_server',
      cache:        false,
      data:         'id=' + id,
      dataType:     'json',
      contentType:  'application/json; charset=utf-8',
      type:         'get'
    });
    //console.log(request);
    request.done(function(output){
      if (output.result == 'success'){
        $('.lightbox_content h2').text('Edit server');
        $('#form_server button').text('Edit server');
        $('#form_server').attr('class', 'form edit');
        $('#form_server').attr('data-id', id);
        $('#form_server .field_container label.error').hide();
        $('#form_server .field_container').removeClass('valid').removeClass('error');
        $('#form_server #server_name').val(output.data[0].server_name);
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
  $(document).on('submit', '#form_server.edit', function(e){
    e.preventDefault();
    // Validate form
    if (form_server.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var id        = $('#form_server').attr('data-id');
      var form_data = $('#form_server').serialize();
      var request   = $.ajax({
        url:          'core/controller/server.php?job=edit_server&id=' + id,
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
          table_servers.api().ajax.reload(function(){
            hide_loading_message();
            var server_name = $('#server_name').val();
            show_message("Server '" + server_name + "' edited successfully.", 'success');
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
    var server_name = $(this).data('name');
    if (confirm("Are you sure you want to delete '" + server_name + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/server.php?job=delete_server&id=' + id,
        cache:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_servers.api().ajax.reload(function(){
            hide_loading_message();
            show_message("Server '" + server_name + "' deleted successfully.", 'success');
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