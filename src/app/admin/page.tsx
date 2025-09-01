import { SyncPanel } from "@/components/admin/sync-panel";
import { TestSyncPanel } from "@/components/admin/test-sync-panel";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage cryptocurrency data and system operations
        </p>
      </div>
      
      <div className="grid gap-6">
        <TestSyncPanel />
        <SyncPanel />
      </div>
    </div>
  );
}