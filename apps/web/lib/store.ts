import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { User, ChatSession, AnalyticsData, DashboardData } from '@repo/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          set({ user: null, isAuthenticated: false });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);

// Chat Store
interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: { [sessionId: string]: any[] };
  isConnected: boolean;
  setCurrentSession: (session: ChatSession | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  addMessage: (sessionId: string, message: any) => void;
  setMessages: (sessionId: string, messages: any[]) => void;
  setConnected: (connected: boolean) => void;
  clearMessages: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  sessions: [],
  messages: {},
  isConnected: false,
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  addMessage: (sessionId, message) => {
    const currentMessages = get().messages[sessionId] || [];
    set({
      messages: {
        ...get().messages,
        [sessionId]: [...currentMessages, message],
      },
    });
  },
  setMessages: (sessionId, messages) => {
    set({
      messages: {
        ...get().messages,
        [sessionId]: messages,
      },
    });
  },
  setConnected: (isConnected) => set({ isConnected }),
  clearMessages: (sessionId) => {
    set({
      messages: {
        ...get().messages,
        [sessionId]: [],
      },
    });
  },
}));

// Analytics Store
interface AnalyticsState {
  dashboardData: DashboardData | null;
  analyticsData: AnalyticsData[];
  timeRange: string;
  isLoading: boolean;
  setDashboardData: (data: DashboardData | null) => void;
  setAnalyticsData: (data: AnalyticsData[]) => void;
  setTimeRange: (timeRange: string) => void;
  setLoading: (loading: boolean) => void;
  addAnalyticsData: (data: AnalyticsData) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dashboardData: null,
  analyticsData: [],
  timeRange: '7d',
  isLoading: false,
  setDashboardData: (data) => set({ dashboardData: data }),
  setAnalyticsData: (data) => set({ analyticsData: data }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setLoading: (isLoading) => set({ isLoading }),
  addAnalyticsData: (data) => {
    const currentData = get().analyticsData;
    set({ analyticsData: [data, ...currentData] });
  },
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'light',
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);
