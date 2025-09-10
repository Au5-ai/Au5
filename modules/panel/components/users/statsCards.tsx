import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Shield, UserX } from "lucide-react";

export default function StatsCards({ users, isLoading }) {
  const calculateStats = () => {
    if (!users.length) {
      return {
        total: 0,
        active: 0,
        administrators: 0,
        inactive: 0,
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const active = users.filter(
      (user) =>
        user.isValid &&
        user.lastLoginAt &&
        new Date(user.lastLoginAt) >= thirtyDaysAgo
    ).length;

    const administrators = users.filter((user) => user.role === "admin").length;

    const inactive = users.filter(
      (user) =>
        !user.isValid ||
        !user.lastLoginAt ||
        new Date(user.lastLoginAt) < ninetyDaysAgo
    ).length;

    return {
      total: users.length,
      active,
      administrators,
      inactive,
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: Users,
    },
    {
      title: "Active Users",
      value: stats.active,
      icon: UserCheck,
    },
    {
      title: "Administrators",
      value: stats.administrators,
      icon: Shield,
    },
    {
      title: "Inactive Users",
      value: stats.inactive,
      icon: UserX,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="bg-card text-card-foreground rounded-xl border shadow-sm py-0"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "--" : stat.value.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <stat.icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
