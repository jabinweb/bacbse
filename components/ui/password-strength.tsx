import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (password: string) => {
    let score = 0;
    if (!password) return score;

    // Award points for length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Award points for complexity
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = getStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-full rounded-full transition-all duration-300",
              {
                "bg-red-500": strength >= 1 && index === 1,
                "bg-orange-500": strength >= 2 && index === 2,
                "bg-yellow-500": strength >= 3 && index === 3,
                "bg-lime-500": strength >= 4 && index === 4,
                "bg-green-500": strength >= 5 && index === 5,
                "bg-gray-200 dark:bg-gray-700": strength < index,
              }
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {strength === 0 && "Enter a password"}
        {strength === 1 && "Too weak"}
        {strength === 2 && "Could be stronger"}
        {strength === 3 && "Getting better"}
        {strength === 4 && "Strong password"}
        {strength === 5 && "Very strong password"}
      </p>
    </div>
  );
}