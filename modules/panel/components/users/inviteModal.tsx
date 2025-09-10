import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Mail,
  Plus,
  Send,
  Users,
  Crown,
  User,
  AlertCircle,
} from "lucide-react";

interface Invite {
  email: string;
  role: string;
}

export default function InviteModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationsSent, setInvitationsSent] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateAndAddEmail = () => {
    const trimmedEmail = currentEmail.trim().toLowerCase();

    // Reset errors
    setEmailError(null);

    // Check if email is empty
    if (!trimmedEmail) {
      setEmailError("Please enter an email address");
      return;
    }

    // Check if email is valid
    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check if email is duplicate
    const isDuplicate = invites.some((invite) => invite.email === trimmedEmail);
    if (isDuplicate) {
      setDuplicateEmails((prev) => [...prev, trimmedEmail]);
      setTimeout(() => {
        setDuplicateEmails((prev) =>
          prev.filter((email) => email !== trimmedEmail)
        );
      }, 3000);
      return;
    }

    setInvites((prev) => [
      ...prev,
      { email: trimmedEmail, role: selectedRole },
    ]);
    setCurrentEmail("");
  };

  const removeEmail = (emailToRemove: string) => {
    setInvites((prev) =>
      prev.filter((invite) => invite.email !== emailToRemove)
    );
    setDuplicateEmails((prev) =>
      prev.filter((email) => email !== emailToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndAddEmail();
    }
  };

  const getRoleDisplay = (role: string) => {
    return role === "admin"
      ? {
          label: "Admin",
          color:
            "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
          icon: Crown,
        }
      : {
          label: "User",
          color:
            "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
          icon: User,
        };
  };

  const sendInvitations = async () => {
    if (invites.length === 0) return;
    setIsLoading(true);

    try {
      // Call API with invites array
      console.log("Sending invites:", invites);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Hide the form by setting invitationsSent after successful API call
      setInvitationsSent(invites.length);
    } catch (error) {
      console.error("Failed to send invitations:", error);
      // Handle error (show error message to user, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setInvites([]);
    setCurrentEmail("");
    setSelectedRole("user");
    setInvitationsSent(0);
    setEmailError(null);
    setDuplicateEmails([]);
  };

  React.useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const roleDisplay = getRoleDisplay(selectedRole);
  const RoleIcon = roleDisplay.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-gray-200">
        {invitationsSent === 0 ? (
          <>
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                Invite Users
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Assign Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="border-gray-200 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 w-full">
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>User</span>
                        <span className="text-xs text-gray-500">
                          - Standard access
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span>Administrator</span>
                        <span className="text-xs text-gray-500">
                          - Full access
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Selected role:</span>
                  <Badge
                    className={`${roleDisplay.color} border-0 font-medium`}
                  >
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleDisplay.label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Addresses
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address..."
                    value={currentEmail}
                    onChange={(e) => {
                      setCurrentEmail(e.target.value);
                      setEmailError(null);
                    }}
                    onKeyUp={handleKeyPress}
                    className={`flex-1 border-gray-200 ${
                      emailError ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  <Button
                    variant="outline"
                    onClick={validateAndAddEmail}
                    size="sm"
                    className="border-gray-200 hover:bg-gray-50 h-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {emailError && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Press Enter to add emails
                </p>
              </div>
              <AnimatePresence>
                {invites.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium text-gray-700">
                      Inviting ({invites.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {invites.map((invite) => {
                        const isDuplicate = duplicateEmails.includes(
                          invite.email
                        );

                        return (
                          <motion.div
                            key={invite.email}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={isDuplicate ? "animate-pulse" : ""}
                          >
                            <Badge
                              variant="secondary"
                              className={`${
                                isDuplicate
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              } pr-1 transition-colors duration-300`}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              {invite.email}
                              {` (${invite.role})`}
                              <Button
                                onClick={() => removeEmail(invite.email)}
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-xl"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                            {isDuplicate && (
                              <div className="text-xs text-red-600 mt-1">
                                Duplicate email
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <DialogFooter className="pt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={sendInvitations}
                disabled={invites.length === 0 || isLoading}
                className="bg-black hover:bg-gray-800 text-white min-w-24"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Invites
                  </div>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              Invitations Sent!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {invitationsSent} invitation{invitationsSent !== 1 ? "s" : ""}{" "}
              sent successfully.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
