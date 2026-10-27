# Reglas de Firebase

- `firestore.rules` y `storage.rules`: versión vigente para pegar en la consola de Firebase.
- `firestore.anterior.rules`: copia de las reglas de Firestore que había antes del 27/10/2026, para volver atrás si hace falta.
- `pruebas/`: pruebas automáticas contra el emulador de Firebase: ataques que tienen que quedar cerrados y flujos reales que tienen que funcionar.

Para correrlas, en una carpeta con `firebase-tools`, `@firebase/rules-unit-testing` y `firebase` instalados:

    npx firebase emulators:exec --only firestore "node firestore.test.mjs firestore.rules"
    npx firebase emulators:exec --only storage,firestore "node storage.test.mjs"
