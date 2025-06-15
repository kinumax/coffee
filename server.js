const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9000, // PeerJSサーバーがリッスンするポート
  path: '/myapp' // クライアントが接続するパス
});

peerServer.on('connection', (id) => {
  console.log(`[PeerJS Server] Peer connected: ${id}`);
});

peerServer.on('disconnect', (id) => {
  console.log(`[PeerJS Server] Peer disconnected: ${id}`);
});

console.log('PeerJS server running on ws://localhost:9000/myapp');
console.log('Open index.html in your browser to connect.');
