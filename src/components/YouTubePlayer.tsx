import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, Maximize, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { PlayerState } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  playerState: PlayerState;
  onStateChange: (state: Partial<PlayerState>, forceSync?: boolean) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);

  // YouTube API 로드
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }
  }, []);

  const initializePlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 0
      },
      events: {
        onReady: (event: any) => {
          setIsLoading(false);
          event.target.setVolume(volume);
          
          // 초기 상태 동기화
          if (playerState.currentTime > 0) {
            event.target.seekTo(playerState.currentTime, true);
          }
          
          // 지속적인 시간 업데이트
          const updateTime = () => {
            if (playerRef.current && !isDragging && !isUpdatingRef.current) {
              const currentTime = playerRef.current.getCurrentTime();
              const duration = playerRef.current.getDuration();
              
              setLocalTime(currentTime);
              
              if (isHost && Math.abs(currentTime - playerState.currentTime) > 2) {
                onStateChange({ 
                  currentTime: currentTime,
                  duration: duration 
                });
              }
            }
          };
          
          setInterval(updateTime, 1000);
        },
        onStateChange: (event: any) => {
          if (isUpdatingRef.current) return;
          
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          const isPaused = event.data === window.YT.PlayerState.PAUSED;
          
          if (isHost && (isPlaying || isPaused)) {
            const currentTime = playerRef.current.getCurrentTime();
            onStateChange({ 
              isPlaying: isPlaying,
              currentTime: currentTime
            }, true);
          }
        }
      }
    });
  }, [videoId, volume, playerState.currentTime, isHost, isDragging, onStateChange]);

  // 외부 상태 변경에 따른 플레이어 동기화
  useEffect(() => {
    if (!playerRef.current || isUpdatingRef.current) return;
    
    const now = Date.now();
    if (now - lastSyncRef.current < 500) return; // 500ms 간격으로 제한
    
    lastSyncRef.current = now;
    isUpdatingRef.current = true;
    
    try {
      const currentPlayerTime = playerRef.current.getCurrentTime();
      const timeDiff = Math.abs(currentPlayerTime - playerState.currentTime);
      
      // 시간 차이가 2초 이상이면 동기화
      if (timeDiff > 2) {
        playerRef.current.seekTo(playerState.currentTime, true);
      }
      
      // 재생/일시정지 상태 동기화
      const currentState = playerRef.current.getPlayerState();
      const isCurrentlyPlaying = currentState === window.YT.PlayerState.PLAYING;
      
      if (playerState.isPlaying && !isCurrentlyPlaying) {
        playerRef.current.playVideo();
      } else if (!playerState.isPlaying && isCurrentlyPlaying) {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Player sync error:', error);
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
    }
  }, [playerState.isPlaying, playerState.currentTime]);

  // 비디오 변경 시 플레이어 재초기화
  useEffect(() => {
    if (playerRef.current && videoId) {
      setIsLoading(true);
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  const handlePlayPause = () => {
    if (!isHost || !playerRef.current) return;
    
    const currentState = playerRef.current.getPlayerState();
    const isCurrentlyPlaying = currentState === window.YT.PlayerState.PLAYING;
    
    if (isCurrentlyPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (newTime: number) => {
    if (!isHost || !playerRef.current) return;
    
    playerRef.current.seekTo(newTime, true);
    onStateChange({ currentTime: newTime }, true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !playerState.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * playerState.duration;
    
    handleSeek(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDisplayTime = isDragging ? localTime : playerState.currentTime;

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium">동영상을 선택해주세요</p>
          <p className="text-sm mt-2">YouTube URL을 입력하여 시작하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group bg-black rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-white">동영상 로딩 중...</p>
            </div>
          </div>
        )}
        
        <div ref={containerRef} className="w-full h-full" />

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
                  style={{ width: playerState.duration > 0 ? `${(currentDisplayTime / playerState.duration) * 100}%` : '0%' }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => isHost && handleSeek(Math.max(0, currentDisplayTime - 10))}
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
                  onClick={() => isHost && handleSeek(Math.min(playerState.duration, currentDisplayTime + 10))}
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
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-sm font-mono">
                  {formatTime(currentDisplayTime)} / {formatTime(playerState.duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {!isHost && (
                  <span className="text-yellow-400 text-sm bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                    호스트만 제어 가능
                  </span>
                )}
                <button 
                  onClick={() => playerRef.current?.getIframe().requestFullscreen()}
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