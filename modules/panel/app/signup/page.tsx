import { SignupForm } from "@/components/signup-form";
import Logo from "@/components/logo";

export default function SignupPage() {
  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, #f8fbff 0%, #f4f0ec 28%, #f4eae7 66%, #f4e8ec 100%)",
        color: "black",
        display: "flex",
      }}
      className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Logo />
          </div>
          Au5.ai
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
