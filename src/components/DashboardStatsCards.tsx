
import { Card, CardContent } from "@/components/ui/card";

interface StatsData {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface DashboardStatsCardsProps {
  stats: {
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalPrompts: number;
  };
  isCompact?: boolean;
}

const DashboardStatsCards = ({ stats, isCompact = false }: DashboardStatsCardsProps) => {
  const statsData: StatsData[] = [
    {
      title: "Total Batches",
      value: stats.totalBatches.toString(),
      icon: "📊",
      color: "bg-blue-500"
    },
    {
      title: "Active Batches", 
      value: stats.activeBatches.toString(),
      icon: "⚡",
      color: "bg-orange-500"
    },
    {
      title: "Completed",
      value: stats.completedBatches.toString(), 
      icon: "✅",
      color: "bg-green-500"
    },
    {
      title: "Total Prompts",
      value: stats.totalPrompts.toString(),
      icon: "🎯", 
      color: "bg-purple-500"
    }
  ];

  if (isCompact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-purple-200 text-[10px] font-medium truncate">{stat.title}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{stat.value}</p>
                </div>
                <div className={`w-5 h-5 ${stat.color} rounded-lg flex items-center justify-center text-white text-[10px] flex-shrink-0 ml-1`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-200 text-xs md:text-sm font-medium truncate">{stat.title}</p>
                <p className="text-xl md:text-3xl font-bold text-white mt-1 md:mt-2">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-sm md:text-xl flex-shrink-0 ml-2`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatsCards;
