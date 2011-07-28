<?php

session_start();
header('Content-Type: text/plain; charset=utf-8');

$_SESSION['documents'] = isset($_SESSION['documents']) ? $_SESSION['documents'] : array();
$docs = &$_SESSION['documents'];
$url = isset($_REQUEST['q']) ? $_REQUEST['q'] : '';

if ($url == 'documents') {
  if ($input = file_get_contents("php://input")) {
    $input = json_decode($input);
    if (empty($input)) {
      header($_SERVER['SERVER_PROTOCOL'] . ' 403 Bad Request');
      exit();
    }
    $input->id = substr(md5(mt_rand()), 0, 4);
    $docs[$input->id] = $response = $input;
  }
  else {
    $response = array_values($docs);
  }
}
elseif (preg_match('~^documents/(\w+)$~', $url, $matches)) {
  $id = $matches[1];
  if ($input = file_get_contents("php://input")) {
    $input = json_decode($input);
    if (!isset($docs[$id]) || empty($input)) {
      header($_SERVER['SERVER_PROTOCOL'] . ' 403 Bad Request');
      exit();
    }
    $docs[$id] = $input;
  }

  $response = isset($docs[$id]) ? $docs[$id] : FALSE;
}

print json_encode($response);
