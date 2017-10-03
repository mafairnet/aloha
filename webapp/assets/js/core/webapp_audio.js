$(document).ready(function(){

  $('input[name="files"]').fileuploader(
    {
      extensions: ['audio/mp3','audio/wav'],
    }
  );
  // On page load: datatable
  var table_view = $('#table_audio').dataTable({
    "ajax": "core/controller/audio.php?job=get_audios",
    "columns": [
      { "data": "id",   "sClass": "id", "width": "3%" },
      { "data": "name",   "sClass": "number", "width": "35%"  },
      { "data": "tape",   "sClass": "tape", "width": "15%"  },
      { "data": "fingerprinted",   "sClass": "audio" , "width": "15%" },
      { "data": "functions",   "sClass": "functions" , "width": "10%" }
    ],
    "order": [[ 0, "asc" ]],
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

  $('[data-toggle="tooltip"]').tooltip();

  //getStatisticsData();

  //setTimeout(function(){  table_view.api().ajax.reload();  },2000);

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
  var form_extension = $('#form_extension');
  form_extension.validate();

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

  // Add company button
  $(document).on('click', '#add_test', function(e){
    e.preventDefault();
    $('.lightbox_content h2').text('Add Audio(s)');
    $('#form_extension').attr('class', 'form add');
    $('#form_extension').attr('data-id', '');
    $('#form_extension .field_container label.error').hide();
    $('#form_extension .field_container').removeClass('valid').removeClass('error');
    $('#form_extension #extension_name').val('');
    $('#form_extension #extension_department').val('');
    $('#form_extension #extension_server').val('');
    $('#form_extension #extension_user').val('');
    $('#form_extension #extension_type').val('');
    $('#form_extension #extension_status').val('');
    show_lightbox();
  });

  // Delete 
  $(document).on('click', '.function_delete', function(e){
    e.preventDefault();
    var audio_name = $(this).data('name');
    if (confirm("Are you sure you want to delete '" +audio_name + "'?")){
      show_loading_message();
      var id      = $(this).data('id');
      var request = $.ajax({
        url:          'core/controller/audio.php?job=delete_audio&id=' + id + '&name=' + audio_name,
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
            show_message("Audio '" + audio_name + "' deleted successfully.", 'success');
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

  