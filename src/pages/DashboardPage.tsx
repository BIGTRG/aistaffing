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
  { label: "Active Agents", value: "0", icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Calls Handled", value: "0", icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Emails Processed", value: "0", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Revenue Generated", value: "$0", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-50" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Your AI workforce at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              <div className={`inline-flex size-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="size-5 text-blue-600" />
              My Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Bot className="size-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No agents deployed yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your AI staff will appear here once deployed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="size-5 text-orange-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Clock className="size-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No activity yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Calls, emails, and sales will appear in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Preview */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="size-5 text-emerald-600" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <TrendingUp className="size-8 text-gray-400" />
            </div>
            <p className="text-gray-600">
              Performance charts will populate as your agents start working.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
