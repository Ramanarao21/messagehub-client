export interface GroupMember {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  members: GroupMember[];
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMessage {
  id: number;
  groupId: number;
  userId: number;
  message: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
}

export interface CreateGroupData {
  name: string;
  description?: string;
  memberIds?: number[];
}
