$(document).ready(function(){
  // On page load: datatable
  var table_departments = $('#table_departments').dataTable({
    "ajax": "core/controller/department.php?job=get_departments",
    "columns": [
      { "data": "id" },
      { "data": "department_name",   "sClass": "department_name" },
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
  var form_department = $('#form_department');
  form_department.validate();

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
  $(document).on('click', '#add_department', function(e){
    e.preventDefault();
    $('.lightbox_content h2').text('Add department');
    $('#form_department button').text('Add department');
    $('#form_department').attr('class', 'form add');
    $('#form_department').attr('data-id', '');
    $('#form_department .field_container label.error').hide();
    $('#form_department .field_container').removeClass('valid').removeClass('error');
    $('#form_department #department_name').val('');
    show_lightbox();
  });

  // Add submit form
  $(document).on('submit', '#form_department.add', function(e){
    e.preventDefault();
    // Validate form
    if (form_department.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var form_data = $('#form_department').serialize();
      console.log(form_data);
      var request   = $.ajax({
        url:          'core/controller/department.php?job=add_department',
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
          table_departments.api().ajax.reload(function(){
            hide_loading_message();
            var department_name = $('#department_name').val();
            show_message("department '" + department_name + "' added successfully.", 'success');
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
      url:          'core/controller/department.php?job=get_department',
      cache:        false,
      data:         'id=' + id,
      dataType:     'json',
      contentType:  'application/json; charset=utf-8',
      type:         'get'
    });
    //console.log(request);
    request.done(function(output){
      if (output.result == 'success'){
        $('.lightbox_content h2').text('Edit department');
        $('#form_department button').text('Edit department');
        $('#form_department').attr('class', 'form edit');
        $('#form_department').attr('data-id', id);
        $('#form_department .field_container label.error').hide();
        $('#form_department .field_container').removeClass('valid').removeClass('error');
        $('#form_department #department_name').val(output.data[0].department_name);
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
  $(document).on('submit', '#form_department.edit', function(e){
    e.preventDefault();
    // Validate form
    if (form_department.valid() == true){
      // Send information to database
      hide_ipad_keyboard();
      hide_lightbox();
      show_loading_message();
      var id        = $('#form_department').attr('data-id');
      var form_data = $('#form_department').serialize();
      var request   = $.ajax({
        url:          'core/controller/department.php?job=edit_department&id=' + id,
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
          table_departments.api().ajax.reload(function(){
            hide_loading_message();
            var department_name = $('#department_name').val();
            show_message("department '" + department_name + "' edited successfully.", 'success');
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
    var department_name = $(this).data('name');
    if (confirm("Are you sure you want to delete '" + department_name + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/department.php?job=delete_department&id=' + id,
        cache:        false,
        dataType:     'json',
        contentType:  'application/json; charset=utf-8',
        type:         'get'
      });
      request.done(function(output){
        if (output.result == 'success'){
          // Reload datable
          table_departments.api().ajax.reload(function(){
            hide_loading_message();
            show_message("department '" + department_name + "' deleted successfully.", 'success');
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