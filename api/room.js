// api/rooms.js
// Vercel Functionsはステートレスなので、この `rooms` 変数はデプロイ/コールドスタート時にリセットされます。
// 本番環境では永続的なデータストア (Vercel Postgres, MongoDB Atlas, Redisなど) を利用すべきです。
let rooms = {};

module.exports = async (req, res) => {
    // CORSヘッダーの設定 (VercelのデプロイURLからのアクセスを許可するために重要)
    res.setHeader('Access-Control-Allow-Origin', '*'); // 開発中は '*' でも良いが、本番では特定のVercel URLに制限すべき
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // プリフライトリクエスト (OPTIONSメソッド) の処理
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    // 古いルームのクリーンアップ（簡易版、Functionの起動頻度によるため厳密ではない）
    const now = Date.now();
    for (const roomId in rooms) {
        // 例: 30分以上前のルームを削除 (本番ではもっと複雑なロジックが必要)
        if (now - rooms[roomId].createdAt.getTime() > 30 * 60 * 1000) { 
            delete rooms[roomId];
            console.log(`古いルームを削除: ${roomId}`);
        }
    }

    if (req.method === 'POST') {
        const { name, hostPeerId } = req.body;
        if (!name || !hostPeerId) {
            return res.status(400).json({ message: 'ルーム名とホストのPeer IDが必要です。' });
        }
        const roomId = require('uuid').v4(); // uuidパッケージをVercelに含める必要あり
        rooms[roomId] = { name, hostPeerId, createdAt: new Date() };
        console.log(`ルーム作成: <span class="math-inline">\{name\} \(</span>{roomId}) by ${hostPeerId}`);
        res.status(201).json({ roomId, name, hostPeerId });
    } else if (req.method === 'GET') {
        const activeRooms = Object.keys(rooms).map(roomId => ({
            roomId,
            name: rooms[roomId].name,
            hostPeerId: rooms[roomId].hostPeerId
        }));
        res.status(200).json(activeRooms);
    } else if (req.method === 'DELETE') {
        const roomId = req.url.split('/').pop(); // 例: /api/rooms/xxx から xxx を抽出
        if (rooms[roomId]) {
            delete rooms[roomId];
            console.log(`ルーム削除: ${roomId}`);
            res.status(204).send(); // No Content
        } else {
            res.status(404).json({ message: 'ルームが見つかりません。' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
