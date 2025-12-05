import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, MessageSquare, FileText, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AnalyticsDashboard = () => {
  const { summary, dailyUsage, topDocuments, isLoading } = useAnalytics(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalCreditsUsed = summary.reduce((acc, item) => acc + Number(item.total_credits), 0);
  const totalEvents = summary.reduce((acc, item) => acc + Number(item.total_events), 0);

  // Prepare data for charts
  const eventTypeData = summary.map(item => ({
    name: item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1),
    events: Number(item.total_events),
    credits: Number(item.total_credits)
  }));

  const dailyData = dailyUsage.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    events: Number(item.total_events),
    credits: Number(item.total_credits)
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsUsed}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Chats, summaries, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Credits/Day</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyUsage.length > 0 ? Math.round(totalCreditsUsed / dailyUsage.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Based on active days</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Activity Type</CardTitle>
          <CardDescription>Credits used per activity type in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {eventTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="events" fill="#8884d8" name="Events" />
                <Bar yAxisId="right" dataKey="credits" fill="#82ca9d" name="Credits" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No activity data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Credit Usage</CardTitle>
          <CardDescription>Your credit consumption over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="credits" stroke="#8884d8" name="Credits Used" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No daily usage data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Documents</CardTitle>
          <CardDescription>Documents you interact with the most</CardDescription>
        </CardHeader>
        <CardContent>
          {topDocuments.length > 0 ? (
            <div className="space-y-4">
              {topDocuments.map((doc, index) => (
                <div key={doc.document_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {doc.document_name || 'Unnamed Document'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doc.total_interactions} interactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{doc.total_credits} credits</div>
                    <div className="text-xs text-muted-foreground">total used</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No document activity yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
