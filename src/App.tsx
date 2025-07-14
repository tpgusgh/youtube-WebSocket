import React, { useState, useEffect } from 'react';
import { WatchParty } from './components/WatchParty';
import { useWatchParty } from './hooks/useWatchParty';
import { Play, Users, Plus, Music, AlertCircle } from 'lucide-react';

function App() {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinMode, setJoinMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    room,
    currentUser,
    playerState,
    createRoom,
    joinRoom,
    sendMessage,
    changeVideo,
    syncPlayerState
  } = useWatchParty();

  // URL에서 방 ID 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('room');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl.toUpperCase());
      setJoinMode('join');
      setShowJoinForm(true);
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!userName.trim() || !roomName.trim()) {
      setError('이름과 방 이름을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      createRoom(roomName, userName);
    } catch (err) {
      setError('방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId.trim()) {
      setError('이름과 방 ID를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      joinRoom(roomId.toUpperCase(), userName);
    } catch (err) {
      setError(err instanceof Error ? err.message : '방 참여에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (joinMode === 'create') {
        handleCreateRoom();
      } else {
        handleJoinRoom();
      }
    }
  };

  // 이미 방에 있는 경우 Watch Party 컴포넌트 렌더링
  if (room && currentUser) {
    return (
      <WatchParty
        room={room}
        currentUser={currentUser}
        playerState={playerState}
        onStateChange={syncPlayerState}
        onSendMessage={sendMessage}
        onChangeVideo={changeVideo}
      />
    );
  }

  // 입장 폼이 표시되는 경우
  if (showJoinForm) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl border border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {joinMode === 'create' ? '🎵 새 음악방 만들기' : '🎵 음악방 참여하기'}
            </h2>
            <p className="text-gray-400 mt-2">
              {joinMode === 'create' 
                ? '친구들과 함께 음악을 들을 방을 만들어보세요!'
                : roomId ? `방 "${roomId}"에 참여하세요!` : '친구가 만든 음악방에 참여하세요!'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🙋‍♂️ 당신의 이름
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {joinMode === 'create' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🎵 방 이름
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="예: 우리들의 음악방"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔑 방 ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value.toUpperCase());
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="예: ABC123"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-center text-lg font-mono"
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">친구에게 받은 6자리 방 코드를 입력하세요</p>
              </div>
            )}

            <button
              onClick={joinMode === 'create' ? handleCreateRoom : handleJoinRoom}
              disabled={isLoading || !userName.trim() || (joinMode === 'create' ? !roomName.trim() : !roomId.trim())}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{joinMode === 'create' ? '방 만드는 중...' : '참여하는 중...'}</span>
                </>
              ) : joinMode === 'create' ? (
                <>
                  <Plus className="w-5 h-5" />
                  <span>🎵 음악방 만들기</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>🎵 음악방 참여하기</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setJoinMode(joinMode === 'create' ? 'join' : 'create');
                  setRoomName('');
                  setRoomId('');
                  setError('');
                }}
                disabled={isLoading}
                className="text-red-400 hover:text-red-300 text-sm transition-colors disabled:opacity-50"
              >
                {joinMode === 'create' ? '🔑 기존 방에 참여하기' : '➕ 새 방 만들기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 랜딩 페이지
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              🎵 YouTube 음악 파티
            </h1>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            친구들과 함께 <br />
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              🎵 음악을 들어보세요!
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            실시간 동기화된 YouTube 음악 재생, 라이브 채팅으로 <br />
            어디서든 친구들과 함께 좋아하는 음악을 즐겨보세요! 🎶
          </p>

          {/* 기능 카드들 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-600/50 transition-colors">
              <Play className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">🎵 실시간 동기화</h3>
              <p className="text-gray-400">
                모든 친구들이 동시에 같은 음악을 듣습니다
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-600/50 transition-colors">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">💬 실시간 채팅</h3>
              <p className="text-gray-400">
                음악을 들으며 친구들과 실시간으로 대화하세요
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-red-600/50 transition-colors">
              <Plus className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">🔗 간편한 공유</h3>
              <p className="text-gray-400">
                방 ID 하나로 친구들을 쉽게 초대할 수 있어요
              </p>
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                setJoinMode('create');
                setShowJoinForm(true);
              }}
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>🎵 새 음악방 만들기</span>
            </button>
            <button
              onClick={() => {
                setJoinMode('join');
                setShowJoinForm(true);
              }}
              className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Users className="w-5 h-5" />
              <span>🔑 기존 방 참여하기</span>
            </button>
          </div>

          {/* 사용법 안내 */}
          <div className="mt-16 bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6">🎯 사용법</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-2">1️⃣ 방 만들기</h4>
                <p className="text-gray-400 text-sm">이름과 방 이름을 입력하고 새 음악방을 만드세요!</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-2">2️⃣ 친구 초대</h4>
                <p className="text-gray-400 text-sm">6자리 방 ID를 친구에게 알려주거나 링크를 공유하세요!</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-2">3️⃣ 음악 재생</h4>
                <p className="text-gray-400 text-sm">YouTube URL을 입력하거나 추천 음악을 선택하세요!</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-2">4️⃣ 함께 즐기기</h4>
                <p className="text-gray-400 text-sm">채팅하며 음악을 함께 즐기세요! 🎶</p>
              </div>
            </div>
          </div>

          {/* 테스트 안내 */}
          <div className="mt-8 bg-blue-600/20 border border-blue-600/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">🧪 테스트 방법</h4>
            <p className="text-blue-300 text-sm">
              1. 새 음악방을 만들고 방 ID를 복사하세요<br />
              2. 새 탭에서 같은 사이트를 열고 방 ID로 참여하세요<br />
              3. 한 탭에서 음악을 재생하면 다른 탭에서도 동기화됩니다!
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>🎵 &copy; 2025 YouTube 음악 파티. 친구들과 함께 음악을 즐겨보세요! 🎶</p>
        </div>
      </footer>
    </div>
  );
}

export default App;