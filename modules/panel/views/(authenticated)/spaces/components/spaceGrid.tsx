import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Users, Building2 } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { format } from "date-fns";

export default function SpaceGrid({ spaces, isLoading }) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-sm border-gray-100">
        <div className="p-8 space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
        </div>
      </Card>
    );
  }

  if (!spaces || spaces.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm border-gray-100">
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Spaces Yet
          </h3>
          <p className="text-gray-500">
            Create your first space to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm border-gray-100">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b border-gray-100">
              <TableHead className="font-semibold text-gray-700">
                Space Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Description
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Assigned Users
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spaces.map((space) => (
              <TableRow
                key={space.id}
                className="hover:bg-gray-50/50 transition-colors duration-150">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-sm">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {space.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-gray-600 max-w-md line-clamp-2">
                    {space.description || "—"}
                  </p>
                </TableCell>
                <TableCell>
                  {space.assigned_users && space.assigned_users.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {space.assigned_users.slice(0, 3).map((user, idx) => (
                          <Avatar
                            key={idx}
                            className="w-8 h-8 border-2 border-white shadow-sm">
                            <AvatarImage
                              src={user.picture_url}
                              alt={user.full_name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white text-xs">
                              {user.full_name?.charAt(0) ||
                                user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {space.assigned_users.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-600 border-0">
                          +{space.assigned_users.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">No users</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {format(new Date(space.created_date), "MMM d, yyyy")}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
