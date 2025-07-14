import { useState, useCallback } from 'react';
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

  // 실시간 동기화 시뮬레이션 (실제로는 WebSocket 사용)
  const syncPlayerState = useCallback((newState: Partial<PlayerState>) => {
    setPlayerState(prev => {
      const updated = { ...prev, ...newState };
      
      // 방 상태도 업데이트
      if (room) {
        setRoom(prevRoom => prevRoom ? {
          ...prevRoom,
          isPlaying: updated.isPlaying,
          currentTime: updated.currentTime
        } : null);
        
        // 시스템 메시지 추가
        if (newState.isPlaying !== undefined) {
          const action = newState.isPlaying ? '재생을 시작했습니다' : '일시정지했습니다';
          addSystemMessage(`${currentUser?.name}님이 ${action}`);
        } else if (newState.currentTime !== undefined && Math.abs(newState.currentTime - prev.currentTime) > 5) {
          addSystemMessage(`${currentUser?.name}님이 ${Math.floor(newState.currentTime)}초로 이동했습니다`);
        }
      }
      
      return updated;
    });
  }, [room, currentUser]);

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
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase(); // 짧고 기억하기 쉬운 ID
    
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
          message: `🎉 ${userName}님이 방을 만들었습니다! 친구들을 초대해보세요!`,
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
    
    // 로컬 스토리지에 방 정보 저장 (시뮬레이션)
    localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    
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

    // 로컬 스토리지에서 방 찾기 (실제로는 서버에서 가져옴)
    const savedRoom = localStorage.getItem(`room_${roomId.toUpperCase()}`);
    
    let existingRoom: Room;
    
    if (savedRoom) {
      // 저장된 방이 있으면 복원
      const parsedRoom = JSON.parse(savedRoom);
      existingRoom = {
        ...parsedRoom,
        participants: [...parsedRoom.participants, user],
        messages: [
          ...parsedRoom.messages,
          {
            id: Math.random().toString(36).substr(2, 9),
            userId: 'system',
            userName: 'System',
            message: `👋 ${userName}님이 방에 참여했습니다!`,
            timestamp: new Date()
          }
        ]
      };
    } else {
      // 방이 없으면 기본 방 생성 (데모용)
      existingRoom = {
        id: roomId.toUpperCase(),
        name: `${userName}님의 방`,
        currentVideo: null,
        participants: [
          {
            id: 'demo-host',
            name: '방장',
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
            message: `🎵 음악을 함께 들어보세요! YouTube URL을 입력하면 시작됩니다.`,
            timestamp: new Date()
          },
          {
            id: '2',
            userId: 'system',
            userName: 'System',
            message: `👋 ${userName}님이 방에 참여했습니다!`,
            timestamp: new Date()
          }
        ],
        isPlaying: false,
        currentTime: 0,
        createdAt: new Date()
      };
    }

    setCurrentUser(user);
    setRoom(existingRoom);
    
    // 방 정보 업데이트
    localStorage.setItem(`room_${roomId.toUpperCase()}`, JSON.stringify(existingRoom));
    
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

    const updatedRoom = {
      ...room,
      messages: [...room.messages, newMessage]
    };

    setRoom(updatedRoom);
    
    // 로컬 스토리지 업데이트
    localStorage.setItem(`room_${room.id}`, JSON.stringify(updatedRoom));
  }, [currentUser, room]);

  const changeVideo = useCallback((videoId: string, title: string) => {
    if (!room) return;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    const updatedRoom = {
      ...room,
      currentVideo: { id: videoId, title, thumbnail },
      isPlaying: false,
      currentTime: 0
    };

    setRoom(updatedRoom);

    setPlayerState(prev => ({
      ...prev,
      videoId,
      isPlaying: false,
      currentTime: 0,
      duration: 0
    }));

    // 로컬 스토리지 업데이트
    localStorage.setItem(`room_${room.id}`, JSON.stringify(updatedRoom));

    addSystemMessage(`🎵 새 음악으로 변경되었습니다: ${title}`);
  }, [room, addSystemMessage]);

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