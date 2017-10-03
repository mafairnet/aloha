<?php
include '../../auth_request.php';
include '../config/db.php';  


// Database details
$db_server   = $GLOBALS['aloha_db_server'];
$db_username = $GLOBALS['aloha_db_username'];
$db_password = $GLOBALS['aloha_db_password'];
$db_name     = $GLOBALS['aloha_db_name'];

$url_service = "http://orekacun.pricetravel.com.mx:8080/";

// Get job (and id)
$job = '';
$id  = '';
if (isset($_GET['job'])){
  $job = $_GET['job'];
  if ($job == 'get_tests' ||
      $job == 'get_test'   ||
      $job == 'add_test'   ||
      $job == 'edit_test'  ||
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
  
  if ($job == 'get_tests')
  {

    //$query = "select dat.id, dat.name, daf.description as frequency, dat.status, dat.scan_date_time from test dat, frecuency daf where dat.frecuency = daf.id";
    $query = "select dat.id, dat.name, daf.description as frequency, sample_time.status as status , dat.scan_date_time  from frecuency daf, test dat left join (select test, max(status) as status from sample group by test) as sample_time on sample_time.test = dat.id where dat.frecuency = daf.id";

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

        if( isset($_SESSION["admin"]))
        {
          if($_SESSION["admin"]==1)
          {
            $functions .= 'Delete';
          }
        }

        $status = $sqldata['status'];

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
            $status = '<button  class="btn btn-success btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></small>
                        Passed
                    </button>';
            break;
          case "4":
            $status = '<button class="btn btn-danger btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
                    <small><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></small>
                        Failed
                    </button>';
            break;
          case "5":
            $status = '<button class="btn btn-warning btn-sm" id="delete-test" style="width:80px!important;" onclick="newtest()">
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
          "name"  => $sqldata['name'],
          "frequency"  => $sqldata['frequency'],
          "scan_date_time"  => $sqldata['scan_date_time'],
          "status"  => $status,
          "functions" => $functions
        );
      }
    }
  } 

  if ($job == 'add_test'){

    
    /*foreach ($_GET['test_number_selected'] as $selectedOption)
      echo $selectedOption."\n";
      die('EOF');*/

    $test_name = $_GET['test_name'];
    $test_programmed_date = $_GET['test_programmed_date'];
    $test_end_programmed_date = $_GET['test_end_programmed_date'];
    $frequency = $_GET['test_frequency'];
    $test_number_selected = $_GET['test_number_selected']; 

    $result  = 'error';
    $message = 'query error';
    
    //Check numbers, if not added added with default options
    checkNumbers($test_number_selected,$db_connection);

    $test = createTest($test_name,$test_programmed_date,$test_end_programmed_date,$frequency,$db_connection);

    //echo "<p>TESTID:".$test."</p>";

    createSamples($test,$test_number_selected,$db_connection);

    //die("<p>EOS</p>");

      $result  = 'success';
      $message = 'query success';
  
  }

  if ($job == 'get_test'){
    //die("JOB:".$job);
    // Get extension
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {
      //$query = "SELECT * from test where id = " . mysqli_real_escape_string($db_connection,$id);
      //$query = "select dat.id as id, dat.name as name, dat.scan_date_time as programmed_date, dat.status as status, GROUP_CONCAT('id:',dan.id,',text:',dan.number SEPARATOR ';') as number from test dat, sample das join number dan on FIND_IN_SET(dan.id,das.number) where dat.id = das.test and dat.id = ".mysqli_real_escape_string($db_connection,$id)." group by dat.id";
      $query = "select dat.id as id, dat.name as name, dat.scan_date_time as programmed_date, dat.end_scan_date_time as end_programmed_date, dat.status as status,  dat.frecuency as frequency, GROUP_CONCAT(dan.id SEPARATOR ',') as number from test dat, sample das join number dan on FIND_IN_SET(dan.id,das.number) where dat.id = das.test and dat.id = ".mysqli_real_escape_string($db_connection,$id)." group by dat.id";

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
          //$numbers = explode(";", $sqldata['number']);
          //die(print_r($numbers));
          $numbers = $sqldata['number'];

          $mysql_data[] = array(
            "test_id" => $sqldata['id'],
            "test_name"  => $sqldata['name'],
            "test_status"  => $sqldata['status'],
            "test_programmed_date"  => $sqldata['programmed_date'],
            "test_end_programmed_date"  => $sqldata['end_programmed_date'],
            "test_frequency"  => $sqldata['frequency'],
            "test_number" => $numbers
          );
        }
      }
    }
  }

  if ($job == 'edit_test'){
    
    // Edit 
    if ($id == ''){
      $result  = 'error';
      $message = 'id missing';
    } else {

      $test_name = $_GET['test_name'];
      $test_programmed_date = $_GET['test_programmed_date'];
      $test_number_selected = $_GET['test_number_selected']; 

      $result  = 'error';
      $message = 'query error';
      
      

      $query = "UPDATE test SET ";
      if (isset($_GET['test_name'])) { $query .= "name = '" . mysqli_real_escape_string($db_connection, $_GET['test_name']) . "', "; }
      if (isset($_GET['test_frequency'])) { $query .= "frecuency = '" . mysqli_real_escape_string($db_connection, $_GET['test_frequency']) . "', "; }
      if (isset($_GET['test_programmed_date'])) { $query .= "scan_date_time = '" . mysqli_real_escape_string($db_connection, $_GET['test_programmed_date']) . "', "; }
      if (isset($_GET['test_end_programmed_date'])) { $query .= "end_scan_date_time = '" . mysqli_real_escape_string($db_connection, $_GET['test_end_programmed_date']) . "' "; }
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

      //Delete all asociated samples
      deleteAssociatedSamples($id,$db_connection);

      //Retrieve all numbers edited
      //Check numbers, if not added added with default options
      checkNumbers($test_number_selected,$db_connection);

      //Create all new samples
      createSamples($id,$test_number_selected,$db_connection);

      //die("<p>EOS</p>");

      $result  = 'success';
      $message = 'query success';

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



/**/

function checkNumbers($numbersToEvaluate,$db_connection)
{
  $registeredNumbers = getAllRegisteredNumbers($db_connection);
  //echo "<p>NumbersAdded:</p>";
  //print_r($registeredNumbers);
  $numbersToAdd = array();

  foreach ($numbersToEvaluate as $number) {
    $numberMatch = false;
    foreach ($registeredNumbers as $registeredNumber) {
      if($number==$registeredNumber[1])
      {
        $numberMatch = true;
      }
    }
    if(!$numberMatch)
    {
      array_push($numbersToAdd,$number);
    }
  }
  
  //echo "<p>NumbersToAdd:</p>";
  //print_r($numbersToAdd);
  
  foreach ($numbersToAdd as $number)
  {
    addNewDefaultNumber($number,$db_connection);
  }
}

function getAllRegisteredNumbers($db_connection)
{
  $query = "SELECT dan.id as id, dan.number as number FROM aloha.number dan";
  $query = mysqli_query($db_connection, $query);
  $registeredNumbers = array();  
  while ($sqldata = mysqli_fetch_array($query))
  {
    array_push($registeredNumbers,array($sqldata['id'],$sqldata['number']));
  }
  return $registeredNumbers;
}

function addNewDefaultNumber($number,$db_connection)
{
  // Add 
    $query = "INSERT INTO number SET ";
    $query .= "number = '" . $number . "', country = '6',type = '4'";
    //die ($query);
    //echo "<p>".$query."</p>";
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      //echo '<p>error</p>';
      $result  = 'error';
      $message = 'query error';
    } else {
      //echo '<p>success</p>';
      $result  = 'success';
      $message = 'query success';
    }
}

function getAllRegisteredTests($db_connection)
{
  $query = "SELECT * FROM aloha.test";
  $query = mysqli_query($db_connection, $query);
  $registeredTests = array();  
  while ($sqldata = mysqli_fetch_array($query))
  {
    array_push($registeredTests,array($sqldata['id'],$sqldata['name']));
  }
  return $registeredTests;
}

function createTest($test_name,$test_programmed_date,$test_end_programmed_date,$frequency,$db_connection)
{
  $registeredTests = getAllRegisteredTests($db_connection);
  $testMatch =false;
  $testId = 0;
  foreach ($registeredTests as $test) {
    if($test_name==$test[1])
    {
      $testMatch = true;
      $testId = $test[0];
    }
  }

  if(!$testMatch)
  {
    $testId = addTest($test_name,$test_programmed_date,$test_end_programmed_date,$frequency,$db_connection);
  }
  
  return $testId;
}

function addTest($test_name,$test_programmed_date,$test_end_programmed_date,$frequency,$db_connection)
{
  $testId = 0;
  $query = "INSERT INTO test SET ";
    $query .= "name = '" . $test_name . "', status = '1',scan_date_time = '".$test_programmed_date."',end_scan_date_time = '".$test_end_programmed_date."',frecuency = '".$frequency."'";
    //die ($query);
    //echo "<p>".$query."</p>";
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      //echo '<p>error</p>';
      $result  = 'error';
      $message = 'query error';
    } else {
      //echo '<p>success</p>';
      $result  = 'success';
      $message = 'query success';
    }

    $query = "SELECT id FROM aloha.test where name = '".$test_name."'";
    $query = mysqli_query($db_connection, $query);
    $test = mysqli_fetch_assoc($query);
    $testId = $test['id'];
  return $testId;
}

