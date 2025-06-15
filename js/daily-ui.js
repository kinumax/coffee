// Daily.co配信UI コンポーネント

// 配信開始フォーム
function renderStreamingForm() {
    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    ライブ配信を開始
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            配信者名
                        </label>
                        <input 
                            type="text" 
                            id="hostNameInput"
                            value="${AppState.hostName}"
                            placeholder="あなたの名前を入力"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-white"
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            配信タイトル（任意）
                        </label>
                        <input 
                            type="text" 
                            id="roomTitleInput"
                            value="${AppState.roomTitle}"
                            placeholder="配信の内容を入力"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-white"
                        >
                    </div>
                    
                    <div class="bg-coffee-50 dark:bg-coffee-900 p-3 rounded-md">
                        <p class="text-sm text-coffee-700 dark:text-coffee-300">
                            💡 配信を開始すると、他の人があなたの音声を聞くことができます。
                        </p>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button 
                        onclick="cancelStreamingForm()"
                        class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button 
                        onclick="handleStartStreaming()"
                        class="flex-1 px-4 py-2 bg-coffee-500 text-white rounded-md hover:bg-coffee-600 transition-colors"
                    >
                        配信開始
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ルーム参加フォーム
function renderJoinForm() {
    return `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    配信に参加
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            あなたの名前
                        </label>
                        <input 
                            type="text" 
                            id="listenerNameInput"
                            value="${AppState.listenerName}"
                            placeholder="名前を入力"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-white"
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ルームURL
                        </label>
                        <input 
                            type="url" 
                            id="roomUrlInput"
                            value="${AppState.roomUrl}"
                            placeholder="https://manus-test.daily.co/room-name"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500 dark:bg-gray-700 dark:text-white"
                        >
                    </div>
                    
                    <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
                        <p class="text-sm text-blue-700 dark:text-blue-300">
                            🎧 リスナーとして参加します。音声は送信されません。
                        </p>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button 
                        onclick="cancelJoinForm()"
                        class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button 
                        onclick="handleJoinRoom()"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        参加
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 配信中インターフェース
function renderStreamingInterface() {
    const roomInfo = getRoomDisplayInfo();
    if (!roomInfo) return '';
    
    return `
        <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-white rounded-full recording-pulse"></div>
                    <span class="font-semibold">LIVE配信中</span>
                </div>
                <div class="text-sm opacity-90">
                    ${roomInfo.duration}
                </div>
            </div>
            
            <h3 class="font-semibold text-lg mb-2">${roomInfo.title}</h3>
            <p class="text-sm opacity-90 mb-3">配信者: ${roomInfo.host}</p>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-1">
                        <span class="text-sm">👥</span>
                        <span class="text-sm">${roomInfo.participantCount}人</span>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2">
                    <button 
                        onclick="toggleStreamingAudio()"
                        class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    >
                        ${Icons.Mic}
                    </button>
                    <button 
                        onclick="shareCurrentRoom()"
                        class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    >
                        📤
                    </button>
                    <button 
                        onclick="handleStopStreaming()"
                        class="px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-sm"
                    >
                        配信終了
                    </button>
                </div>
            </div>
        </div>
    `;
}

// リスニング中インターフェース
function renderListeningInterface() {
    const roomInfo = getRoomDisplayInfo();
    if (!roomInfo) return '';
    
    return `
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-white rounded-full recording-pulse"></div>
                    <span class="font-semibold">配信を聴取中</span>
                </div>
                <div class="text-sm opacity-90">
                    ${roomInfo.duration}
                </div>
            </div>
            
            <h3 class="font-semibold text-lg mb-2">${roomInfo.title}</h3>
            <p class="text-sm opacity-90 mb-3">配信者: ${roomInfo.host}</p>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-1">
                        <span class="text-sm">👥</span>
                        <span class="text-sm">${roomInfo.participantCount}人</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span class="text-sm">🎧</span>
                        <span class="text-sm">リスナー</span>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2">
                    <button 
                        onclick="shareCurrentRoom()"
                        class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                    >
                        📤
                    </button>
                    <button 
                        onclick="handleLeaveRoom()"
                        class="px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-sm"
                    >
                        退出
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 配信コントロールボタン
function renderStreamingControls() {
    if (AppState.isStreaming || AppState.isListening) {
        return ''; // 配信中/聴取中は表示しない
    }
    
    return `
        <div class="grid grid-cols-2 gap-3 mb-6">
            <button 
                onclick="showStreamingForm()"
                class="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-coffee-500 to-coffee-600 text-white rounded-lg hover:from-coffee-600 hover:to-coffee-700 transition-all transform hover:scale-105"
            >
                <div class="w-8 h-8 mb-2">
                    ${Icons.Mic}
                </div>
                <span class="text-sm font-medium">配信開始</span>
            </button>
            
            <button 
                onclick="showJoinForm()"
                class="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
                <div class="w-8 h-8 mb-2">
                    🎧
                </div>
                <span class="text-sm font-medium">配信に参加</span>
            </button>
        </div>
    `;
}

// エラー表示
function renderStreamingError() {
    if (!AppState.streamingError) return '';
    
    return `
        <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <div class="flex items-center">
                <div class="text-red-500 mr-3">⚠️</div>
                <div>
                    <h4 class="text-red-800 dark:text-red-200 font-medium">エラーが発生しました</h4>
                    <p class="text-red-600 dark:text-red-300 text-sm mt-1">${AppState.streamingError}</p>
                </div>
            </div>
        </div>
    `;
}

// イベントハンドラー関数
function showStreamingForm() {
    AppState.showRoomForm = true;
    renderApp();
}

function cancelStreamingForm() {
    AppState.showRoomForm = false;
    renderApp();
}

function showJoinForm() {
    AppState.showJoinForm = true;
    renderApp();
}

function cancelJoinForm() {
    AppState.showJoinForm = false;
    renderApp();
}

async function handleStartStreaming() {
    const hostName = document.getElementById('hostNameInput').value.trim();
    const roomTitle = document.getElementById('roomTitleInput').value.trim();
    
    if (!hostName) {
        alert('配信者名を入力してください');
        return;
    }
    
    AppState.hostName = hostName;
    AppState.roomTitle = roomTitle;
    AppState.showRoomForm = false;
    
    const result = await startStreaming(hostName, roomTitle);
    
    if (result.success) {
        console.log('配信開始成功:', result);
    } else {
        console.error('配信開始失敗:', result.error);
    }
}

async function handleJoinRoom() {
    const listenerName = document.getElementById('listenerNameInput').value.trim();
    const roomUrl = document.getElementById('roomUrlInput').value.trim();
    
    if (!listenerName) {
        alert('名前を入力してください');
        return;
    }
    
    if (!roomUrl || !validateRoomUrl(roomUrl)) {
        alert('有効なルームURLを入力してください');
        return;
    }
    
    AppState.listenerName = listenerName;
    AppState.roomUrl = roomUrl;
    AppState.showJoinForm = false;
    
    const result = await joinRoom(roomUrl, listenerName);
    
    if (result.success) {
        console.log('ルーム参加成功:', result);
    } else {
        console.error('ルーム参加失敗:', result.error);
    }
}

async function handleStopStreaming() {
    if (confirm('配信を終了しますか？')) {
        await stopStreaming();
    }
}

async function handleLeaveRoom() {
    if (confirm('配信から退出しますか？')) {
        await leaveRoom();
    }
}

function shareCurrentRoom() {
    if (AppState.roomUrl) {
        shareRoomUrl(AppState.roomUrl);
    }
}

// タブ切り替え時の配信インターフェース統合
function renderStreamingTab() {
    return `
        <div class="p-4">
            ${renderStreamingError()}
            ${renderStreamingInterface()}
            ${renderListeningInterface()}
            ${renderStreamingControls()}
            
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    ライブ配信について
                </h3>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 dark:text-white mb-2">配信者として</h4>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• リアルタイムで音声を配信できます</li>
                        <li>• 参加者数をリアルタイムで確認できます</li>
                        <li>• ルームURLを共有して聴取者を招待できます</li>
                    </ul>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 dark:text-white mb-2">リスナーとして</h4>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• ルームURLで配信に参加できます</li>
                        <li>• 高品質な音声をリアルタイムで聴取できます</li>
                        <li>• 他の参加者と一緒に配信を楽しめます</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

