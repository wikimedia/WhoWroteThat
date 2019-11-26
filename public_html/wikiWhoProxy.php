<?php

header( 'Access-Control-Allow-Origin: *' );

// Restrict access to Wikipedias.
if ( 1 !== preg_match( '/^https:\/\/.*?\.wikipedia\.org/', $_SERVER[ 'HTTP_REFERER' ] ) ) {
    http_response_code( 403 );
    die();
}

$configPath = dirname( __FILE__, 2 ) . '/wikiwho.ini';
$cnf = parse_ini_file( $configPath );
if ( !$cnf || !$cnf[ 'user' ] || !$cnf[ 'password' ] ) {
    throw new Exception(
        'WikiWho API credentials not found at ' . $configPath
    );
}

// Strip out /wikiwho for the Toolforge location.
$endpoint = preg_replace( '/^\/wikiwho/', '', $_SERVER['REQUEST_URI'] );
$redirectUrl = "https://api.wikiwho.net$endpoint";

// Setup cURL handler and make the request.
$ch = curl_init( $redirectUrl );
curl_setopt( $ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json' ] );
curl_setopt( $ch, CURLOPT_USERPWD, $cnf[ 'user' ] . ':' . $cnf[ 'password' ] );
curl_setopt( $ch, CURLOPT_TIMEOUT, 180);
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
$content = curl_exec( $ch );
$response = curl_getinfo( $ch );

// Throw exception if there was an error.
if ( $content === false ) {
    http_response_code( 500 );
    throw new Exception( curl_error( $ch ), curl_errno( $ch ) );
}

curl_close( $ch );

// Ensure our response code and content type are the same as WikiWho's.
http_response_code( $response[ 'http_code' ] );
header( 'Content-Type: ' . $response[ 'content_type' ] );

echo $content;
