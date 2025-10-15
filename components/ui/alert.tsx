import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string
  description: string
  onAction?: () => void
  onCancel?: () => void
  actionLabel?: string
  cancelLabel?: string
}

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Alert({
  variant,
  title,
  description,
  onAction,
  onCancel,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
}: AlertProps) {
  const Icon = variant === 'destructive' ? XCircle : variant === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <div className={alertVariants({ variant })}>
      <Icon className="h-4 w-4" />
      <div className="space-y-2">
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed">
          {description}
        </div>
        {(onAction || onCancel) && (
          <div className="mt-4 flex gap-2">
            {onAction && (
              <button 
                onClick={onAction}
                className={`px-3 py-1 text-sm rounded-md ${
                  variant === 'destructive' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {actionLabel}
              </button>
            )}
            {onCancel && (
              <button 
                onClick={onCancel}
                className="px-3 py-1 text-sm border rounded-md hover:bg-accent"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
