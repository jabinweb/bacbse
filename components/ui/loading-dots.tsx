export function LoadingDots({ className = "" }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 bg-foreground/60 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
