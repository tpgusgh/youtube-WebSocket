import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Maximize, RotateCcw } from 'lucide-react';
import { PlayerState } from '../types';

interface YouTubePlayerProps {
  videoId: string;
  playerState: PlayerState;
  onStateChange: (state: Partial<PlayerState>) => void;
  isHost: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  playerState,
  onStateChange,
  isHost
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(50);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlayPause = () => {
    if (!isHost) return;
    onStateChange({ isPlaying: !playerState.isPlaying });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (videoId) {
      setIsLoading(false);
    }
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <p>동영상을 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${playerState.isPlaying ? 1 : 0}&mute=0&controls=0&modestbranding=1&rel=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />

        {/* 커스텀 컨트롤 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* 진행 바 */}
            <div className="mb-4">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: playerState.duration > 0 ? `${(playerState.currentTime / playerState.duration) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  disabled={!isHost}
                  className={`p-2 rounded-full transition-colors ${
                    isHost 
                      ? 'hover:bg-white/20 text-white' 
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {playerState.isPlaying ? 
                    <Pause className="w-6 h-6" /> : 
                    <Play className="w-6 h-6" />
                  }
                </button>

                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!isHost && (
                  <span className="text-yellow-400 text-sm bg-yellow-400/20 px-2 py-1 rounded">
                    호스트만 제어 가능
                  </span>
                )}
                <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};