export interface User {
  uid: string;
  email: string;
  name?: string;
  credits: number;
  updateCredits: number;
  siteCreationCredits: number;
  isPremium: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  idea: string;
  code: string;
  isPublished: boolean;
  isPublic: boolean;
  remixOfId?: string;
  hasPaidForNameChange?: boolean;
  customUrl?: string;
  chatHistory?: { role: 'user' | 'model', text: string }[];
  createdAt: string;
  updatedAt: string;
}
