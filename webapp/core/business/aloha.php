<?php
	include 'core/config/db.php';
  
	function getCatalog($catalog)
	{
    // Database details
    $db_server   = $GLOBALS['aloha_db_server'];
    $db_username = $GLOBALS['aloha_db_username'];
    $db_password = $GLOBALS['aloha_db_password'];
    $db_name     = $GLOBALS['aloha_db_name'];
    
    // Connect to database
    $db_connection = mysqli_connect($db_server, $db_username, $db_password, $db_name);
    if (mysqli_connect_errno())
    {
      $result  = 'error';
      $message = 'Failed to connect to database: ' . mysqli_connect_error();
      $job     = '';
    }
  
    // Execute job
    if ($catalog == 'test')
    {
    
      // Get tests
      $query = "SELECT * FROM test ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "text"  => $test['status']
          );
        }
      }  
    }

    if ($catalog == 'type')
    {
    
      // Get tests
      $query = "SELECT * FROM type ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "text"  => $test['name']
          );
        }
      }  
    }

    if ($catalog == 'country')
    {
    
      // Get tests
      $query = "SELECT * FROM country ORDER BY name";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "text"  => $test['name']
          );
        }
      }  
    }

    if ($catalog == 'number')
    {
    
      // Get tests
      $query = "SELECT * FROM number ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "text"  => $test['number']
          );
        }
      }  
    }

    if ($catalog == 'select2-multiple-number')
    {
    
      // Get tests
      $query = "SELECT * FROM number ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "number"          => $test['number'],
            "text"  => $test['number']
          );
        }
      }  
    }

    if ($catalog == 'sample')
    {
    
      // Get tests
      $query = "SELECT * FROM sample ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "test"  => $test['number'],
            "tape"  => $test['country'],
            "audio"  => $test['type'],
            "confidence"  => $test['type'],
            "offset_seconds"  => $test['type'],
            "match_time"  => $test['type'],
            "offset"  => $test['type'],
            "datetime"  => $test['type'],
            "status"  => $test['type'],
            "number"  => $test['parent']
          );
        }
      }  
    }

    if ($catalog == 'frequency')
    {
    
      // Get tests
      $query = "SELECT * FROM frecuency ORDER BY id";
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
        while ($test = mysqli_fetch_array($query))
        {
          $mysql_data[] = array(
            "id"          => $test['id'],
            "text"  => $test['description']
          );
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
  }
?>