// server/types/friends.ts

export interface FriendInfo {
    _id: string;
    username: string;
  }
  
  export interface PendingFriendship {
    _id: string;
    username: string;
    matchId: string;
  }