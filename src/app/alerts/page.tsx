import { AlertForm } from "@/components/alerts/alert-form";
import { AlertList } from "@/components/alerts/alert-list";

export default function AlertsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Price Alerts</h1>
        <p className="text-muted-foreground">
          Stay informed about cryptocurrency price movements with customizable alerts
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <AlertForm />
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Active Alerts</h2>
            <AlertList />
          </div>
        </div>
      </div>
    </div>
  );
}