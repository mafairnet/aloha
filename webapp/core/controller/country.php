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
  if ($job == 'get_countries' ||
      $job == 'get_country'   ||
      $job == 'add_country'   ||
      $job == 'edit_country'  ||
      $job == 'delete_country'){
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

  if ($job == 'get_countries')
  {
    $query = "SELECT * FROM aloha.country";
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
        <button class="btn btn-default btn-sm function_edit" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['id'] . '" data-name="' . $sqldata['name'].'">
                    <small><span class="glyphicon glyphicon-file" aria-hidden="true"></span></small>
                        Edit
                    </button>
        <button class="btn btn-default btn-sm function_delete" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['id'] . '" data-name="' . $sqldata['name'].'">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Delete
                    </button></div>';

        $mysql_data[] = array(
          "id" => $sqldata['id'],
          "name"  => $sqldata['name'],
          "prefix"  => $sqldata['prefix'],
          "functions" => $functions
        );
      }
    }
  }

  if ($job == 'get_country'){
    
    // Get extension
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "SELECT * from country where id = " . mysqli_real_escape_string($db_connection,$id);
      
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
            "name"  => $sqldata['name'],
            "prefix"  => $sqldata['prefix']
          );
        }
      }
    }
  }

  if ($job == 'add_country'){
    
    // Add 
    $query = "INSERT INTO country SET ";
    if (isset($_GET['country_name'])) { $query .= "name = '" . mysqli_real_escape_string($db_connection, $_GET['country_name']) . "', "; }
    if (isset($_GET['country_prefix'])) { $query .= "prefix = '" . mysqli_real_escape_string($db_connection, $_GET['country_prefix']) . "' "; }
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

  if ($job == 'edit_country'){
    
    // Edit 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "UPDATE country SET ";
      if (isset($_GET['country_name'])) { $query .= "name = '" . mysqli_real_escape_string($db_connection, $_GET['country_name']) . "', "; }
      if (isset($_GET['country_prefix'])) { $query .= "prefix = '" . mysqli_real_escape_string($db_connection, $_GET['country_prefix']) . "' "; }
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

  if ($job == 'delete_country')
  {
  
    // Delete 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM country WHERE id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
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