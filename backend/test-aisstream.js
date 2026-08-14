const WebSocket = require('ws');

const apiKey = process.argv[2];
if (!apiKey) {
  console.error('Usage: node test-aisstream.js TA_CLE_API');
  process.exit(1);
}

const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

ws.on('open', () => {
  console.log('✅ Connexion ouverte. Envoi de la souscription...');

  const subscription = {
    APIKey: apiKey,
    // Couvre la Manche et le golfe de Gascogne
    BoundingBoxes: [
      [[43.0, -10.0], [51.5, 3.0]]
    ]
  };

  ws.send(JSON.stringify(subscription));
});

ws.on('message', (raw) => {
  console.log('\n SUCCESS ! MESSAGE AIS REÇU :');
  console.log(raw.toString().slice(0, 300));
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('❌ Erreur :', err.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 Fermé. Code: ${code}, raison: ${reason?.toString() || '(aucune)'}`);
});

console.log(" Ecoute du flux pendant 45 secondes...");
setTimeout(() => {
  console.log("⏱️ Aucun message en 45s.");
  ws.close();
  process.exit(0);
}, 45000);