export interface User {
  uid: string;
  email: string;
  name?: string;
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
  hasPaidForNameChange?: boolean;
  chatHistory?: { role: 'user' | 'model', text: string }[];
  createdAt: string;
  updatedAt: string;
}
