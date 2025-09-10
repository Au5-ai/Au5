import React, { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User as UserIcon, Save, X, Crown, User } from "lucide-react";

export default function EditModal({ user, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "user",
    isValid: true,
    pictureUrl: "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "user",
        isValid: user.isValid !== undefined ? user.isValid : true,
        pictureUrl: user.pictureUrl || "",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-gray-200">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            Edit User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border border-gray-200">
              <AvatarImage src={formData.pictureUrl} alt={formData.full_name} />
              <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-lg">
                {formData.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label
                htmlFor="pictureUrl"
                className="text-sm font-medium text-gray-700"
              >
                Profile Picture URL
              </Label>
              <Input
                id="pictureUrl"
                value={formData.pictureUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pictureUrl: e.target.value,
                  }))
                }
                placeholder="https://example.com/avatar.jpg"
                className="mt-1 border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label
                htmlFor="full_name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                required
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-200">
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span>Administrator</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Account Status
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.isValid
                    ? "Account is active"
                    : "Account is disabled"}
                </p>
              </div>
              <Switch
                checked={formData.isValid}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isValid: checked }))
                }
                className="data-[state=checked]:bg-black"
              />
            </div>
          </div>

          <DialogFooter className="pt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
