"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <Button
      variant="outline"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
