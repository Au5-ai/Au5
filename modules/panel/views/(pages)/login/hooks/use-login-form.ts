import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogin } from "@/shared/hooks/use-auth";
import { ROUTES } from "@/shared/routes";
import { loginCaptions } from "../i18n";

export function useLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          toast.success(loginCaptions.successLogin);
          router.push(ROUTES.PLAYGROUND);
        },
      },
    );
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  return {
    username,
    setUsername,
    password,
    handlePasswordChange,
    handleSubmit,
    isPending: loginMutation.isPending,
  };
}
