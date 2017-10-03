<?php
include '../../auth_request.php';
include '../config/db.php';  


// Database details
$db_server   = $GLOBALS['aloha_db_server'];
$db_username = $GLOBALS['aloha_db_username'];
$db_password = $GLOBALS['aloha_db_password'];
$db_name     = $GLOBALS['aloha_db_name'];

$db_recorder_server   = $GLOBALS['aloha_recorder_db_server'];
$db_recorder_username = $GLOBALS['aloha_recorder_db_username'];
$db_recorder_password = $GLOBALS['aloha_recorder_db_password'];
$db_recorder_name     = $GLOBALS['aloha_recorder_db_name'];

$url_recorder = "http://172.21.0.246:8080/";
$url_dejavu = "http://aloha.pricetravel.com.mx/dejavu/audios/";

// Get job (and id)
$job = '';
$id  = '';
if (isset($_GET['job'])){
  $job = $_GET['job'];
  if ($job == 'get_numbers' ||
      $job == 'get_number'   ||
      $job == 'add_number'   ||
      $job == 'edit_number'  ||
      $job == 'delete_number'){
    if (isset($_GET['id'])){
      $id = $_GET['id'];
      if (!is_numeric($id)){
        $id = '';
      }
    }
  } else {
    $job = '';
  }
}

// Prepare array
$mysql_data = array();

// Valid job found
if ($job != '')
{
  // Connect to database
  $db_connection = mysqli_connect($db_server, $db_username, $db_password, $db_name);

  if (mysqli_connect_errno())
  {
    $result  = 'error';
    $message = 'Failed to connect to database: ' . mysqli_connect_error();
    $job     = '';
  }

  if ($job == 'get_numbers')
  {
    $query = "SELECT dan.id as id, dan.number as number, dac.name as country, dat.name as type, 'N/A' FROM aloha.number dan, country dac, type dat where dac.id = dan.country and dat.id=dan.type";
    $query = mysqli_query($db_connection, $query);
    
    if (!$query)
    {
      $result  = 'error';
      $message = 'query error';
    }
    else
    {
      $result  = 'success';
      $message = 'query success';
      while ($sqldata = mysqli_fetch_array($query))
      {
        $functions  = '<div class="btn-group" role="group" aria-label="actions">
        <button class="btn btn-default btn-sm function_edit" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['id'] . '" data-name="' . $sqldata['number'].'">
                    <small><span class="glyphicon glyphicon-file" aria-hidden="true"></span></small>
                        Edit
                    </button>
        <button class="btn btn-default btn-sm function_delete" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['id'] . '" data-name="' . $sqldata['number'].'">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Delete
                    </button></div>';

        $mysql_data[] = array(
          "id" => $sqldata['id'],
          "number"  => $sqldata['number'],
          "country"  => $sqldata['country'],
          "type"  => $sqldata['type'],
          "parent"  => "N/A",
          "functions" => $functions
        );
      }
    }
  }

  if ($job == 'get_number'){
    
    // Get extension
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "SELECT * from number where id = " . mysqli_real_escape_string($db_connection,$id);
      
      $query = mysqli_query($db_connection, $query);
      
      if (!$query)
      {
        $result  = 'error';
        $message = 'query error';
      }
      else
      {
        $result  = 'success';
        $message = 'query success';
        while ($sqldata = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id" => $sqldata['id'],
            "number"  => $sqldata['number'],
            "country"  => $sqldata['country'],
            "type"  => $sqldata['type'],
            "parent"  => "N/A"
          );
        }
      }
    }
  }

  if ($job == 'add_number'){
    
    // Add 
    $query = "INSERT INTO number SET ";
    if (isset($_GET['number_number'])) { $query .= "number = '" . mysqli_real_escape_string($db_connection, $_GET['number_number']) . "', "; }
    if (isset($_GET['number_country'])) { $query .= "country = '" . mysqli_real_escape_string($db_connection, $_GET['number_country']) . "', "; }
    if (isset($_GET['number_type'])) { $query .= "type = '" . mysqli_real_escape_string($db_connection, $_GET['number_type']) . "' "; }
    //die ($query);
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      $result  = 'error';
      $message = 'query error';
    } else {
      $result  = 'success';
      $message = 'query success';
    }
  
  }

  if ($job == 'edit_number'){
    
    // Edit 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "UPDATE number SET ";
      if (isset($_GET['number_number'])) { $query .= "number = '" . mysqli_real_escape_string($db_connection, $_GET['number_number']) . "', "; }
      if (isset($_GET['number_country'])) { $query .= "country = '" . mysqli_real_escape_string($db_connection, $_GET['number_country']) . "', "; }
      if (isset($_GET['number_type'])) { $query .= "type = '" . mysqli_real_escape_string($db_connection, $_GET['number_type']) . "' "; }
      $query .= "WHERE id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      //die($query);
      $query  = mysqli_query($db_connection, $query);
      if (!$query){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
  }

  if ($job == 'delete_number')
  {
  
    // Delete 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM number WHERE id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      $query = mysqli_query($db_connection, $query);
      if (!$query){
        $result  = 'error';
        $message = 'query error';
      } else {
        $result  = 'success';
        $message = 'query success';
      }
    }
  }
  
  if(!isset($mysql_data)){$mysql_data = array();}

  // Prepare data
  $data = array(
    "result"  => $result,
    "message" => $message,
    "data"    => $mysql_data
  );

  // Convert PHP array to JSON array
  $json_data = json_encode($data);
  print $json_data;

  // Close database connection
  mysqli_close($db_connection);

}



?>