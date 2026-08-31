import React from "react";
import { EmptyState as UiEmptyState } from "@fiance/ui/components";
import type { ComponentProps } from "react";
import { theme as GP } from "@/lib/theme";

type EmptyStateProps = ComponentProps<typeof UiEmptyState>;

export function EmptyState({
  iconBgClassName = "bg-accent-clay-soft",
  iconColor = GP.clay,
  ...props
}: EmptyStateProps) {
  return (
    <UiEmptyState iconBgClassName={iconBgClassName} iconColor={iconColor} {...props} />
  );
}
