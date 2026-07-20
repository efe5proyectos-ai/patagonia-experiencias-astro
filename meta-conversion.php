<?php
/**
 * =============================================================================
 * META CONVERSIONS API — Endpoint de compra para Patagonia Experiencias
 * =============================================================================
 * Recibe una compra confirmada desde la plataforma y se la reporta a Meta
 * (Facebook/Instagram) vía Conversions API, para que las campañas de Meta Ads
 * puedan optimizar hacia compradores reales.
 *
 * POR QUÉ EXISTE: Mercado Pago cobra en su sitio (offsite), entonces el pixel
 * del navegador nunca ve la compra. Este archivo la manda desde el servidor.
 *
 * CÓMO USARLO:
 * 1. Completá las DOS variables de abajo con tus datos de Meta.
 * 2. Subí este archivo por FTP a la raíz de tu sitio (ej: /meta-conversion.php).
 * 3. La plataforma le pega a este archivo cuando una reserva se paga.
 * =============================================================================
 */

// ⬇️⬇️⬇️  COMPLETÁ ESTOS DOS DATOS (los sacás del Administrador de eventos de Meta)  ⬇️⬇️⬇️
$DATASET_ID   = '1501384968138883';       // el número largo del pixel/dataset
$ACCESS_TOKEN = 'EAASgRiKPZCJwBRxklB2UFIQbYs40gyCfXga4cZCtNoczgF4jb8ZBBI8vfKLvm21mQBxlapaesuGsiEZBEiXZAKskjZAnspNEJmcpw2w5rfzs8WmIW20LqVClwaHkM0JHe9ZCya6QDnV8EzZAnLvRSpKMIN4CPoRkh5VnVbZBBhiVEKHxZCVYxrqcrOSTKJoXgzUYhIcQZDZD';        // el token que empieza con EAA...
// ⬆️⬆️⬆️  (nada más que tocar debajo de esta línea)  ⬆️⬆️⬆️

// Un "secreto" simple para que solo tu plataforma pueda usar este endpoint.
// Poné acá cualquier palabra difícil e inventada, y la misma en la plataforma.
$CLAVE_INTERNA = 'patagonia-capi-2026-cambiar-esto';

// ---------------------------------------------------------------------------
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit;
}

// Leer el cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['error' => 'Sin datos']); exit; }

// Validar la clave interna (evita que cualquiera dispare compras falsas)
if (!isset($input['clave']) || $input['clave'] !== $CLAVE_INTERNA) {
    http_response_code(403); echo json_encode(['error' => 'No autorizado']); exit;
}

// Función de hash que exige Meta (SHA-256, minúsculas, sin espacios)
function hashear($valor) {
    return hash('sha256', strtolower(trim($valor)));
}

// Datos de la compra que envía la plataforma
$email     = isset($input['email']) ? $input['email'] : '';
$telefono  = isset($input['telefono']) ? preg_replace('/[^0-9]/', '', $input['telefono']) : '';
$valor     = isset($input['valor']) ? floatval($input['valor']) : 0;
$moneda    = isset($input['moneda']) ? $input['moneda'] : 'ARS';
$eventId   = isset($input['event_id']) ? $input['event_id'] : uniqid('pe_');
$tourNombre= isset($input['tour']) ? $input['tour'] : '';
$fbp       = isset($input['fbp']) ? $input['fbp'] : null;  // cookie del pixel si existe
$fbc       = isset($input['fbc']) ? $input['fbc'] : null;

// Armar el user_data (Meta necesita al menos un dato de contacto hasheado)
$userData = [];
if ($email)    { $userData['em'] = [hashear($email)]; }
if ($telefono) { $userData['ph'] = [hashear($telefono)]; }
if ($fbp)      { $userData['fbp'] = $fbp; }
if ($fbc)      { $userData['fbc'] = $fbc; }
$userData['client_ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
$userData['client_user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Armar el evento Purchase
$evento = [
    'event_name'    => 'Purchase',
    'event_time'    => time(),
    'event_id'      => $eventId,           // para deduplicar si algún día se suma el pixel
    'action_source' => 'website',
    'event_source_url' => 'https://patagoniaexperiencias.com',
    'user_data'     => $userData,
    'custom_data'   => [
        'currency' => $moneda,
        'value'    => $valor,
        'content_name' => $tourNombre,
        'content_type' => 'product'
    ]
];

$payload = ['data' => [$evento]];

// Enviar a Meta
$url = "https://graph.facebook.com/v19.0/{$DATASET_ID}/events?access_token={$ACCESS_TOKEN}";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$respuesta = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Responder
if ($httpCode === 200) {
    echo json_encode(['ok' => true, 'meta' => json_decode($respuesta, true)]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'httpCode' => $httpCode, 'meta' => json_decode($respuesta, true)]);
}
