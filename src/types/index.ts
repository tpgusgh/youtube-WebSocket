export interface User {
  id: string;
  name: string;
  isHost: boolean;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export interface Room {
  id: string;
  name: string;
  currentVideo: {
    id: string;
    title: string;
    thumbnail: string;
  } | null;
  participants: User[];
  messages: ChatMessage[];
  isPlaying: boolean;
  currentTime: number;
  createdAt: Date;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  videoId: string;
}