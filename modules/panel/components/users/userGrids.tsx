"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  IconDotsVertical,
  IconCrown,
  IconUser,
  IconSearch,
  IconEdit,
  IconUserX,
  IconUserCheck,
  IconActivity,
  IconArrowsUpDown,
} from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
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

// Define the user type based on your requirements
interface User {
  id: string;
  fullName: string;
  email: string;
  pictureUrl?: string;
  role: "admin" | "user";
  createdAt: string;
  lastLoginAt?: string;
  lastPasswordChangeAt?: string;
  isValid: boolean;
}

interface UserGridProps {
  users: User[];
  isLoading: boolean;
  onEditUser: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
}

export default function UserGrid({
  users,
  isLoading,
  onEditUser,
  onToggleUserStatus,
}: UserGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const filteredAndSortedUsers = React.useMemo(() => {
    const filtered: User[] = users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof User];
        let bValue = b[sortConfig.key as keyof User];

        if (
          sortConfig.key === "createdAt" ||
          sortConfig.key === "lastLoginAt" ||
          sortConfig.key === "lastPasswordChangeAt"
        ) {
          aValue = aValue ? new Date(aValue as string) : new Date(0);
          bValue = bValue ? new Date(bValue as string) : new Date(0);
        }

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
  }, [users, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getActivityStatus = (user: User) => {
    if (!user.lastLoginAt)
      return { label: "Never", color: "bg-gray-100 text-gray-600" };

    const lastLogin = new Date(user.lastLoginAt);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 7)
      return { label: "Active", color: "bg-green-100 text-green-800" };
    if (daysDiff <= 30)
      return { label: "Recent", color: "bg-blue-100 text-blue-800" };
    return { label: "Inactive", color: "bg-red-100 text-red-800" };
  };

  const getRoleDisplay = (role: "admin" | "user") => {
    return role === "admin"
      ? { label: "Admin", color: "bg-black text-white", icon: IconCrown }
      : { label: "User", color: "bg-gray-100 text-gray-800", icon: IconUser };
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Users
          </CardTitle>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-72 border-gray-200"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-700">
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
                          <TableCell className="py-4">
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
                      const activityStatus = getActivityStatus(user);
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
                                user.isValid
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } border-0 font-medium`}
                            >
                              {user.isValid ? "Active" : "Disabled"}
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
                            <DropdownMenu>
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
                                <DropdownMenuItem className="cursor-pointer">
                                  <IconActivity className="w-4 h-4 mr-2" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onToggleUserStatus(user)}
                                  className="cursor-pointer"
                                >
                                  {user.isValid ? (
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
                            </DropdownMenu>
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
