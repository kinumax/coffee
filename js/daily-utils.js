// Daily.co統合用ユーティリティ関数

// 配信開始関数
async function startStreaming(hostName, roomTitle) {
    try {
        AppState.streamingError = null;
        
        const result = await roomManager.createRoom(hostName, roomTitle);
        
        if (result.success) {
            AppState.isStreaming = true;
            AppState.currentRoom = roomManager.getCurrentRoom();
            AppState.roomUrl = result.roomUrl;
            AppState.participantCount = 1; // ホスト自身
            
            // UI更新
            renderApp();
            
            return {
                success: true,
                roomUrl: result.roomUrl,
                roomName: result.roomName
            };
        } else {
            AppState.streamingError = result.error;
            renderApp();
            return result;
        }
    } catch (error) {
        console.error('配信開始エラー:', error);
        AppState.streamingError = error.message;
        renderApp();
        return { success: false, error: error.message };
    }
}

// 配信停止関数
async function stopStreaming() {
    try {
        const success = await roomManager.leaveCurrentRoom();
        
        if (success) {
            AppState.isStreaming = false;
            AppState.currentRoom = null;
            AppState.roomUrl = '';
            AppState.participantCount = 0;
            AppState.streamingError = null;
            
            // UI更新
            renderApp();
        }
        
        return success;
    } catch (error) {
        console.error('配信停止エラー:', error);
        AppState.streamingError = error.message;
        renderApp();
        return false;
    }
}

// ルーム参加関数
async function joinRoom(roomUrl, listenerName) {
    try {
        AppState.streamingError = null;
        
        const result = await roomManager.joinRoom(roomUrl, listenerName);
        
        if (result.success) {
            AppState.isListening = true;
            AppState.currentRoom = roomManager.getCurrentRoom();
            AppState.roomUrl = roomUrl;
            
            // 参加者数更新のリスナー設定
            const room = roomManager.getCurrentRoom();
            if (room && room.streamer) {
                room.streamer.addEventListener((eventType, data) => {
                    if (eventType === 'participant-joined' || eventType === 'participant-left') {
                        AppState.participantCount = room.streamer.getParticipantCount();
                        renderApp();
                    }
                });
            }
            
            // UI更新
            renderApp();
            
            return result;
        } else {
            AppState.streamingError = result.error;
            renderApp();
            return result;
        }
    } catch (error) {
        console.error('ルーム参加エラー:', error);
        AppState.streamingError = error.message;
        renderApp();
        return { success: false, error: error.message };
    }
}

// ルーム退出関数
async function leaveRoom() {
    try {
        const success = await roomManager.leaveCurrentRoom();
        
        if (success) {
            AppState.isListening = false;
            AppState.currentRoom = null;
            AppState.roomUrl = '';
            AppState.participantCount = 0;
            AppState.streamingError = null;
            
            // UI更新
            renderApp();
        }
        
        return success;
    } catch (error) {
        console.error('ルーム退出エラー:', error);
        AppState.streamingError = error.message;
        renderApp();
        return false;
    }
}

// 音声切り替え関数
async function toggleStreamingAudio() {
    try {
        const room = roomManager.getCurrentRoom();
        if (room && room.streamer) {
            const audioOn = await room.streamer.toggleAudio();
            renderApp();
            return audioOn;
        }
        return false;
    } catch (error) {
        console.error('音声切り替えエラー:', error);
        return false;
    }
}

// ルームURL共有関数
function shareRoomUrl(roomUrl) {
    if (navigator.share) {
        // Web Share API対応
        navigator.share({
            title: 'Coffee配信に参加',
            text: 'ライブ配信を聞いてみませんか？',
            url: roomUrl
        }).catch(console.error);
    } else {
        // フォールバック：クリップボードにコピー
        navigator.clipboard.writeText(roomUrl).then(() => {
            alert('ルームURLをクリップボードにコピーしました');
        }).catch(() => {
            // さらなるフォールバック：プロンプト表示
            prompt('ルームURLをコピーしてください:', roomUrl);
        });
    }
}

// ルームURL検証関数
function validateRoomUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('daily.co') && urlObj.pathname.length > 1;
    } catch (error) {
        return false;
    }
}

// 配信状態チェック関数
function getStreamingStatus() {
    return {
        isStreaming: AppState.isStreaming,
        isListening: AppState.isListening,
        participantCount: AppState.participantCount,
        roomUrl: AppState.roomUrl,
        hasError: !!AppState.streamingError,
        error: AppState.streamingError
    };
}

// Daily.co初期化関数
async function initializeDaily() {
    try {
        // Daily.co SDKの動的読み込み
        if (typeof DailyIframe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@daily-co/daily-js';
            script.async = true;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('Daily.co SDK loaded');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('Failed to load Daily.co SDK');
                    reject(false);
                };
                document.head.appendChild(script);
            });
        }
        return true;
    } catch (error) {
        console.error('Daily.co初期化エラー:', error);
        return false;
    }
}

// エラーハンドリング関数
function handleStreamingError(error) {
    console.error('配信エラー:', error);
    
    let userMessage = '';
    if (error.includes('permission')) {
        userMessage = 'マイクへのアクセス許可が必要です';
    } else if (error.includes('network')) {
        userMessage = 'ネットワーク接続を確認してください';
    } else if (error.includes('room')) {
        userMessage = 'ルームが見つかりません';
    } else {
        userMessage = '配信中にエラーが発生しました';
    }
    
    AppState.streamingError = userMessage;
    renderApp();
}

// 参加者情報フォーマット関数
function formatParticipantInfo(participants) {
    return participants.map(p => ({
        id: p.session_id,
        name: p.user_name || '匿名',
        isLocal: p.local,
        audioEnabled: p.audio,
        joinedAt: p.joined_at
    }));
}

// 配信時間計算関数
function calculateStreamingDuration(startTime) {
    const now = new Date();
    const diff = now - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ルーム情報表示用関数
function getRoomDisplayInfo() {
    const room = roomManager.getCurrentRoom();
    if (!room) return null;
    
    return {
        name: room.name,
        title: room.title || 'ライブ配信',
        host: room.host || '配信者',
        participantCount: AppState.participantCount,
        isHost: AppState.isStreaming,
        isListener: AppState.isListening,
        duration: room.createdAt ? calculateStreamingDuration(room.createdAt) : '0:00'
    };
}

// アプリ初期化時にDaily.co SDKを読み込み
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeDaily();
        console.log('Daily.co ready');
    } catch (error) {
        console.error('Daily.co initialization failed:', error);
    }
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', async () => {
    if (AppState.isStreaming || AppState.isListening) {
        await roomManager.leaveCurrentRoom();
    }
});

// ネットワーク状態監視
window.addEventListener('online', () => {
    console.log('Network online');
    if (AppState.streamingError && AppState.streamingError.includes('ネットワーク')) {
        AppState.streamingError = null;
        renderApp();
    }
});

window.addEventListener('offline', () => {
    console.log('Network offline');
    AppState.streamingError = 'ネットワーク接続が切断されました';
    renderApp();
});

