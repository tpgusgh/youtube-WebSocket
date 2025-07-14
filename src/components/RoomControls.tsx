import React, { useState } from 'react';
import { Settings, Users, Link, Copy, Check } from 'lucide-react';
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

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoChange = () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      const title = `새 동영상 ${videoId}`;
      onChangeVideo(videoId, title);
      setVideoUrl('');
    } else {
      alert('올바른 YouTube URL을 입력해주세요.');
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
    }
  };

  return (
    <div className="space-y-6">
      {/* 방 정보 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{room.name}</h2>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{room.participants.length}명 참여중</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-3">
          <Link className="w-5 h-5 text-gray-400" />
          <code className="flex-1 text-sm text-gray-300 bg-gray-900 px-3 py-1 rounded">
            {window.location.origin}?room={room.id}
          </code>
          <button
            onClick={copyRoomLink}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
      </div>

      {/* 동영상 변경 (호스트만) */}
      {currentUser.isHost && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-white">동영상 변경</h3>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL을 입력하세요"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <button
              onClick={handleVideoChange}
              disabled={!videoUrl.trim()}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              동영상 변경
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-3">
            지원 형식: youtube.com/watch?v=... 또는 youtu.be/...
          </p>
        </div>
      )}

      {/* 현재 재생중인 동영상 */}
      {room.currentVideo && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">현재 재생중</h3>
          <div className="flex space-x-4">
            <img
              src={room.currentVideo.thumbnail}
              alt={room.currentVideo.title}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm line-clamp-2">
                {room.currentVideo.title}
              </h4>
              <p className="text-gray-400 text-xs mt-1">
                {room.isPlaying ? '재생중' : '일시정지'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};