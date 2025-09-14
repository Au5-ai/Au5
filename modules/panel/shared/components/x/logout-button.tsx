"use client";

import { Button } from "@/shared/components/ui/button";
import { useLogout } from "@/shared/hooks/use-auth";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
