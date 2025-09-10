"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { IconArrowsUpDown } from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { UserList } from "@/type";
import { getRoleDisplay } from "@/lib/utils";

export default function UserGrid({
  users,
  isLoading,
}: {
  users: UserList[];
  isLoading: boolean;
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const filteredAndSortedUsers = React.useMemo(() => {
    const filtered: UserList[] = users;

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof UserList];
        let bValue = b[sortConfig.key as keyof UserList];

        if (
          sortConfig.key === "createdAt" ||
          sortConfig.key === "lastLoginAt" ||
          sortConfig.key === "lastPasswordChangeAt"
        ) {
          aValue = aValue ? new Date(aValue as string) : new Date(0);
          bValue = bValue ? new Date(bValue as string) : new Date(0);
        }

        if (aValue === undefined || bValue === undefined) return 0;

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
  }, [users, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Card className="border-0 shadow-sm bg-white py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-700 px-4">
                  User
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("role")}
                    className="hover:bg-gray-100 p-0 h-auto font-medium text-gray-700"
                  >
                    Role <IconArrowsUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("lastLoginAt")}
                    className="hover:bg-gray-100 p-0 h-auto font-medium text-gray-700"
                  >
                    Last Login <IconArrowsUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="hover:bg-gray-100 p-0 h-auto font-medium text-gray-700"
                  >
                    Joined <IconArrowsUpDown className="ml-1 w-3 h-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {isLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow
                          key={i}
                          className="animate-pulse border-b border-gray-50"
                        >
                          <TableCell className="py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full" />
                              <div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                                <div className="h-3 bg-gray-200 rounded w-24" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-6 bg-gray-200 rounded w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="h-6 bg-gray-200 rounded w-16" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-20" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-4" />
                          </TableCell>
                        </TableRow>
                      ))
                  : filteredAndSortedUsers.map((user) => {
                      const roleDisplay = getRoleDisplay(user.role);
                      const RoleIcon = roleDisplay.icon;

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-gray-200">
                                <AvatarImage
                                  src={user.pictureUrl}
                                  alt={user.fullName}
                                />
                                <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                                  {user.fullName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.fullName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${roleDisplay.color} border-0 font-medium`}
                            >
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {roleDisplay.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } border-0 font-medium`}
                            >
                              {user.isActive ? "Active" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.lastLoginAt
                              ? format(
                                  new Date(user.lastLoginAt),
                                  "MMM d, yyyy"
                                )
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {/* <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 hover:bg-gray-100"
                                >
                                  <IconDotsVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => onEditUser(user)}
                                  className="cursor-pointer"
                                >
                                  <IconEdit className="w-4 h-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onToggleUserStatus(user)}
                                  className="cursor-pointer"
                                >
                                  {user.isActive ? (
                                    <>
                                      <IconUserX className="w-4 h-4 mr-2 text-red-600" />
                                      Disable User
                                    </>
                                  ) : (
                                    <>
                                      <IconUserCheck className="w-4 h-4 mr-2 text-green-600" />
                                      Enable User
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu> */}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
