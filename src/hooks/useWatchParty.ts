import { useState, useEffect, useCallback } from 'react';
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

  // 시뮬레이션된 실시간 동기화 ( callback으로 room변수가 바뀌면 호출 )
  const syncPlayerState = useCallback((newState: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...newState }));
    
    // WebSocket으로 다른 참가자들에게 전송
    if (room) {
      setRoom(prev => prev ? {
        ...prev,
        isPlaying: newState.isPlaying ?? prev.isPlaying,
        currentTime: newState.currentTime ?? prev.currentTime
      } : null);
    }
  }, [room]);

  const createRoom = useCallback((roomName: string, userName: string) => {
    const userId = Math.random().toString(36).substr(2, 9);
    const roomId = Math.random().toString(36).substr(2, 9);
    
    const user: User = {
      id: userId,
      name: userName,
      isHost: true,
      avatar: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL3Zk15wwmVdfFGnrINbxcNULHH4RuKQvAIg&s`
    };

    const newRoom: Room = {
      id: roomId,
      name: roomName,
      currentVideo: null,
      participants: [user],
      messages: [],
      isPlaying: false,
      currentTime: 0,
      createdAt: new Date()
    };

    setCurrentUser(user);
    setRoom(newRoom);
    
    return { room: newRoom, user };
  }, []);

  const joinRoom = useCallback((roomId: string, userName: string) => {
    const userId = Math.random().toString(36).substr(2, 9);
    
    const user: User = {
      id: userId,
      name: userName,
      isHost: false,
      avatar: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL3Zk15wwmVdfFGnrINbxcNULHH4RuKQvAIg&s`
    };

    // 시뮬레이션된 방 참여 (실제로는 서버에서 방 정보 가져옴)
    const existingRoom: Room = {
      id: roomId,
      name: 'Shared Room',
      currentVideo: {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      participants: [user],
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
      currentTime: 0,
      createdAt: new Date()
    };

    setCurrentUser(user);
    setRoom(existingRoom);
    
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
      currentTime: 0
    }));
  }, [currentUser, room]);

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