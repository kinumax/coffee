const myPeerIdEl = document.getElementById('myPeerId');
const targetPeerIdInput = document.getElementById('targetPeerIdInput');
const hostButton = document.getElementById('hostButton');
const connectButton = document.getElementById('connectButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const messagesDiv = document.getElementById('messages');

let peer = null;
let currentConnection = null; // 現在のDataConnectionまたはMediaConnectionを保持

// PeerJSサーバーの設定 (server.jsで定義したポートとパスを使用)
const PEER_SERVER_CONFIG = {
    host: 'localhost', // server.jsが動いているアドレス
    port: 9000,
    path: '/myapp',
    // NAT越えのためのSTUNサーバー設定 (必須)
    config: {
        'iceServers': [
            { 'urls': 'stun:stun.l.google.com:19302' }
        ]
    }
};

// メッセージを画面に表示するヘルパー関数
function appendMessage(text, sender = 'システム') {
    const p = document.createElement('p');
    p.textContent = `${sender}: ${text}`;
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // スクロールを一番下へ
}

// PeerJSインスタンスの初期化
function initializePeer(id = null) {
    if (peer) {
        peer.destroy(); // 既存のPeerインスタンスがあれば破棄
        peer = null;
    }
    peer = new Peer(id, PEER_SERVER_CONFIG);

    // PeerJSサーバーへの接続成功時
    peer.on('open', (newId) => {
        myPeerIdEl.textContent = newId;
        appendMessage(`PeerJSサーバーに接続しました。あなたのID: ${newId}`);
        console.log(`[Peer] PeerJSサーバーに接続しました。ID: ${newId}`);
    });

    // エラー発生時
    peer.on('error', (err) => {
        console.error('[Peer] PeerJSエラー:', err);
        appendMessage(`エラー: ${err.message || err.type}`, 'PeerJS');
        if (err.type === 'peer-unavailable') {
            appendMessage('指定されたPeer IDが見つかりません。相手がオンラインで、IDが正しいか確認してください。');
        } else if (err.type === 'network') {
            appendMessage('ネットワーク接続の問題です。インターネット接続またはサーバーを確認してください。');
        } else if (err.type === 'disconnected') {
            appendMessage('PeerJSサーバーから切断されました。');
        }
    });

    // 接続が閉じられた時 (PeerJSサーバーとの接続)
    peer.on('close', () => {
        console.log('[Peer] PeerJS接続が閉じられました。');
        appendMessage('PeerJS接続が切断されました。');
    });

    // PeerJSサーバーから切断された時 (再接続を試みる場合などに利用)
    peer.on('disconnected', () => {
        console.log('[Peer] PeerJSサーバーから切断されました。再接続を試みます...');
        appendMessage('PeerJSサーバーから切断されました。');
        // 必要であればここで自動再接続ロジックを実装
    });

    // ゲストからのデータ接続があった時 (ホスト側が受信)
    peer.on('connection', (conn) => {
        console.log(`[Peer] '${conn.peer}' からデータ接続がありました。`);
        appendMessage(`'${conn.peer}' からデータ接続要求。`);
        setupConnectionEvents(conn);
    });

    // ゲストからのメディア接続 (ビデオ/音声) があった時 (ホスト側が受信)
    peer.on('call', (call) => {
        console.log(`[Peer] '${call.peer}' からメディア接続がありました。`);
        appendMessage(`'${call.peer}' からメディア接続要求。`);

        // 自分のローカルメディアストリームを取得
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideo.srcObject = stream;
                call.answer(stream); // 自分のストリームを送信して応答

                call.on('stream', (remoteStream) => {
                    console.log('[Call] 相手のメディアストリームを受信。');
                    remoteVideo.srcObject = remoteStream; // 相手のストリームを表示
                });

                call.on('close', () => {
                    console.log('[Call] メディア接続が閉じられました。');
                    appendMessage('メディア接続が閉じられました。');
                    remoteVideo.srcObject = null;
                });

                call.on('error', (err) => {
                    console.error('[Call] メディア接続エラー:', err);
                    appendMessage(`メディア接続エラー: ${err.message}`, 'メディア');
                });
            })
            .catch(err => {
                console.error('メディアアクセスエラー:', err);
                appendMessage(`メディアへのアクセスを許可してください: ${err.message}`);
            });
    });
}

