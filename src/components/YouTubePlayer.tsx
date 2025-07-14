import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [localTime, setLocalTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube 임베드 URL 생성 (자동재생 포함)
  const getEmbedUrl = (videoId: string, autoplay: boolean = false, startTime: number = 0) => {
    if (!videoId) return '';
    const params = new URLSearchParams({
      enablejsapi: '1',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: '1',
      autoplay: autoplay ? '1' : '0',
      start: Math.floor(startTime).toString()
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // 플레이어 제어
  const handlePlayPause = () => {
    if (!isHost) return;
    onStateChange({ isPlaying: !playerState.isPlaying });
  };

  const handleSeek = (newTime: number) => {
    if (!isHost) return;
    setLocalTime(newTime);
    onStateChange({ currentTime: newTime });
    
    // iframe 새로고침으로 시간 이동
    if (iframeRef.current && videoId) {
      const newUrl = getEmbedUrl(videoId, playerState.isPlaying, newTime);
      iframeRef.current.src = newUrl;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !playerState.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * playerState.duration;
    
    handleSeek(newTime);
  };

  // 시간 업데이트 타이머
  useEffect(() => {
    if (playerState.isPlaying) {
      intervalRef.current = setInterval(() => {
        setLocalTime(prev => {
          const newTime = prev + 1;
          if (isHost && newTime <= playerState.duration) {
            onStateChange({ currentTime: newTime });
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playerState.isPlaying, isHost, playerState.duration, onStateChange]);

  // 외부 상태 변경에 따른 동기화
  useEffect(() => {
    setLocalTime(playerState.currentTime);
  }, [playerState.currentTime]);

  // 비디오 변경 시 iframe 업데이트
  useEffect(() => {
    if (videoId && iframeRef.current) {
      setIsLoading(true);
      const embedUrl = getEmbedUrl(videoId, playerState.isPlaying, playerState.currentTime);
      iframeRef.current.src = embedUrl;
      
      // 로딩 완료 시뮬레이션
      const loadTimeout = setTimeout(() => {
        setIsLoading(false);
        onStateChange({ duration: 300 }); // 5분 기본값
      }, 3000);

      return () => clearTimeout(loadTimeout);
    }
  }, [videoId]);

  // 재생 상태 변경 시 iframe 업데이트
  useEffect(() => {
    if (videoId && iframeRef.current && !isLoading) {
      const embedUrl = getEmbedUrl(videoId, playerState.isPlaying, localTime);
      iframeRef.current.src = embedUrl;
    }
  }, [playerState.isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-700">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium">🎵 음악을 선택해주세요</p>
          <p className="text-sm mt-2">YouTube URL을 입력하거나 추천 음악을 선택하세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-white">🎵 음악 로딩 중...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* 커스텀 컨트롤 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* 진행 바 */}
            <div className="mb-4">
              <div 
                className="h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all duration-200"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-red-600 transition-all duration-300 relative"
                  style={{ width: playerState.duration > 0 ? `${(localTime / playerState.duration) * 100}%` : '0%' }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => isHost && handleSeek(Math.max(0, localTime - 10))}
                  disabled={!isHost}
                  className={`p-2 rounded-full transition-colors ${
                    isHost 
                      ? 'hover:bg-white/20 text-white' 
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
                  title="10초 뒤로"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={!isHost}
                  className={`p-3 rounded-full transition-colors ${
                    isHost 
                      ? 'hover:bg-white/20 text-white bg-white/10' 
                      : 'text-gray-500 cursor-not-allowed bg-gray-500/20'
                  }`}
                >
                  {playerState.isPlaying ? 
                    <Pause className="w-6 h-6" /> : 
                    <Play className="w-6 h-6" />
                  }
                </button>

                <button
                  onClick={() => isHost && handleSeek(Math.min(playerState.duration, localTime + 10))}
                  disabled={!isHost}
                  className={`p-2 rounded-full transition-colors ${
                    isHost 
                      ? 'hover:bg-white/20 text-white' 
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
                  title="10초 앞으로"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-sm font-mono">
                  {formatTime(localTime)} / {formatTime(playerState.duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!isHost && (
                  <span className="text-yellow-400 text-sm bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                    🎵 호스트가 음악을 제어중
                  </span>
                )}
                <button 
                  onClick={() => iframeRef.current?.requestFullscreen()}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                  title="전체화면"
                >
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