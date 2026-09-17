import React from "react"
import { motion } from "motion/react"
import { cn } from "@/shared/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

/**
 * Page props
 * @description Props for the Page component
 * @param as - The component to render
 * @param children - The children to render
 * @param className - The class name to apply
 */
export type PageProps<C extends React.ElementType> = {
  as?: C
  children: React.ReactNode
  /* Animated flag */
  animated?: boolean
  /* Padding flags */
  pt?: boolean
  pb?: boolean
  pl?: boolean
  pr?: boolean
  /* Gap flags */
  gapY?: boolean
  /* Classnames */
  className?: string
  animContainerClassName?: string
} & React.ComponentPropsWithoutRef<C>

/**
 * Page component
 * @description Shared layout for pages
 * Provides a consistent layout for pages
 */

export function Page<C extends React.ElementType = "section">({
  as,
  animated = true,
  pt = true,
  pb = true,
  pl = true,
  pr = true,
  gapY = true,
  className,
  animContainerClassName: animContainerClassNameProp,
  ...props
}: PageProps<C>) {
  const Component = as || "section"

  const containerClassName = cn(
    "flex min-h-0 flex-1 flex-col",
    "h-full",
    pl ? "pl-6" : "",
    pr ? "pr-6" : "",
    pt ? "pt-6" : "",
    pb ? "pb-6" : "",
    gapY && "space-y-6",
    className
  )

  const animContainerClassName = cn("min-h-available-screen w-full flex flex-col min-h-0", animContainerClassNameProp)

  const componentProps = { ...props, className: containerClassName }
  const Comp = Component as React.ComponentType<React.ComponentPropsWithoutRef<C>>

  if (!animated) return <Comp {...(componentProps as React.ComponentPropsWithoutRef<C>)} />

  return (
    <motion.section variants={containerVariants} initial="hidden" animate="visible" className={animContainerClassName}>
      <Comp {...(componentProps as React.ComponentPropsWithoutRef<C>)} />
    </motion.section>
  )
}
