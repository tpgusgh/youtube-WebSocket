import React, { useState } from 'react';
import { Settings, Users, Link, Copy, Check, Play, ExternalLink } from 'lucide-react';
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
      // YouTube oEmbed API 사용 (CORS 제한으로 실제로는 서버에서 처리해야 함)
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error('Failed to fetch video title:', error);
    }
    return `YouTube Video ${videoId}`;
  };

  const handleVideoChange = async () => {
    if (!videoUrl.trim()) return;
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      alert('올바른 YouTube URL을 입력해주세요.\n\n지원 형식:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID\n• https://www.youtube.com/embed/VIDEO_ID');
      return;
    }

    setIsLoading(true);
    try {
      const title = await getVideoTitle(videoId);
      onChangeVideo(videoId, title);
      setVideoUrl('');
    } catch (error) {
      console.error('Error changing video:', error);
      alert('동영상을 변경하는 중 오류가 발생했습니다.');
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

  return (
    <div className="space-y-6">
      {/* 방 정보 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{room.name}</h2>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{room.participants.length}명 참여중</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-3">
            <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <code className="flex-1 text-sm text-gray-300 bg-gray-900 px-3 py-2 rounded font-mono overflow-hidden text-ellipsis">
              {window.location.origin}?room={room.id}
            </code>
            <button
              onClick={copyRoomLink}
              className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? '복사됨' : '복사'}</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-400">
            이 링크를 친구들에게 공유하여 함께 시청하세요
          </p>
        </div>
      </div>

      {/* 동영상 변경 (호스트만) */}
      {currentUser.isHost && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-white">동영상 변경</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                YouTube URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://www.youtube.com/watch?v=..."
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
                  <span>변경 중...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>동영상 변경</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">
              <strong>지원 형식:</strong>
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>• https://youtu.be/VIDEO_ID</li>
              <li>• https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
          </div>
        </div>
      )}

      {/* 현재 재생중인 동영상 */}
      {room.currentVideo && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-red-600" />
            <span>현재 재생중</span>
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
                {room.currentVideo.title}
              </h4>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className={`px-2 py-1 rounded-full ${
                  room.isPlaying 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-gray-600/20 text-gray-400'
                }`}>
                  {room.isPlaying ? '재생중' : '일시정지'}
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

      {/* 호스트가 아닌 경우 안내 */}
      {!currentUser.isHost && (
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Settings className="w-5 h-5" />
            <span className="font-medium">참가자 모드</span>
          </div>
          <p className="text-yellow-300 text-sm mt-2">
            동영상 변경은 방장만 가능합니다. 방장이 동영상을 변경하면 자동으로 동기화됩니다.
          </p>
        </div>
      )}
    </div>
  );
};