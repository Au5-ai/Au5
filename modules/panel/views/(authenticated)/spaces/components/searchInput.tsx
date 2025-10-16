import React, { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Search, X, Loader2, UserX } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/shared/components/ui/command";
import { userController } from "@/shared/network/api/userController";
import { User } from "@/shared/types";
import { toast } from "sonner";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 300;
const MAX_RESULTS = 8;

interface UserSearchInputProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
}

const getUserInitials = (user: User): string => {
  return user.fullName?.charAt(0) || user.email?.charAt(0) || "?";
};

const UserAvatar = ({
  user,
  size = "h-8 w-8",
}: {
  user: User;
  size?: string;
}) => (
  <Avatar className={`${size} rounded-lg`}>
    <AvatarImage src={user.pictureUrl} alt={user.fullName} />
    <AvatarFallback className={`${size} rounded-lg border-2 border-gray-200`}>
      {getUserInitials(user)}
    </AvatarFallback>
  </Avatar>
);

export default function UserSearchInput({
  selectedUsers,
  onUsersChange,
}: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < MIN_SEARCH_LENGTH) {
        setUsers([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const filtered = await userController.find(searchQuery);
        setUsers(filtered.slice(0, MAX_RESULTS));
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Failed to search users. Please try again.");
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, DEBOUNCE_DELAY);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      onUsersChange([...selectedUsers, user]);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter((u) => u.id !== userId));
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some((u) => u.id === userId);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() =>
            searchQuery.length >= MIN_SEARCH_LENGTH && setShowResults(true)
          }
          className="pl-10 border-gray-200 focus:bg-white transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showResults && (
        <Command className="rounded-lg border shadow-md" shouldFilter={false}>
          <CommandList>
            {users.length === 0 && !isSearching && (
              <CommandEmpty className="py-2  mt-2">
                <div className="flex items-center justify-center text-gray-500">
                  <UserX className="w-5 h-5 mr-2" />
                  <p>No users found</p>
                </div>
              </CommandEmpty>
            )}
            <CommandGroup>
              {users.map((user) => {
                const selected = isUserSelected(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    role="button"
                    tabIndex={selected ? -1 : 0}
                    aria-disabled={selected}
                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                      selected ? "opacity-50 pointer-events-none" : ""
                    }`}>
                    <div className="flex items-center gap-3 w-full">
                      <UserAvatar user={user} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {user.fullName || "No name"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {selected && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 border-0">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      )}

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedUsers.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="pl-1 pr-2 py-1.5 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-2">
                <UserAvatar user={user} />
                <span className="text-sm font-medium text-gray-700 flex flex-col">
                  <span>{user.fullName}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(user.id)}
                  aria-label={`Remove ${user.fullName || user.email}`}
                  className="hover:bg-gray-100 rounded-full p-0.5 transition-colors cursor-pointer">
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