// 接続イベントのセットアップ
function setupConnectionEvents(conn) {
    // 既存の接続があればクローズ
    if (currentConnection) {
        currentConnection.close();
    }
    currentConnection = conn; // 新しい接続を設定

    conn.on('open', () => {
        console.log(`[Connection] '${conn.peer}' とのデータ接続が確立されました。`);
        appendMessage(`'${conn.peer}' とデータ接続が確立されました！`);
        sendMessageButton.disabled = false; // 送信ボタンを有効化
        messageInput.disabled = false;
        messageInput.focus();
    });

    conn.on('data', (data) => {
        console.log(`[Connection] '${conn.peer}' からデータを受信:`, data);
        appendMessage(data, conn.peer);
    });

    conn.on('close', () => {
        console.log(`[Connection] '${conn.peer}' とのデータ接続が閉じられました。`);
        appendMessage(`'${conn.peer}' とのデータ接続が閉じられました。`);
        currentConnection = null;
        sendMessageButton.disabled = true; // 送信ボタンを無効化
        messageInput.disabled = true;
    });

    conn.on('error', (err) => {
        console.error(`[Connection] '${conn.peer}' とのデータ接続エラー:`, err);
        appendMessage(`データ接続エラー: ${err.message}`, '接続');
    });
}

// --- イベントリスナー ---

// ホストになるボタンクリック
hostButton.addEventListener('click', () => {
    appendMessage('ホストとして待機中...');
    initializePeer(); // IDを指定しない場合はPeerJSサーバーが生成
    hostButton.disabled = true;
    connectButton.disabled = true;
    targetPeerIdInput.disabled = true;
});

// 相手に接続するボタンクリック
connectButton.addEventListener('click', () => {
    const targetPeerId = targetPeerIdInput.value.trim();
    if (!targetPeerId) {
        alert('相手のPeer IDを入力してください！');
        return;
    }

    appendMessage(`'${targetPeerId}' への接続を試みています...`);
    initializePeer(); // 接続側もPeerJSインスタンスを初期化

    // PeerJSインスタンスが`open`イベントを発火した後に接続を開始
    peer.on('open', () => {
        // データ接続を確立
        const dataConn = peer.connect(targetPeerId);
        setupConnectionEvents(dataConn);

        // メディア接続（ビデオ/音声通話）を開始
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideo.srcObject = stream;
                const mediaCall = peer.call(targetPeerId, stream);

                mediaCall.on('stream', (remoteStream) => {
                    console.log('[Call] 相手のメディアストリームを受信。');
                    remoteVideo.srcObject = remoteStream;
                });

                mediaCall.on('close', () => {
                    console.log('[Call] メディア接続が閉じられました。');
                    appendMessage('メディア接続が閉じられました。');
                    remoteVideo.srcObject = null;
                });

                mediaCall.on('error', (err) => {
                    console.error('[Call] メディア接続エラー:', err);
                    appendMessage(`メディア接続エラー: ${err.message}`, 'メディア');
                });
            })
            .catch(err => {
                console.error('メディアアクセスエラー:', err);
                appendMessage(`メディアへのアクセスを許可してください: ${err.message}`);
            });
    });

    hostButton.disabled = true;
    connectButton.disabled = true;
    targetPeerIdInput.disabled = true;
});

// メッセージ送信ボタンクリック
sendMessageButton.addEventListener('click', () => {
    if (currentConnection && currentConnection.open) {
        const message = messageInput.value.trim();
        if (message) {
            currentConnection.send(message);
            appendMessage(message, 'あなた');
            messageInput.value = '';
        }
    } else {
        appendMessage('まだ接続されていません。');
    }
});

// Enterキーでメッセージ送信
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageButton.click();
    }
});

// 初期状態では送信ボタンと入力欄は無効
sendMessageButton.disabled = true;
messageInput.disabled = true;

// ページロード時にユーザーにPeerJSインスタンスを初期化するように促す
appendMessage('「ホストになる」か、相手のIDを入力して「相手に接続する」を選択してください。');
