// Daily.co音声配信クラス - 修正版
class DailyAudioStreamer {
    constructor() {
        this.callFrame = null;
        this.isHost = false;
        this.roomUrl = null;
        this.participants = new Map();
        this.isConnected = false;
        this.localAudio = true;
        this.roomName = null;
        this.listeners = [];
        
        // Daily.co設定
        this.dailyConfig = {
            url: null,
            showLeaveButton: false,
            showFullscreenButton: false,
            showLocalVideo: false,
            showParticipantsBar: false,
            activeSpeakerMode: true,
            receiveSettings: {
                video: false, // 音声のみ
                screenVideo: false
            },
            sendSettings: {
                video: false, // 音声のみ
                screenVideo: false
            }
        };
        this.DAILY_API_KEY = '8aa0f24e04cfbadeeb809f11461d996fa7d2058a2f5c65298a0e8265970bbcbb';
        this.DAILY_DOMAIN = 'koe.daily.co';
    }

    // Daily.co初期化
    async initialize() {
        try {
            // Daily.co SDKの読み込み確認
            if (typeof DailyIframe === 'undefined') {
                throw new Error('Daily.co SDK not loaded');
            }
            
            return true;
        } catch (error) {
            console.error('Daily.co初期化エラー:', error);
            return false;
        }
    }

