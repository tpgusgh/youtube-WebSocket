import React from 'react';
import { YouTubePlayer } from './YouTubePlayer';
import { ChatBox } from './ChatBox';
import { RoomControls } from './RoomControls';
import { ParticipantsList } from './ParticipantsList';
import { Room, User, PlayerState } from '../types';

interface WatchPartyProps {
  room: Room;
  currentUser: User;
  playerState: PlayerState;
  onStateChange: (state: Partial<PlayerState>) => void;
  onSendMessage: (message: string) => void;
  onChangeVideo: (videoId: string, title: string) => void;
}

export const WatchParty: React.FC<WatchPartyProps> = ({
  room,
  currentUser,
  playerState,
  onStateChange,
  onSendMessage,
  onChangeVideo
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            YouTube Watch Party
          </h1>
          <p className="text-gray-400 mt-1">친구들과 함께 YouTube를 시청하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 동영상 영역 */}
          <div className="lg:col-span-2 space-y-6">
            <YouTubePlayer
              videoId={room.currentVideo?.id || ''}
              playerState={playerState}
              onStateChange={onStateChange}
              isHost={currentUser.isHost}
            />
            
            {/* 모바일에서만 보이는 방 컨트롤 */}
            <div className="lg:hidden">
              <RoomControls
                room={room}
                currentUser={currentUser}
                onChangeVideo={onChangeVideo}
              />
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 채팅 */}
            <div className="lg:col-span-1 bg-gray-800 rounded-lg overflow-hidden h-[600px]">
              <ChatBox
                messages={room.messages}
                currentUser={currentUser}
                onSendMessage={onSendMessage}
              />
            </div>

            {/* 컨트롤 및 참가자 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 데스크톱에서만 보이는 방 컨트롤 */}
              <div className="hidden lg:block">
                <RoomControls
                  room={room}
                  currentUser={currentUser}
                  onChangeVideo={onChangeVideo}
                />
              </div>
              
              <ParticipantsList
                participants={room.participants}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};