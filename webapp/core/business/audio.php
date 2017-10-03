<?php


error_reporting(E_ALL);
ini_set('display_errors', 1);
/*echo exec('whoami');
print_r($_POST);
*/

date_default_timezone_set('America/Cancun');


if(isset($_GET['message']))
{
    $message = $_GET['message'];
}
else
{
    $message = "";
}

if(isset($_POST['fileuploader-list-files']))
{
    
    include('../../vendor/fileuploader/class.fileuploader.php');

    
	// initialize FileUploader
    $FileUploader = new FileUploader('files', array(
        'uploadDir' => '../../dejavu/audios/',
        'title' => 'name'
    ));

	// unlink the files
	// !important only for appended files
	// you will need to give the array with appendend files in 'files' option of the FileUploader
	foreach($FileUploader->getRemovedFiles('file') as $key=>$value) {
		unlink('../../dejavu/audios/' . $value['name']);
	}
	
	// call to upload the files
    $data = $FileUploader->upload();
    
    // if uploaded and success
    if($data['isSuccess'] && count($data['files']) > 0) {
        // get uploaded files
        $uploadedFiles = $data['files'];
    }
    // if warnings
	if($data['hasWarnings']) {
        // get warnings
        $warnings = $data['warnings'];
        
   		echo '<pre>';
        print_r($warnings);
		echo '</pre>';
        exit;
    }
	
	// get the fileList
	$fileList = $FileUploader->getFileList();
	
	// show
	/*
    echo '<pre>';
	print_r($fileList);
	echo '</pre>';
    die("EOF");
    */
    if(sizeof($fileList)>0)
    {
        $message = "<p>The next audios are been processed. They will apppear on the audio catalog after the process is completed:</p><ul>";

        foreach($fileList as $file)
        {
            $message .= '<li>'.$file["name"].'</li>';
        }

        $message .= "</ul>";
    }
    
    $actual_uri = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];

    if ($actual_uri == "http://aloha.pricetravel.com.mx/core/business/audio.php")
    {

        header('Location: http://aloha.pricetravel.com.mx/index.php?view=audio&message='.$message); /* Redirect browser */
    }
    else
    {
        header('Location: http://localhost:88/cti/devs/aloha/index.php?view=audio&message='.$message);
    }
    die();
}