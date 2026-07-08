<?php

// CORS = Cross-Origin Resource Sharing.
// Das Frontend läuft z.B. auf http://localhost:5173, das Backend auf http://localhost:8000.
// Das sind unterschiedliche "Origins" – der Browser blockt das standardmäßig.
// Hier erlauben wir dem Frontend ausdrücklich, das Backend anzusprechen.
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Im Demo-Betrieb erlauben wir alle Origins. Für Produktion hier die echte
    // Frontend-URL eintragen, z.B. ['https://askly.example.com'].
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
