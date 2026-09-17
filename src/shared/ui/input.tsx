import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Label } from "./label"
import { ErrorMessage } from "./common/errors"

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  label?: React.ReactNode
  labelProps?: Omit<React.ComponentProps<typeof Label>, "children" | "htmlFor">
  required?: boolean
  error?: React.ReactNode
  hint?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    labelProps,
    required,
    error,
    hint,
    leftIcon,
    rightIcon,
    containerClassName,
    className,
    type = "text",
    id,
    ...rest
  },
  ref
) {
  const reactId = React.useId()
  const inputId = id ?? reactId

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", containerClassName)}>
      {label ? (
        <Label htmlFor={inputId} {...labelProps} className={cn("flex items-center gap-1", labelProps?.className)}>
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      <div
        className={cn(
          "group bg-card relative flex h-8 w-full items-center rounded-sm border transition-colors",
          error
            ? "border-destructive/70 focus-within:border-destructive"
            : "border-input focus-within:border-primary dark:focus-within:border-primary",
          rest.disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {leftIcon ? (
          <span className="text-muted-foreground pointer-events-none flex h-full items-center pl-2.5 [&>svg]:size-3.5">
            {leftIcon}
          </span>
        ) : null}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            "placeholder:text-muted-foreground/70 text-foreground h-full w-full flex-1 rounded-sm bg-transparent px-2.5 text-sm outline-none",
            type === "number" &&
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            leftIcon && "pl-1.5",
            rightIcon && "pr-1.5",
            className
          )}
        />
        {rightIcon ? (
          <span className="text-muted-foreground flex h-full items-center pr-2.5 [&>svg]:size-3.5">{rightIcon}</span>
        ) : null}
      </div>
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : hint ? (
        <p className="text-muted-foreground text-2xs">{hint}</p>
      ) : null}
    </div>
  )
})
