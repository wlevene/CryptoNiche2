"use client";

import { Check, X } from "lucide-react";
import { PasswordValidation, getPasswordStrengthColor, getPasswordStrengthText } from "@/lib/password-validation";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  validation: PasswordValidation;
  password: string;
}

export function PasswordStrength({ validation, password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, rules, feedback } = validation;
  const strengthColor = getPasswordStrengthColor(score);
  const strengthText = getPasswordStrengthText(score);

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Password Strength:</span>
          <span className={cn(
            "font-medium",
            score <= 1 ? "text-red-600" : 
            score === 2 ? "text-orange-600" :
            score === 3 ? "text-yellow-600" : "text-green-600"
          )}>
            {strengthText}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                index < score ? strengthColor : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <RequirementItem
            met={rules.length}
            text="At least 8 characters"
          />
          <RequirementItem
            met={rules.lowercase}
            text="One lowercase letter (a-z)"
          />
          <RequirementItem
            met={rules.uppercase}
            text="One uppercase letter (A-Z)"
          />
          <RequirementItem
            met={rules.number}
            text="One number (0-9)"
          />
          <RequirementItem
            met={rules.special}
            text="One special character (!@#$...)"
            optional
          />
        </div>
      </div>
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
  optional?: boolean;
}

function RequirementItem({ met, text, optional = false }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center justify-center w-4 h-4 rounded-full text-xs",
        met ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
        "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      )}>
        {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className={cn(
        "text-sm",
        met ? "text-green-700 dark:text-green-300" : "text-muted-foreground",
        optional && "italic"
      )}>
        {text} {optional && "(recommended)"}
      </span>
    </div>
  );
}