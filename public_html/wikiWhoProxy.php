<?php

header( 'Content-Type: application/json' );
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
$context = stream_context_create( [
    'http' => [
        'method' => 'GET',
        'header' => 'Authorization: Basic ' . base64_encode( $cnf[ 'user' ] . ':' . $cnf[ 'password' ] ),
    ],
] );

echo file_get_contents( $redirectUrl, false, $context );