    // 配信ルーム作成（ホスト用）
    async createRoom(roomName, hostName) {
        try {
            // テスト用のルーム作成（実際のAPIキーが必要）
            const roomUrl = `https://${this.DAILY_DOMAIN}/${roomName}`;
            
            this.roomUrl = roomUrl;
            this.roomName = roomName;
            this.isHost = true;
            
            // CallFrame作成
            this.callFrame = DailyIframe.createFrame({
                iframeStyle: {
                    position: 'fixed',
                    top: '-1000px',
                    left: '-1000px',
                    width: '1px',
                    height: '1px',
                    visibility: 'hidden'
                },
                ...this.dailyConfig,
                url: roomUrl
            });

            // イベントリスナー設定
            this.setupEventListeners();

            // ルーム参加
            await this.callFrame.join({
                userName: hostName,
                startAudioOff: false,
                startVideoOff: true
            });

            this.isConnected = true;
            
            return {
                success: true,
                roomUrl: roomUrl,
                roomName: roomName
            };
            
        } catch (error) {
            console.error('ルーム作成エラー:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 配信ルーム参加（リスナー用）
    async joinRoom(roomUrl, listenerName) {
        try {
            this.roomUrl = roomUrl;
            this.isHost = false;
            
            // CallFrame作成
            this.callFrame = DailyIframe.createFrame({
                iframeStyle: {
                    position: 'fixed',
                    top: '-1000px',
                    left: '-1000px',
                    width: '1px',
                    height: '1px',
                    visibility: 'hidden'
                },
                ...this.dailyConfig,
                url: roomUrl
            });

            // イベントリスナー設定
            this.setupEventListeners();

            // ルーム参加（リスナーは音声送信オフ）
            await this.callFrame.join({
                userName: listenerName,
                startAudioOff: true, // リスナーはミュート
                startVideoOff: true
            });

            this.isConnected = true;
            
            return {
                success: true,
                roomUrl: roomUrl
            };
            
        } catch (error) {
            console.error('ルーム参加エラー:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        if (!this.callFrame) return;

        // 参加者の参加
        this.callFrame.on('participant-joined', (event) => {
            const participant = event.participant;
            this.participants.set(participant.session_id, participant);
            this.notifyListeners('participant-joined', participant);
        });

        // 参加者の退出
        this.callFrame.on('participant-left', (event) => {
            const participant = event.participant;
            this.participants.delete(participant.session_id);
            this.notifyListeners('participant-left', participant);
        });

        // 音声状態変更
        this.callFrame.on('participant-updated', (event) => {
            const participant = event.participant;
            this.participants.set(participant.session_id, participant);
            this.notifyListeners('participant-updated', participant);
        });

        // エラーハンドリング
        this.callFrame.on('error', (event) => {
            console.error('Daily.co エラー:', event);
            this.notifyListeners('error', event);
        });

        // 接続状態変更
        this.callFrame.on('joined-meeting', (event) => {
            this.notifyListeners('joined', event);
        });

        this.callFrame.on('left-meeting', (event) => {
            this.isConnected = false;
            this.notifyListeners('left', event);
        });
    }

    // 音声のオン/オフ切り替え
    async toggleAudio() {
        if (!this.callFrame || !this.isConnected) return false;

        try {
            this.localAudio = !this.localAudio;
            await this.callFrame.setLocalAudio(this.localAudio);
            return this.localAudio;
        } catch (error) {
            console.error('音声切り替えエラー:', error);
            return false;
        }
    }

    // 参加者数取得
    getParticipantCount() {
        return this.participants.size;
    }

    // 参加者リスト取得
    getParticipants() {
        return Array.from(this.participants.values());
    }

    // ルーム退出
    async leaveRoom() {
        try {
            if (this.callFrame && this.isConnected) {
                await this.callFrame.leave();
            }
            
            if (this.callFrame) {
                this.callFrame.destroy();
                this.callFrame = null;
            }
            
            this.isConnected = false;
            this.participants.clear();
            this.roomUrl = null;
            this.roomName = null;
            
            return true;
        } catch (error) {
            console.error('ルーム退出エラー:', error);
            return false;
        }
    }

    // イベントリスナー追加
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    // イベントリスナー削除
    removeEventListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // リスナーに通知
    notifyListeners(eventType, data) {
        this.listeners.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (error) {
                console.error('リスナー通知エラー:', error);
            }
        });
    }

    // ルームURL生成
    static generateRoomUrl(roomName) {
        return `https://manus-test.daily.co/${roomName}`;
    }

    // ルーム名からURL抽出
    static extractRoomName(roomUrl) {
        try {
            const url = new URL(roomUrl);
            return url.pathname.substring(1); // '/'を除去
        } catch (error) {
            return null;
        }
    }
}

// ルーム管理クラス
class RoomManager {
    constructor() {
        this.activeRooms = new Map();
        this.currentRoom = null;
    }

    // ランダムルーム名生成
    generateRoomName() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
        let result = '';
        // Ensure the first character is a letter
        result += chars.charAt(Math.floor(Math.random() * 26)); 
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ルーム作成
    async createRoom(hostName, roomTitle = '') {
        const roomName = this.generateRoomName();
        const streamer = new DailyAudioStreamer();
        
        const result = await streamer.createRoom(roomName, hostName);
        
        if (result.success) {
            const roomInfo = {
                name: roomName,
                title: roomTitle || `${hostName}の配信`,
                host: hostName,
                streamer: streamer,
                createdAt: new Date(),
                participants: 0
            };
            
            this.activeRooms.set(roomName, roomInfo);
            this.currentRoom = roomInfo;
            
            // 参加者数更新のリスナー設定
            streamer.addEventListener((eventType, data) => {
                if (eventType === 'participant-joined' || eventType === 'participant-left') {
                    roomInfo.participants = streamer.getParticipantCount();
                }
            });
        }
        
        return result;
    }

    // ルーム参加
    async joinRoom(roomUrl, listenerName) {
        const roomName = DailyAudioStreamer.extractRoomName(roomUrl);
        if (!roomName) {
            return { success: false, error: '無効なルームURLです' };
        }

        const streamer = new DailyAudioStreamer();
        const result = await streamer.joinRoom(roomUrl, listenerName);
        
        if (result.success) {
            const roomInfo = {
                name: roomName,
                streamer: streamer,
                joinedAt: new Date(),
                isListener: true
            };
            
            this.currentRoom = roomInfo;
        }
        
        return result;
    }

    // 現在のルーム取得
    getCurrentRoom() {
        return this.currentRoom;
    }

    // ルーム退出
    async leaveCurrentRoom() {
        if (this.currentRoom && this.currentRoom.streamer) {
            await this.currentRoom.streamer.leaveRoom();
            
            if (!this.currentRoom.isListener) {
                this.activeRooms.delete(this.currentRoom.name);
            }
            
            this.currentRoom = null;
            return true;
        }
        return false;
    }

    // アクティブルーム一覧
    getActiveRooms() {
        return Array.from(this.activeRooms.values());
    }
}

// グローバルインスタンス
const roomManager = new RoomManager();
let dailyStreamer = null;

// Daily.co関連の状態をAppStateに追加
AppState.isStreaming = false;
AppState.isListening = false;
AppState.currentRoom = null;
AppState.participantCount = 0;
AppState.roomUrl = '';
AppState.hostName = '';
AppState.listenerName = '';
AppState.showRoomForm = false;
AppState.showJoinForm = false;
AppState.roomTitle = '';
AppState.streamingError = null;

