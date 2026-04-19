import {
  Bot,
  Phone,
  Mail,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Active Agents", value: "0", icon: Bot, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Calls Handled", value: "0", icon: Phone, color: "text-green-400", bg: "bg-green-500/10" },
  { label: "Emails Processed", value: "0", icon: Mail, color: "text-purple-400", bg: "bg-purple-500/10" },
  { label: "Revenue Generated", value: "$0", icon: DollarSign, color: "text-orange-400", bg: "bg-orange-500/10" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your AI workforce at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`inline-flex size-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-blue-400" />
              My Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No agents deployed yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your AI staff will appear here once deployed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-orange-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No activity yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calls, emails, and sales will appear in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-green-400" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="size-16 text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">
              Performance charts will populate as your agents start working.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
