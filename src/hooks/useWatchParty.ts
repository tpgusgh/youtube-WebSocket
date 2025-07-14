import { useState, useCallback, useEffect } from 'react';
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

  // 방 데이터를 전역 저장소에 저장 (실제로는 서버 사용)
  const saveRoomToStorage = useCallback((roomData: Room) => {
    localStorage.setItem(`room_${roomData.id}`, JSON.stringify(roomData));
    // 모든 방 목록도 저장
    const allRooms = JSON.parse(localStorage.getItem('all_rooms') || '[]');
    const existingIndex = allRooms.findIndex((r: any) => r.id === roomData.id);
    if (existingIndex >= 0) {
      allRooms[existingIndex] = roomData;
    } else {
      allRooms.push(roomData);
    }
    localStorage.setItem('all_rooms', JSON.stringify(allRooms));
  }, []);

  const loadRoomFromStorage = useCallback((roomId: string): Room | null => {
    try {
      const roomData = localStorage.getItem(`room_${roomId.toUpperCase()}`);
      if (roomData) {
        const parsed = JSON.parse(roomData);
        // 날짜 객체 복원
        parsed.createdAt = new Date(parsed.createdAt);
        parsed.messages = parsed.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        return parsed;
      }
    } catch (error) {
      console.error('방 로드 실패:', error);
    }
    return null;
  }, []);

  const addSystemMessage = useCallback((message: string) => {
    if (!room) return;
    
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date()
    };

    setRoom(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        messages: [...prev.messages, systemMessage]
      };
      saveRoomToStorage(updated);
      return updated;
    });
  }, [room, saveRoomToStorage]);

  const createRoom = useCallback((roomName: string, userName: string) => {
    const userId = `user_${Date.now()}`;
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
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
          message: `🎉 ${userName}님이 "${roomName}" 방을 만들었습니다!`,
          timestamp: new Date()
        }
      ],
      isPlaying: false,
      currentTime: 0,
      createdAt: new Date()
    };

    setCurrentUser(user);
    setRoom(newRoom);
    saveRoomToStorage(newRoom);
    
    // URL 업데이트
    window.history.pushState({}, '', `?room=${roomId}`);
    
    return { room: newRoom, user };
  }, [saveRoomToStorage]);

  const joinRoom = useCallback((roomId: string, userName: string) => {
    const upperRoomId = roomId.toUpperCase();
    const existingRoom = loadRoomFromStorage(upperRoomId);
    
    if (!existingRoom) {
      // 방이 없으면 에러
      throw new Error(`방 "${upperRoomId}"를 찾을 수 없습니다. 방 ID를 다시 확인해주세요.`);
    }

    const userId = `user_${Date.now()}`;
    const user: User = {
      id: userId,
      name: userName,
      isHost: false,
      avatar: `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
    };

    // 이미 같은 이름의 사용자가 있는지 확인
    const nameExists = existingRoom.participants.some(p => p.name === userName);
    if (nameExists) {
      user.name = `${userName}_${Math.random().toString(36).substr(2, 3)}`;
    }

    const updatedRoom: Room = {
      ...existingRoom,
      participants: [...existingRoom.participants, user],
      messages: [
        ...existingRoom.messages,
        {
          id: Date.now().toString(),
          userId: 'system',
          userName: 'System',
          message: `👋 ${user.name}님이 방에 참여했습니다!`,
          timestamp: new Date()
        }
      ]
    };

    setCurrentUser(user);
    setRoom(updatedRoom);
    saveRoomToStorage(updatedRoom);
    
    // 기존 동영상이 있으면 플레이어 상태 동기화
    if (updatedRoom.currentVideo) {
      setPlayerState({
        isPlaying: updatedRoom.isPlaying,
        currentTime: updatedRoom.currentTime,
        duration: 300, // 기본값
        videoId: updatedRoom.currentVideo.id
      });
    }
    
    // URL 업데이트
    window.history.pushState({}, '', `?room=${upperRoomId}`);
    
    return { room: updatedRoom, user };
  }, [loadRoomFromStorage, saveRoomToStorage]);

  const sendMessage = useCallback((message: string) => {
    if (!currentUser || !room) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      message,
      timestamp: new Date()
    };

    setRoom(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
      saveRoomToStorage(updated);
      return updated;
    });
  }, [currentUser, room, saveRoomToStorage]);

  const changeVideo = useCallback((videoId: string, title: string) => {
    if (!room || !currentUser) return;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    const updatedRoom = {
      ...room,
      currentVideo: { id: videoId, title, thumbnail },
      isPlaying: false,
      currentTime: 0
    };

    setRoom(updatedRoom);
    saveRoomToStorage(updatedRoom);

    setPlayerState(prev => ({
      ...prev,
      videoId,
      isPlaying: false,
      currentTime: 0,
      duration: 300 // 기본값
    }));

    // 시스템 메시지 추가
    setTimeout(() => {
      addSystemMessage(`🎵 ${currentUser.name}님이 새 음악으로 변경했습니다: ${title}`);
    }, 100);
  }, [room, currentUser, saveRoomToStorage, addSystemMessage]);

  const syncPlayerState = useCallback((newState: Partial<PlayerState>) => {
    if (!room || !currentUser) return;

    setPlayerState(prev => {
      const updated = { ...prev, ...newState };
      
      // 방 상태도 업데이트
      const updatedRoom = {
        ...room,
        isPlaying: updated.isPlaying,
        currentTime: updated.currentTime
      };
      
      setRoom(updatedRoom);
      saveRoomToStorage(updatedRoom);
      
      // 시스템 메시지 추가 (호스트만)
      if (currentUser.isHost) {
        if (newState.isPlaying !== undefined) {
          const action = newState.isPlaying ? '재생을 시작했습니다' : '일시정지했습니다';
          setTimeout(() => {
            addSystemMessage(`🎵 ${currentUser.name}님이 ${action}`);
          }, 100);
        }
      }
      
      return updated;
    });
  }, [room, currentUser, saveRoomToStorage, addSystemMessage]);

  // 주기적으로 방 상태 동기화 (다른 사용자의 변경사항 감지)
  useEffect(() => {
    if (!room) return;

    const interval = setInterval(() => {
      const latestRoom = loadRoomFromStorage(room.id);
      if (latestRoom && JSON.stringify(latestRoom) !== JSON.stringify(room)) {
        setRoom(latestRoom);
        
        // 플레이어 상태도 동기화
        if (latestRoom.currentVideo) {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: latestRoom.isPlaying,
            currentTime: latestRoom.currentTime,
            videoId: latestRoom.currentVideo!.id
          }));
        }
      }
    }, 2000); // 2초마다 체크

    return () => clearInterval(interval);
  }, [room, loadRoomFromStorage]);

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