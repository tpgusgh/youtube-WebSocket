import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, User, ChatMessage, PlayerState } from '../types';

export const useWatchParty = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    videoId: ''
  });
  
  // 실시간 동기화를 위한 WebSocket 시뮬레이션
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncTimeRef = useRef<number>(0);

  // 플레이어 상태 동기화 (실제로는 WebSocket 사용)
  const syncPlayerState = useCallback((newState: Partial<PlayerState>, forceSync = false) => {
    const now = Date.now();
    
    // 너무 빈번한 동기화 방지 (100ms 간격)
    if (!forceSync && now - lastSyncTimeRef.current < 100) {
      return;
    }
    
    lastSyncTimeRef.current = now;
    
    setPlayerState(prev => {
      const updated = { ...prev, ...newState };
      
      // 방 상태도 업데이트
      if (room) {
        setRoom(prevRoom => prevRoom ? {
          ...prevRoom,
          isPlaying: updated.isPlaying,
          currentTime: updated.currentTime
        } : null);
        
        // 시스템 메시지 추가 (중요한 동작만)
        if (newState.isPlaying !== undefined || (newState.currentTime !== undefined && Math.abs(newState.currentTime - prev.currentTime) > 5)) {
          const action = newState.isPlaying !== undefined 
            ? (newState.isPlaying ? '재생을 시작했습니다' : '일시정지했습니다')
            : `${Math.floor(newState.currentTime || 0)}초로 이동했습니다`;
            
          addSystemMessage(`호스트가 ${action}`);
        }
      }
      
      return updated;
    });
  }, [room]);

  const addSystemMessage = useCallback((message: string) => {
    if (!room) return;
    
    const systemMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date()
    };

    setRoom(prev => prev ? {
      ...prev,
      messages: [...prev.messages, systemMessage]
    } : null);
  }, [room]);

  const createRoom = useCallback((roomName: string, userName: string) => {
    const userId = Math.random().toString(36).substr(2, 9);
    const roomId = Math.random().toString(36).substr(2, 9);
    
    const user: User = {
      id: userId,
      name: userName,
      isHost: true,
      avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
    };

    const newRoom: Room = {
      id: roomId,
      name: roomName,
      currentVideo: null,
      participants: [user],
      messages: [
        {
          id: '1',
          userId: 'system',
          userName: 'System',
          message: `${userName}님이 방을 만들었습니다. 친구들을 초대해보세요!`,
          timestamp: new Date()
        }
      ],
      isPlaying: false,
      currentTime: 0,
      createdAt: new Date()
    };

    setCurrentUser(user);
    setRoom(newRoom);
    
    // URL 업데이트
    window.history.pushState({}, '', `?room=${roomId}`);
    
    return { room: newRoom, user };
  }, []);

  const joinRoom = useCallback((roomId: string, userName: string) => {
    const userId = Math.random().toString(36).substr(2, 9);
    
    const user: User = {
      id: userId,
      name: userName,
      isHost: false,
      avatar: `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
    };

    // 시뮬레이션된 방 참여
    const existingRoom: Room = {
      id: roomId,
      name: 'Shared Room',
      currentVideo: {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      participants: [
        {
          id: 'host1',
          name: 'Room Host',
          isHost: true,
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        },
        user
      ],
      messages: [
        {
          id: '1',
          userId: 'system',
          userName: 'System',
          message: `${userName}님이 방에 참여했습니다.`,
          timestamp: new Date()
        }
      ],
      isPlaying: false,
      currentTime: 45,
      createdAt: new Date()
    };

    setCurrentUser(user);
    setRoom(existingRoom);
    
    // 기존 동영상이 있으면 플레이어 상태 동기화
    if (existingRoom.currentVideo) {
      setPlayerState({
        isPlaying: existingRoom.isPlaying,
        currentTime: existingRoom.currentTime,
        duration: 0,
        videoId: existingRoom.currentVideo.id
      });
    }
    
    return { room: existingRoom, user };
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (!currentUser || !room) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      message,
      timestamp: new Date()
    };

    setRoom(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null);
  }, [currentUser, room]);

  const changeVideo = useCallback((videoId: string, title: string) => {
    if (!currentUser?.isHost || !room) return;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    setRoom(prev => prev ? {
      ...prev,
      currentVideo: { id: videoId, title, thumbnail },
      isPlaying: false,
      currentTime: 0
    } : null);

    setPlayerState(prev => ({
      ...prev,
      videoId,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    }));

    addSystemMessage(`새 동영상으로 변경되었습니다: ${title}`);
  }, [currentUser, room, addSystemMessage]);

  // 정기적인 시간 동기화 (재생 중일 때만)
  useEffect(() => {
    if (playerState.isPlaying && room) {
      const interval = setInterval(() => {
        setPlayerState(prev => ({
          ...prev,
          currentTime: prev.currentTime + 1
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [playerState.isPlaying, room]);

  return {
    room,
    currentUser,
    playerState,
    createRoom,
    joinRoom,
    sendMessage,
    changeVideo,
    syncPlayerState
  };
};