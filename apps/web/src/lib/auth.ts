import { create } from 'zustand';
import { Role } from '@pos/types';

export interface UserState {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenant_id: string;
  branch_id?: string;
}

interface AuthStore {
  token: string | null;
  user: UserState | null;
  setAuth: (token: string, user: UserState) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
