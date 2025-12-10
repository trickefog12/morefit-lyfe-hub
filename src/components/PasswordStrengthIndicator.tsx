import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { t } = useLanguage();

  const requirements: Requirement[] = useMemo(() => [
    { key: "length", label: t("password_min_length"), test: (p) => p.length >= 8 },
    { key: "uppercase", label: t("password_uppercase"), test: (p) => /[A-Z]/.test(p) },
    { key: "lowercase", label: t("password_lowercase"), test: (p) => /[a-z]/.test(p) },
    { key: "number", label: t("password_number"), test: (p) => /\d/.test(p) },
  ], [t]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    const passed = requirements.filter((req) => req.test(password)).length;
    
    if (passed <= 1) return { score: 1, label: t("password_weak"), color: "bg-destructive" };
    if (passed === 2) return { score: 2, label: t("password_fair"), color: "bg-orange-500" };
    if (passed === 3) return { score: 3, label: t("password_good"), color: "bg-yellow-500" };
    return { score: 4, label: t("password_strong"), color: "bg-green-500" };
  }, [password, requirements, t]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-200",
                level <= strength.score ? strength.color : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className={cn(
          "text-xs font-medium transition-colors",
          strength.score <= 1 && "text-destructive",
          strength.score === 2 && "text-orange-500",
          strength.score === 3 && "text-yellow-600",
          strength.score === 4 && "text-green-600"
        )}>
          {strength.label}
        </p>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li key={req.key} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={cn(
                "transition-colors",
                passed ? "text-green-600" : "text-muted-foreground"
              )}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
