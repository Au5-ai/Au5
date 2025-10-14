import React, { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";

export default function UserSearchInput({ selectedUsers, onUsersChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const allUsers = await base44.entities.User.list();
        const filtered = allUsers.filter(
          (user) =>
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setUsers(filtered.slice(0, 8));
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      onUsersChange([
        ...selectedUsers,
        {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          picture_url: user.picture_url,
        },
      ]);
    }
    setSearchQuery("");
    setShowResults(false);
  };

  const handleRemoveUser = (userId) => {
    onUsersChange(selectedUsers.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="pl-10 border-gray-200 focus:bg-white transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showResults && (
        <Command className="rounded-lg border shadow-md">
          <CommandList>
            {users.length === 0 && !isSearching && (
              <CommandEmpty>No users found</CommandEmpty>
            )}
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelectUser(user)}
                  className="cursor-pointer"
                  disabled={selectedUsers.some((u) => u.id === user.id)}>
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.picture_url}
                        alt={user.full_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-xs">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {selectedUsers.some((u) => u.id === user.id) && (
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 border-0">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
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
                <Avatar className="w-5 h-5">
                  <AvatarImage src={user.picture_url} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-xs">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="hover:bg-gray-100 rounded-full p-0.5 transition-colors">
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
