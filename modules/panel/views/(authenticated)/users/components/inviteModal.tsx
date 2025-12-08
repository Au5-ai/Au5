import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  X,
  Mail,
  Plus,
  Send,
  Users,
  Crown,
  User,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Users2Icon,
  EraserIcon,
  AtSign,
} from "lucide-react";
import { getRoleDisplay, getRoleType, validateEmail } from "@/shared/lib/utils";
import { USER_MANAGEMENT_CAPTIONS } from "../i18n";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { userController, InviteUsersResponse } from "../userController";

interface Invite {
  email: string;
  role: number;
}

export default function InviteModal({
  open,
  onOpenChange,
  onReloadData,
}: {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onReloadData: () => void;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [invitationsSent, setInvitationsSent] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [inviteResult, setInviteResult] = useState<InviteUsersResponse | null>(
    null,
  );

  const validateAndAddEmail = () => {
    const trimmedEmail = currentEmail.trim().toLowerCase();
    setEmailError(null);
    if (!trimmedEmail) {
      setEmailError(USER_MANAGEMENT_CAPTIONS.inviteModal.pleaseEnterEmail);
      return;
    }
    if (invites.length >= 5) {
      setEmailError(USER_MANAGEMENT_CAPTIONS.inviteModal.maxInvitesReached);
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setEmailError(GLOBAL_CAPTIONS.validation.email.invalid);
      return;
    }
    const isDuplicate = invites.some((invite) => invite.email === trimmedEmail);
    if (isDuplicate) {
      setDuplicateEmails((prev) => [...prev, trimmedEmail]);
      setTimeout(() => {
        setDuplicateEmails((prev) =>
          prev.filter((email) => email !== trimmedEmail),
        );
      }, 3000);
      return;
    }

    setInvites((prev) => [
      ...prev,
      { email: trimmedEmail, role: getRoleType(selectedRole) },
    ]);
    setCurrentEmail("");
  };

  const removeEmail = (emailToRemove: string) => {
    setInvites((prev) =>
      prev.filter((invite) => invite.email !== emailToRemove),
    );
    setDuplicateEmails((prev) =>
      prev.filter((email) => email !== emailToRemove),
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndAddEmail();
    }
  };

  const sendInvitations = async () => {
    if (invites.length === 0) return;
    setIsLoading(true);
    setInviteResult(null);
    try {
      const result = await userController.inviteUsers(invites);
      setInviteResult(result);
      setInvitationsSent(invites.length);
    } catch (error) {
      setInviteResult(null);
      console.error(
        USER_MANAGEMENT_CAPTIONS.inviteModal.failedToSendInvitations,
        error,
      );
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
    setInviteResult(null);
  };

  React.useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  const roleDisplay = getRoleDisplay(getRoleType(selectedRole));
  const RoleIcon = roleDisplay.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] bg-white border-gray-200">
        {invitationsSent === 0 ? (
          <>
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                {USER_MANAGEMENT_CAPTIONS.inviteModal.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700">
                  {USER_MANAGEMENT_CAPTIONS.inviteModal.assignRole}
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="border-gray-200 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 w-full">
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{GLOBAL_CAPTIONS.roles.user}</span>
                        <span className="text-xs text-gray-500">
                          {USER_MANAGEMENT_CAPTIONS.roles.userDescription}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span>{GLOBAL_CAPTIONS.roles.administrator}</span>
                        <span className="text-xs text-gray-500">
                          {
                            USER_MANAGEMENT_CAPTIONS.roles
                              .administratorDescription
                          }
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">
                    {USER_MANAGEMENT_CAPTIONS.inviteModal.selectedRole}
                  </span>
                  <Badge
                    className={`${roleDisplay.color} border-0 font-medium`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleDisplay.label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700">
                  {USER_MANAGEMENT_CAPTIONS.inviteModal.emailAddresses}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      USER_MANAGEMENT_CAPTIONS.inviteModal.enterEmailPlaceholder
                    }
                    value={currentEmail}
                    onChange={(e) => {
                      setCurrentEmail(e.target.value);
                      setEmailError(null);
                    }}
                    onKeyUp={handleKeyPress}
                    disabled={invites.length >= 5}
                    className={`flex-1 border-gray-200 ${
                      emailError ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  <Button
                    variant="outline"
                    onClick={validateAndAddEmail}
                    size="sm"
                    disabled={invites.length >= 5}
                    className="border-gray-200 hover:bg-gray-50 h-9">
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
                  {USER_MANAGEMENT_CAPTIONS.inviteModal.pressEnterHint}
                </p>
              </div>
              <AnimatePresence>
                {invites.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {USER_MANAGEMENT_CAPTIONS.inviteModal.inviting} (
                      {invites.length}/5)
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-gray-200">
                      {invites.map((invite) => {
                        const isDuplicate = duplicateEmails.includes(
                          invite.email,
                        );

                        return (
                          <motion.div
                            key={invite.email}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={isDuplicate ? "animate-pulse" : ""}>
                            <Badge
                              variant="secondary"
                              className={`${
                                isDuplicate
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              } pr-1 transition-colors duration-300`}>
                              <Mail className="w-3 h-3 mr-1" />
                              {invite.email}
                              {` (${getRoleDisplay(invite.role)?.label})`}
                              <Button
                                onClick={() => removeEmail(invite.email)}
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-xl">
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                            {isDuplicate && (
                              <div className="text-xs text-red-600 mt-1">
                                {
                                  USER_MANAGEMENT_CAPTIONS.inviteModal
                                    .duplicateEmail
                                }
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
                className="border-gray-200 hover:bg-gray-50">
                {GLOBAL_CAPTIONS.actions.cancel}
              </Button>
              <Button
                onClick={sendInvitations}
                disabled={invites.length === 0 || isLoading}
                className="bg-black hover:bg-gray-800 text-white min-w-24">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {GLOBAL_CAPTIONS.actions.sending}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {USER_MANAGEMENT_CAPTIONS.inviteModal.sendInvites}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AtSign className="w-5 h-5 text-gray-600" />
                </div>
                Status of Invitations
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Please review the results of your user invitations below.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-gray-600 mb-4">
              {inviteResult && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-4 text-xs font-medium text-gray-700">
                          Email
                        </th>
                        <th className="text-center py-2 px-4 text-xs font-medium text-gray-700">
                          Stored in Database
                        </th>
                        <th className="text-center py-2 px-4 text-xs font-medium text-gray-700">
                          Invitation Email
                        </th>
                        <th className="text-center py-2 px-4 text-xs font-medium text-gray-700">
                          Already Exists
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inviteResult.results.map((result) => (
                        <tr
                          key={result.email}
                          className="border-b border-gray-100">
                          <td className="py-2 px-4 text-sm">{result.email}</td>
                          <td className="py-2 px-4 text-center">
                            {result.storedInDatabase ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {result.emailSent ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                            ) : result.alreadyExists ? (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                            )}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {result.alreadyExists ? (
                              <CheckCircle2 className="w-5 h-5 text-orange-600 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inviteResult.results.some((r) => r.errorMessage) && (
                    <div className="bg-red-50 border-t border-red-200 p-3">
                      <p className="text-xs font-medium text-red-800 mb-2">
                        Errors:
                      </p>
                      {inviteResult.results
                        .filter((r) => r.errorMessage)
                        .map((result) => (
                          <p
                            key={result.email}
                            className="text-xs text-red-700">
                            <strong>{result.email}:</strong>{" "}
                            {result.errorMessage}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="pt-6 flex gap-3">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onReloadData();
                }}
                className="bg-black hover:bg-gray-800 text-white mt-8">
                {GLOBAL_CAPTIONS.actions.done}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
