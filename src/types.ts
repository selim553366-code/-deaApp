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
  title?: string;
  idea: string;
  code: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}
