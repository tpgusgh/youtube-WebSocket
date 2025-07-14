import React, { useState, useEffect } from 'react';
import { WatchParty } from './components/WatchParty';
import { useWatchParty } from './hooks/useWatchParty';
import { Play, Users, Plus } from 'lucide-react';

function App() {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinMode, setJoinMode] = useState<'create' | 'join'>('create');

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
      setRoomId(roomIdFromUrl);
      setJoinMode('join');
      setShowJoinForm(true);
    }
  }, []);

  const handleCreateRoom = () => {
    if (userName.trim() && roomName.trim()) {
      createRoom(roomName, userName);
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim() && roomId.trim()) {
      joinRoom(roomId, userName);
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
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {joinMode === 'create' ? '새 방 만들기' : '방 참여하기'}
            </h2>
            <p className="text-gray-400 mt-2">
              {joinMode === 'create' 
                ? '친구들과 함께 YouTube를 시청할 방을 만들어보세요'
                : '초대받은 방에 참여하세요'
              }
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                사용자 이름
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {joinMode === 'create' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  방 이름
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="방 이름을 입력하세요"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  방 ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="방 ID를 입력하세요"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
            )}

            <button
              onClick={joinMode === 'create' ? handleCreateRoom : handleJoinRoom}
              disabled={!userName.trim() || (joinMode === 'create' ? !roomName.trim() : !roomId.trim())}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {joinMode === 'create' ? '방 만들기' : '방 참여하기'}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setJoinMode(joinMode === 'create' ? 'join' : 'create');
                  setRoomName('');
                  setRoomId('');
                }}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                {joinMode === 'create' ? '기존 방에 참여하기' : '새 방 만들기'}
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
              <Play className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              YouTube Watch Party
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
              YouTube를 시청하세요
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            실시간 동기화된 YouTube 시청, 라이브 채팅, 그리고 간편한 방 관리로 <br />
            어디서든 친구들과 함께 영상을 즐겨보세요.
          </p>

          {/* 기능 카드들 */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 p-6 rounded-lg">
              <Play className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">실시간 동기화</h3>
              <p className="text-gray-400">
                모든 참가자가 동시에 재생, 일시정지, 탐색을 경험합니다
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">라이브 채팅</h3>
              <p className="text-gray-400">
                실시간 채팅으로 친구들과 소통하며 영상을 시청하세요
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <Plus className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">간편한 방 관리</h3>
              <p className="text-gray-400">
                링크 하나로 간편하게 방을 만들고 친구들을 초대하세요
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
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>새 방 만들기</span>
            </button>
            <button
              onClick={() => {
                setJoinMode('join');
                setShowJoinForm(true);
              }}
              className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-lg flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>기존 방 참여</span>
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 YouTube Watch Party. 친구들과 함께 영상을 즐겨보세요.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;