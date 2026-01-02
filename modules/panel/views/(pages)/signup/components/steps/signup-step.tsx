import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { GLOBAL_CAPTIONS } from "@/shared/i18n/captions";
import { CAPTIONS } from "../../i18n";
import { useSignupForm } from "../../hooks";

export function SignupStep() {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } =
    useSignupForm();

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold mb-2">{CAPTIONS.signupTitle}</h2>
        <p className="text-muted-foreground mb-6">
          {CAPTIONS.signupDescription}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="organizationName">
                {GLOBAL_CAPTIONS.fields.organizationName.label}
              </Label>
              <Input
                id="organizationName"
                type="text"
                placeholder={
                  GLOBAL_CAPTIONS.fields.organizationName.placeholder
                }
                value={formData.organizationName}
                onChange={(e) =>
                  handleInputChange("organizationName", e.target.value)
                }
                className={errors.organizationName ? "border-red-500" : ""}
                required
              />
              {errors.organizationName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.organizationName}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                {GLOBAL_CAPTIONS.fields.email.label}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={GLOBAL_CAPTIONS.fields.email.placeholder}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {GLOBAL_CAPTIONS.fields.email.hint}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullname">
                {GLOBAL_CAPTIONS.fields.fullname.label}
              </Label>
              <Input
                id="fullname"
                type="text"
                placeholder="Enter first and last name"
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                className={errors.fullname ? "border-red-500" : ""}
                required
              />
              {errors.fullname && (
                <p className="text-sm text-red-500 mt-1">{errors.fullname}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                {GLOBAL_CAPTIONS.fields.password.label}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={GLOBAL_CAPTIONS.fields.password.placeholder}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {GLOBAL_CAPTIONS.fields.password.hint}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">
                {GLOBAL_CAPTIONS.fields.confirmPassword.label}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={GLOBAL_CAPTIONS.fields.confirmPassword.placeholder}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={errors.confirmPassword ? "border-red-500" : ""}
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}>
              {isSubmitting
                ? GLOBAL_CAPTIONS.pages.signup.form.submittingButton
                : GLOBAL_CAPTIONS.pages.signup.form.submitButton}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
