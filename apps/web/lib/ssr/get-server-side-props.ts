import { GetServerSidePropsContext } from 'next';
import { AnalyticsService } from '../api/analytics.service';
import { ChatService } from '../api/chat.service';
import { UsersService } from '../api/users.service';
import { User, DashboardData, AnalyticsData, ChatSession } from '@repo/types';

export interface ServerSideProps {
  user?: User;
  dashboardData?: DashboardData;
  analyticsData?: AnalyticsData[];
  chatSessions?: ChatSession[];
  error?: string;
}

export async function getServerSidePropsWithAuth(
  context: GetServerSidePropsContext,
  additionalDataFetchers?: {
    dashboardData?: (userId: string, accessToken: string) => Promise<DashboardData>;
    analyticsData?: (accessToken: string) => Promise<AnalyticsData[]>;
    chatSessions?: (accessToken: string) => Promise<ChatSession[]>;
  }
): Promise<{ props: ServerSideProps }> {
  const { req } = context;
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return {
      props: {
        error: 'Unauthorized',
      },
    };
  }

  try {
    // Get user profile
    const userResponse = await UsersService.getProfileSSR(accessToken);
    if (!userResponse.success) {
      return {
        props: {
          error: 'Failed to fetch user profile',
        },
      };
    }

    const user = userResponse.data;
    const props: ServerSideProps = { user };

    // Fetch additional data if requested
    if (additionalDataFetchers) {
      if (additionalDataFetchers.dashboardData) {
        try {
          const dashboardResponse = await additionalDataFetchers.dashboardData(
            user!.id,
            accessToken
          );
          props.dashboardData = dashboardResponse;
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      }

      if (additionalDataFetchers.analyticsData) {
        try {
          const analyticsResponse = await additionalDataFetchers.analyticsData(accessToken);
          props.analyticsData = analyticsResponse;
        } catch (error) {
          console.error('Error fetching analytics data:', error);
        }
      }

      if (additionalDataFetchers.chatSessions) {
        try {
          const chatResponse = await additionalDataFetchers.chatSessions(accessToken);
          props.chatSessions = chatResponse;
        } catch (error) {
          console.error('Error fetching chat sessions:', error);
        }
      }
    }

    return { props };
  } catch (error) {
    console.error('Error in getServerSidePropsWithAuth:', error);
    return {
      props: {
        error: 'Internal server error',
      },
    };
  }
}

export async function getServerSidePropsForDashboard(
  context: GetServerSidePropsContext
): Promise<{ props: ServerSideProps }> {
  return getServerSidePropsWithAuth(context, {
    dashboardData: async (userId: string, accessToken: string) => {
      const response = await AnalyticsService.getDashboardDataSSR(userId, '7d', accessToken);
      return response.data || {} as DashboardData;
    },
    analyticsData: async (accessToken: string) => {
      const response = await AnalyticsService.getMetricsSSR(
        { timeRange: '7d', limit: 100 },
        accessToken
      );
      return response.data || [];
    },
  });
}

export async function getServerSidePropsForChat(
  context: GetServerSidePropsContext
): Promise<{ props: ServerSideProps }> {
  return getServerSidePropsWithAuth(context, {
    chatSessions: async (accessToken: string) => {
      const response = await ChatService.getSessionsSSR(accessToken);
      return response.data || [];
    },
  });
}
