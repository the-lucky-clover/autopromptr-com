
// Dedicated page for managing the migration process
import { EnvironmentIndicator } from '@/components/cloudflare/EnvironmentIndicator';
import { MigrationControlPanel } from '@/components/cloudflare/MigrationControlPanel';
import Navbar from '@/components/Navbar';

const MigrationDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-600">
      <Navbar />
      <EnvironmentIndicator />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Migration Dashboard
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Monitor and control the transition from Lovable to Cloudflare Pages + Workers
            </p>
          </div>
          
          <MigrationControlPanel />
        </div>
      </div>
    </div>
  );
};

export default MigrationDashboard;
