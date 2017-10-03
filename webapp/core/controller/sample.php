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
  if ($job == 'get_tests' ||
      $job == 'get_latest_tests' ||
      $job == 'get_tests_statistics' ||
      $job == 'get_test'   ||
      $job == 'add_test'   ||
      $job == 'edit_test'  ||
      $job == 'repeat_sample'  ||
      $job == 'delete_test'){
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
  
  if ($job == 'get_latest_tests' || $job == 'get_tests')
  {
    $orekaAudios = getOrekaAudios($db_recorder_server,$db_recorder_username,$db_recorder_password,$db_recorder_name);
    
    //die(print_r($orekaAudios));

    //$query = "select * from sample order by id desc limit 100";
    //$query = "select s.id as id, s.test as test, s.tape as tape, s.audio as audio, s.confidence as confidence, s.generated_datetime as generated_datetime, s.status as status, n.number as number from sample as s, number as n where n.id =s.number order by s.id desc limit 100";
    $query = "select das.id as id, das.test as test, das.tape as tape, das.audio as audio, dds.song_name as song_name, das.confidence as confidence, das.generated_datetime as generated_datetime, das.status as status, dan.number as number from aloha.number dan, aloha.sample das left join dejavu.songs dds  ON das.audio = dds.song_id where dan.id = das.number order by das.id desc";
    
    if($job == "get_latest_tests")
    {
      $query = $query . " limit 100";
    }
    
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

        $functions  = '<div class="btn-group" role="group" aria-label="actions"><!--
        <button class="btn btn-default btn-sm" id="details-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-file" aria-hidden="true"></span></small>
                        Details
                    </button>-->
                    <button class="btn btn-default btn-sm function_repeat" id="details-test" style="width:80px!important;" data-id="'   . $sqldata['id'] . '" data-name="' . $sqldata['number'].'">
                    <small><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></small>
                        Repeat
                    </button></div>';

        if( isset($_SESSION["admin"]))
        {
          if($_SESSION["admin"]==1)
          {
            $functions .= 'Delete';
          }
        }

        $status = $sqldata['status'];

        if ($status < 3)
        {
          $tape = "N/A";
          $audio =  "N/A";
          $generated_datetime =  "N/A";
        }
        else
        {
          $tape = '<button class="btn btn-info btn-sm" id="delete-test" style="width:100px!important;max-width:100px!important;" onclick="alert('."'No file located'".')">
                    <small><span class="glyphicon glyphicon-play" aria-hidden="true"></span></small>
                        aloha'.$sqldata['id'].'
                    </button>';
          //die(print_r($orekaAudios['data']));
          foreach ($orekaAudios['data'] as $audioTape)
          {
            //die ("LOG:".$audioTape[0] .",". $sqldata['tape']);
            if($audioTape[0] == $sqldata['tape'])
            {
              $tape = '<button class="btn btn-info btn-sm" id="delete-test" style="width:100px!important;max-width:100px!important;" onclick="playAudio('."'".$url_recorder."'".','."'".$audioTape[1]."'".')">
                    <small><span class="glyphicon glyphicon-play" aria-hidden="true"></span></small>
                        aloha'.$sqldata['id'].'
                    </button>';
            }
          }
          $audio =  '<button data-toggle="tooltip" data-placement="bottom" title="'.$sqldata['audio'].'-'.$sqldata['song_name'].'" class="btn btn-info btn-sm" id="delete-test" style="width:100px!important;max-width:100px!important;" onclick="playAudio('."'".$url_dejavu."'".','."'".$sqldata['song_name'].".wav'".')">
                    <small><span class="glyphicon glyphicon-play" aria-hidden="true"></span></small>
                        './*$sqldata['audio'].'-'.*/substr($sqldata['song_name'],0,7).'...
                    </button>';
          $generated_datetime =  $sqldata['generated_datetime'];
        }

        switch ($status)
        {
          case "1":
            $status = '<button class="btn btn-default btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-time" aria-hidden="true"></span></small>
                        Pending
                    </button>';
            break;
          case "2":
            $status = '<button class="btn btn-primary btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-time" aria-hidden="true"></span></small>
                        Checking
                    </button>';
            break;
          case "3":
            $status = '<button data-toggle="tooltip" data-placement="bottom" title="Confidence:'.$sqldata['confidence'].'" class="btn btn-success btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></small>
                        Passed
                    </button>';
            break;
          case "4":
            $status = '<button data-toggle="tooltip" data-placement="bottom" title="Confidence:'.$sqldata['confidence'].'" class="btn btn-danger btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Failed
                    </button>';
            break;
          case "5":
            $status = '<button data-toggle="tooltip" data-placement="bottom" title="Confidence:'.$sqldata['confidence'].'" class="btn btn-warning btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span></small>
                        Verify
                    </button>';
            break;
          default:
            $status = '<button class="btn btn-default btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Pending
                    </button>';
        }

        $mysql_data[] = array(
          "id"          => $sqldata['id'],
          "test"  => "T-".$sqldata['test'],
          "tape"  => $tape,
          "audio"  => $audio,
          "confidence"  => $sqldata['confidence'],
          //"offset_seconds"  => $sqldata['offset_seconds'],
          //"match_time"  => $sqldata['match_time'],
          //"offset"  => $sqldata['offset'],
          //"programmed_datetime"  => $sqldata['programmed_datetime'],
          "generated_datetime"  => $generated_datetime,
          "status"  => $status,
          "number"  => $sqldata['number'],
          "functions" => $functions
        );
      }
    }
  } 

  if ($job == 'get_tests_statistics')
  {
    $query = "select sum(case when `status` = 1 then 1 else 0 end) AS pending, sum(case when `status` = 3 then 1 else 0 end) AS passed, sum(case when `status` = 4 then 1 else 0 end) AS failed, sum(case when `status` = 5 then 1 else 0 end) AS tocheck from sample";
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
          "pending" => $sqldata['pending'],
          "passed"  => $sqldata['passed'],
          "failed"  => $sqldata['failed'],
          "tocheck"  => $sqldata['tocheck']
        );
      }
    }
  }

  if ($job == 'repeat_sample'){
    
    // Edit 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      $query = "UPDATE sample SET status = '1' WHERE id = '" . mysqli_real_escape_string($db_connection, $id) . "'";
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


function getOrekaAudios($db_server, $db_username, $db_password, $db_name)
{
  $db_connection = mysqli_connect($db_server, $db_username, $db_password, $db_name);

  $mysql_data = array();

  if (mysqli_connect_errno())
  {
    $result  = 'error';
    $message = 'Failed to connect to database: ' . mysqli_connect_error();
    $job     = '';
  }
  else
  {
    $query = "select * from oreka.orktape where localParty like 'aloha%'";
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
        array_push ( $mysql_data, array($sqldata['id'],$sqldata['filename']));
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

  mysqli_close($db_connection);

  return $data;
}

?>