"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowsUpDown } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Users, Building2 } from "lucide-react";
import NoRecordsState from "@/shared/components/empty-states/no-record";
import { Space } from "@/shared/types/space";

interface SpaceGridProps {
  spaces: Space[];
  isLoading: boolean;
}

export default function SpaceGrid({ spaces, isLoading }: SpaceGridProps) {
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const filteredAndSortedSpaces = React.useMemo(() => {
    const filtered: Space[] = spaces;

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Space];
        const bValue = b[sortConfig.key as keyof Space];

        if (
          aValue === undefined ||
          bValue === undefined ||
          aValue === null ||
          bValue === null
        )
          return 0;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [spaces, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-100">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <TableHead key={i} className="font-medium text-gray-700">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse border-b border-gray-50">
                      <TableCell className="py-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-48" />
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {Array(3)
                            .fill(0)
                            .map((_, j) => (
                              <div
                                key={j}
                                className="w-8 h-8 bg-gray-200 rounded-lg"
                              />
                            ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {Array(2)
                            .fill(0)
                            .map((_, j) => (
                              <div
                                key={j}
                                className="w-8 h-8 bg-gray-200 rounded-lg"
                              />
                            ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!spaces || spaces.length === 0) {
    return (
      <div className="h-full text-center">
        <NoRecordsState
          title="No Spaces Created"
          description="Get started by creating a new space."
          icon={Building2}
        />
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-700 px-4">
                  Space Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Assigned Users
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Admins
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.map((space: Space) => (
                <TableRow
                  key={space.id}
                  className="hover:bg-gray-50/50 transition-colors duration-150">
                  <TableCell>
                    <span className="font-semibold text-gray-900 px-4">
                      {space.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-600 max-w-md line-clamp-2">
                      {space.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {space.users && space.users.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {space.users.slice(0, 3).map((user, idx) => (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 rounded-lg">
                                  <AvatarImage
                                    src={user.pictureUrl}
                                    alt={user.fullName}
                                  />
                                  <AvatarFallback className="h-8 w-8 rounded-lg border-2 border-gray-200">
                                    {user.fullName?.charAt(0) ||
                                      user.email?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{user.fullName || user.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        {space.users.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 border-0">
                            +{space.users.length - 3}
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
                    {space.users &&
                    space.users.filter((u) => u.isAdmin).length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {space.users
                            .filter((u) => u.isAdmin)
                            .slice(0, 3)
                            .map((user, idx) => (
                              <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                      src={user.pictureUrl}
                                      alt={user.fullName}
                                    />
                                    <AvatarFallback className="h-8 w-8 rounded-lg border-2 border-purple-200 bg-purple-50">
                                      {user.fullName?.charAt(0) ||
                                        user.email?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{user.fullName || user.email} (Admin)</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                        </div>
                        {space.users.filter((u) => u.isAdmin).length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 border-0">
                            +{space.users.filter((u) => u.isAdmin).length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">No admins</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
