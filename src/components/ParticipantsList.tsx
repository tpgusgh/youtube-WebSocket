import React from 'react';
import { Crown, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface ParticipantsListProps {
  participants: User[];
  currentUser: User;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUser
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <UserIcon className="w-5 h-5" />
        <span>참가자 ({participants.length}명)</span>
      </h3>
      
      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              participant.id === currentUser.id
                ? 'bg-red-600/20 border border-red-600/30'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-white font-medium truncate">
                  {participant.name}
                  {participant.id === currentUser.id && (
                    <span className="text-gray-400 text-sm ml-1">(나)</span>
                  )}
                </p>
                {participant.isHost && (
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {participant.isHost ? '방장' : '참가자'}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-xs">온라인</span>
            </div>
          </div>
        ))}
      </div>
      
      {participants.length === 1 && (
        <div className="text-center py-8">
          <UserIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">다른 참가자들이 참여하기를 기다리고 있습니다</p>
          <p className="text-gray-500 text-sm mt-1">방 링크를 공유해보세요!</p>
        </div>
      )}
    </div>
  );
};