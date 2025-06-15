const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // ユニークID生成用

const app = express();
const PORT = process.env.PORT || 3000; // APIサーバーのポート。PeerJSサーバーの9000とは異なるポートを使用

app.use(cors()); // 全てのオリジンからのアクセスを許可 (開発用)
app.use(express.json()); // JSONボディをパース

// ルーム情報を保持するシンプルなメモリ内ストア
// 実際にはデータベース（MongoDB, PostgreSQLなど）を使用すべき
const rooms = {}; // { roomId: { name: 'ルーム名', hostPeerId: 'ホストのPeerID', createdAt: Date } }

// ルーム作成API
app.post('/api/rooms', (req, res) => {
    const { name, hostPeerId } = req.body;
    if (!name || !hostPeerId) {
        return res.status(400).json({ message: 'ルーム名とホストのPeer IDが必要です。' });
    }

    const roomId = uuidv4(); // ユニークなルームIDを生成
    rooms[roomId] = { name, hostPeerId, createdAt: new Date() };
    console.log(`ルーム作成: ${name} (${roomId}) by ${hostPeerId}`);
    res.status(201).json({ roomId, name, hostPeerId });
});

// ルーム一覧取得API
app.get('/api/rooms', (req, res) => {
    // 古いルームのクリーンアップ（例: 24時間以上前のルームを削除）
    const now = Date.now();
    for (const roomId in rooms) {
        if (now - rooms[roomId].createdAt.getTime() > 24 * 60 * 60 * 1000) { // 24時間
            delete rooms[roomId];
            console.log(`古いルームを削除: ${roomId}`);
        }
    }
    
    // 現在アクティブなルームのリストを返す
    const activeRooms = Object.keys(rooms).map(roomId => ({
        roomId,
        name: rooms[roomId].name,
        hostPeerId: rooms[roomId].hostPeerId
    }));
    res.json(activeRooms);
});

// ルーム削除API (ホストが通話を終了した際に呼び出す)
app.delete('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    if (rooms[roomId]) {
        delete rooms[roomId];
        console.log(`ルーム削除: ${roomId}`);
        res.status(204).send(); // No Content
    } else {
        res.status(404).json({ message: 'ルームが見つかりません。' });
    }
});

app.listen(PORT, () => {
    console.log(`ルーム管理サーバーが http://localhost:${PORT} で起動しました。`);
});
