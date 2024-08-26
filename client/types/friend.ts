// client/types/friend.ts

export interface Friend {
    _id: string;
    username: string;
  }
  
  export interface PendingFriendship {
    _id: string;
    username: string;
    matchId: string;
  }