function createSamples($test,$test_number_selected,$db_connection)
{
  $registeredNumbers = getAllRegisteredNumbers($db_connection);
  $numbersToAdd = array();
  foreach ($test_number_selected as $number) {
    $numberMatch = false;
    $numberId=0;
    foreach ($registeredNumbers as $registeredNumber) {
      //echo "<p>DDN:".$number."?".$registeredNumber[1]."</p>";
      if($number==$registeredNumber[1])
      {
        $numberMatch = true;
        $numberId = $registeredNumber[0];
      }
    }
    if($numberMatch)
    {
      array_push($numbersToAdd,$numberId);
    }
    
  }

  print_r($numbersToAdd);

  foreach ($numbersToAdd as $number) {
    createSample($test,$number,$db_connection);
  }
}

function createSample($test,$number,$db_connection)
{
  $query = "INSERT INTO sample SET ";
    $query .= "number = '" . $number . "', test = '" . $test . "',status = '1', generated_datetime = '1988-01-01 00:00:00'";
    //die ($query);
    //echo "<p>".$query."</p>";
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      //echo '<p>error</p>';
      $result  = 'error';
      $message = 'query error';
    } else {
      //echo '<p>success</p>';
      $result  = 'success';
      $message = 'query success';
    }
}

function deleteAssociatedSamples($id,$db_connection)
{
  $query = "delete from sample where test = '" . $id."'";
    //die ($query);
    //echo "<p>".$query."</p>";
    $query = mysqli_query($db_connection, $query);
    if (!$query){
      //echo '<p>error</p>';
      $result  = 'error';
      $message = 'query error';
    } else {
      //echo '<p>success</p>';
      $result  = 'success';
      $message = 'query success';
    }
}


?>