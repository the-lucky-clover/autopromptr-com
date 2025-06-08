
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardSubscription = () => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm md:text-base">Subscription</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 md:p-4 text-center">
          <p className="text-green-300 font-medium mb-1 text-sm">Plan</p>
          <p className="text-white text-xs md:text-sm">Limited to 5 batches per month</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSubscription;
