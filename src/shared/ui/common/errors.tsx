export function ErrorMessage({ children, ...prop }: React.ComponentProps<"p">) {
  return children ? (
    <p
      {...prop}
      className={`text-destructive text-2xs w-full truncate overflow-hidden px-2 leading-none font-medium ${prop?.className ?? ""}`}
    >
      {children}
    </p>
  ) : null
}
