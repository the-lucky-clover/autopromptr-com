
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const ActivityChart = () => {
  const data = [
    { name: 'Mon', executions: 120 },
    { name: 'Tue', executions: 190 },
    { name: 'Wed', executions: 150 },
    { name: 'Thu', executions: 280 },
    { name: 'Fri', executions: 350 },
    { name: 'Sat', executions: 200 },
    { name: 'Sun', executions: 160 },
  ];

  return (
    <Card className="glass-effect border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Weekly Activity</CardTitle>
        <CardDescription className="text-gray-400">
          Prompt executions over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Line 
              type="monotone" 
              dataKey="executions" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
