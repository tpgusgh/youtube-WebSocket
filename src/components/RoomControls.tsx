import React, { useState } from 'react';
import { Settings, Users, Link, Copy, Check, Play, ExternalLink, Music } from 'lucide-react';
import { Room, User } from '../types';

interface RoomControlsProps {
  room: Room;
  currentUser: User;
  onChangeVideo: (videoId: string, title: string) => void;
}

export const RoomControls: React.FC<RoomControlsProps> = ({
  room,
  currentUser,
  onChangeVideo
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getVideoTitle = async (videoId: string): Promise<string> => {
    try {
      // YouTube oEmbed API 사용
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error('Failed to fetch video title:', error);
    }
    return `YouTube 음악 ${videoId}`;
  };

  const handleVideoChange = async () => {
    if (!videoUrl.trim()) return;
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      alert('올바른 YouTube URL을 입력해주세요!\n\n예시:\n• https://www.youtube.com/watch?v=dQw4w9WgXcQ\n• https://youtu.be/dQw4w9WgXcQ');
      return;
    }

    setIsLoading(true);
    try {
      const title = await getVideoTitle(videoId);
      onChangeVideo(videoId, title);
      setVideoUrl('');
    } catch (error) {
      console.error('Error changing video:', error);
      // 에러가 나도 일단 변경
      onChangeVideo(videoId, `YouTube 음악 ${videoId}`);
      setVideoUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomLink = async () => {
    const roomLink = `${window.location.origin}?room=${room.id}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
      // 폴백: 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = roomLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVideoChange();
    }
  };

  // 인기 음악 추천
  const popularSongs = [
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee' },
    { id: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody' },
    { id: 'hT_nvWreIhg', title: 'Whitney Houston - I Will Always Love You' }
  ];

  return (
    <div className="space-y-6">
      {/* 방 정보 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Music className="w-6 h-6 text-red-600" />
            <span>{room.name}</span>
          </h2>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{room.participants.length}명 함께 듣는 중</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-3">
            <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">방 ID</p>
              <code className="text-lg font-bold text-white bg-gray-900 px-3 py-2 rounded font-mono block">
                {room.id}
              </code>
            </div>
            <button
              onClick={copyRoomLink}
              className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? '복사됨!' : '링크 복사'}</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-400">
            🎵 친구에게 방 ID <strong>{room.id}</strong>를 알려주거나 링크를 공유하세요!
          </p>
        </div>
      </div>

      {/* 음악 변경 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-white">
            {currentUser.isHost ? '🎵 음악 변경' : '🎵 현재 재생중'}
          </h3>
        </div>
        
        {currentUser.isHost ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube URL 입력
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleVideoChange}
              disabled={!videoUrl.trim() || isLoading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>음악 변경 중...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>🎵 음악 변경하기</span>
                </>
              )}
            </button>

            {/* 인기 음악 추천 */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-300 mb-3">🔥 인기 음악 추천</p>
              <div className="grid grid-cols-1 gap-2">
                {popularSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => onChangeVideo(song.id, song.title)}
                    className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-300 hover:text-white"
                  >
                    🎵 {song.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">방장이 음악을 선택하면 자동으로 재생됩니다</p>
            <p className="text-gray-500 text-sm mt-1">잠시만 기다려주세요! 🎵</p>
          </div>
        )}
      </div>

      {/* 현재 재생중인 음악 */}
      {room.currentVideo && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-red-600" />
            <span>🎵 지금 듣고 있는 음악</span>
          </h3>
          
          <div className="flex space-x-4">
            <div className="relative flex-shrink-0">
              <img
                src={room.currentVideo.thumbnail}
                alt={room.currentVideo.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                {room.isPlaying ? (
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">
                🎵 {room.currentVideo.title}
              </h4>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className={`px-2 py-1 rounded-full ${
                  room.isPlaying 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {room.isPlaying ? '🎵 재생중' : '⏸️ 일시정지'}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${room.currentVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>YouTube에서 보기</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};