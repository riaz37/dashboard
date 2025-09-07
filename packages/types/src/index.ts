// Shared types for AnalyticsAI Dashboard
// Used by both frontend (Next.js) and backend (Nest.js)

// ===== USER TYPES =====
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  timezone: string;
  language: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  rating: number;
  achievements: string[];
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ===== ANALYTICS TYPES =====
export enum MetricType {
  PAGE_VIEWS = 'page_views',
  CONVERSION_RATE = 'conversion_rate',
  REVENUE = 'revenue',
  ACTIVE_USERS = 'active_users',
  BOUNCE_RATE = 'bounce_rate',
  SESSION_DURATION = 'session_duration',
  CLICK_THROUGH_RATE = 'click_through_rate',
  CUSTOMER_ACQUISITION_COST = 'customer_acquisition_cost',
  LIFETIME_VALUE = 'lifetime_value',
  CHURN_RATE = 'churn_rate'
}

export enum TimeRange {
  HOUR = '1h',
  DAY = '1d',
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d'
}

export interface AnalyticsData {
  id: string;
  metricType: MetricType;
  value: number;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface MetricDetails {
  metricType: MetricType;
  currentValue: number;
  previousValue?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: AnalyticsData[];
  summary?: string;
}

export interface DashboardData {
  userId: string;
  metrics: MetricDetails[];
  insights: string[];
  lastUpdated: Date;
  timeRange: TimeRange;
}

export interface CreateAnalyticsDataDto {
  metricType: MetricType;
  value: number;
  userId: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface GetAnalyticsDataDto {
  userId: string;
  metricTypes?: MetricType[];
  timeRange?: TimeRange;
  limit?: number;
}

// ===== CHAT TYPES =====
export enum MessageType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
  ERROR = 'error'
}

export interface ChatMessage {
  id: string;
  message: string;
  messageType: MessageType;
  userId: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  messageType: MessageType;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  suggestions?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isActive: boolean;
}

export interface SendMessageDto {
  message: string;
  userId: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface GetChatHistoryDto {
  userId: string;
  sessionId?: string;
  limit?: number;
}

// ===== DASHBOARD TYPES =====
export interface Dashboard {
  id: string;
  userId: string;
  title: string;
  description?: string;
  widgets: DashboardWidget[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CreateDashboardDto {
  title: string;
  description?: string;
  widgets?: DashboardWidget[];
  isPublic?: boolean;
}

export interface UpdateDashboardDto {
  title?: string;
  description?: string;
  widgets?: DashboardWidget[];
  isPublic?: boolean;
}

// ===== CHART TYPES =====
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap'
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  options?: Record<string, any>;
}

export interface CreateChartDto {
  userId: string;
  config: ChartConfig;
}

// ===== ALERT TYPES =====
export enum AlertType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  TREND = 'trend'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metricType: MetricType;
  condition: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface CreateAlertDto {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metricType: MetricType;
  condition: Record<string, any>;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== WEBSOCKET TYPES =====
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface ChatWebSocketMessage extends WebSocketMessage {
  type: 'chat_message' | 'chat_response' | 'typing' | 'user_joined' | 'user_left';
  data: {
    message?: string;
    sessionId?: string;
    userId?: string;
    username?: string;
  };
}

export interface AnalyticsWebSocketMessage extends WebSocketMessage {
  type: 'metric_update' | 'alert_triggered' | 'dashboard_update';
  data: {
    metricType?: MetricType;
    value?: number;
    alert?: Alert;
    dashboardId?: string;
  };
}

// ===== ERROR TYPES =====
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: Date;
  path: string;
}

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
