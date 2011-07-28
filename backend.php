<?php

session_start();
header('Content-Type: text/plain; charset=utf-8');

$_SESSION['documents'] = isset($_SESSION['documents']) ? $_SESSION['documents'] : array();
$docs = &$_SESSION['documents'];
$url = isset($_REQUEST['q']) ? $_REQUEST['q'] : '';

if ($url == 'documents') {
  if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if ($input = file_get_contents("php://input")) {
      $input = json_decode($input);
      if (empty($input)) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 403 Bad Request');
        exit();
      }
      $input->id = substr(md5(mt_rand()), 0, 4);
      $docs[$input->id] = $response = $input;
    }
  }
  $response = array_values($docs);
}
elseif (preg_match('~^documents/(\w+)$~', $url, $matches)) {
  $id = $matches[1];
  if (!isset($docs[$id])) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    exit();
  }
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
    case 'POST':
      if ($input = file_get_contents("php://input")) {
        $input = json_decode($input);
        if (!isset($docs[$id]) || empty($input)) {
          header($_SERVER['SERVER_PROTOCOL'] . ' 403 Bad Request');
          exit();
        }
        $docs[$id] = $input;
        $response = $docs[$id];
      }
      break;
    case 'DELETE':
      unset($docs[$id]);
      $response = TRUE;
      break;
    case 'GET':
      $response = $docs[$id];
      break;
  }
}

print json_encode($response);
