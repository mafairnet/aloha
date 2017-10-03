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
$audioFolderLocation = "../../dejavu/audios/";

// Get job (and id)
$job = '';
$id  = '';
if (isset($_GET['job'])){
  $job = $_GET['job'];
  if ($job == 'get_audios' ||
      $job == 'delete_audio'){
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
  
  if ($job == 'get_audios')
  {
    $query = "SELECT * FROM dejavu.songs";
    
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
        <!--<button class="btn btn-default btn-sm" id="details-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-file" aria-hidden="true"></span></small>
                        Details
                    </button>-->
                    <button class="btn btn-default btn-sm function_delete" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['song_id'] . '" data-name="' . $sqldata['song_name'].'">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Delete
                    </button></div>';

        
        $fingerprinted = $sqldata['fingerprinted'];

        $tape = '<button data-toggle="tooltip" data-placement="bottom" title="'.$sqldata['song_id'].'-'.$sqldata['song_name'].'" class="btn btn-info btn-sm" id="delete-test" style="width:70px!important;max-width:100px!important;" onclick="playAudio('."'".$url_dejavu."'".','."'".$sqldata['song_name'].".wav'".')">
                    <small><span class="glyphicon glyphicon-play" aria-hidden="true"></span></small>
                        Play
                    </button>';
        
        if($fingerprinted)
        {
          
          $fingerprinted = '<button data-toggle="tooltip" data-placement="bottom" title="" class="btn btn-success btn-sm" id="delete-test" style="width:110px!important;">
                    <small><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></small>
                        Fingerprinted
                    </button>';
        }
        else
        {
          $fingerprinted= '<button class="btn btn-default btn-sm" id="delete-test" style="width:110px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-time" aria-hidden="true"></span></small>
                        Pending
                    </button>';
        }

        
        $mysql_data[] = array(
          "id"          => $sqldata['song_id'],
          "name"  => $sqldata['song_name'],
          "tape"  => $tape,
          "fingerprinted"  => $fingerprinted,
          "functions" => $functions
        );
      }
    }
  } 

  if ($job == 'delete_audio')
  {
    $samplesFound = false;

    //Check if there is no samples asociated to the audio
    $samplesFound = hasSamplesRelated($id,$db_connection);
    
    if(!$samplesFound)
    {
      
      
      //die("Samples not found");
      
      //If there's no audio I delete the file if it exists
      $filename = $_GET['name'];

      $fileWav = $audioFolderLocation . $filename . ".wav";
      $fileMp3 = $audioFolderLocation . $filename . ".mp3";

      if (file_exists($fileWav)) { unlink ($fileWav); }
      if (file_exists($fileMp3)) { unlink ($fileMp3); }

      //Delete all the fingerprints
      deleteFingerprints($id,$db_connection);

      //Delete the audio from the main table
      deleteAudio($id,$db_connection);

      $result  = 'success';
      $message = 'query success';
    }
    else
    {
      $result  = 'error';
      $message = 'Samples found';

      //die("Samples found");
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


  if(!isset($mysql_data)){$mysql_data = array();

  // Prepare data
  $data = array(
    "result"  => $result,
    "message" => $message,
    "data"    => $mysql_data
  );

  mysqli_close($db_connection);

  return $data;
}

function checkSamples()
{
  $samplesFound = false;

  return $samplesFound;
}

function deleteFingerprints($id,$db_connection)
{
  // Delete 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM dejavu.fingerprints WHERE song_id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      //die($query);
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

function deleteAudio($id,$db_connection)
{
  // Delete 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "DELETE FROM dejavu.songs WHERE song_id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
      //die($query);
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

function hasSamplesRelated($id,$db_connection)
{
  $samplesRelated = false;

  $query = "SELECT * FROM aloha.sample where audio = '".$id."'";

  //die($query);
  $query = mysqli_query($db_connection, $query);


  //die("ROWS".mysqli_num_rows($query));

  if ($query->num_rows > 0)
  {
    $samplesRelated = true;
  }

  return $samplesRelated;
}

?>