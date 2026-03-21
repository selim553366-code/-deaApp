export interface User {
  uid: string;
  email: string;
  credits: number;
  isPremium: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  idea: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}
