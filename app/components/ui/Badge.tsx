import styles from "./Badge.module.css";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "info" | "default";
  size?: "sm" | "md" | "lg";
}

export function Badge({
  children,
  variant = "default",
  size = "md",
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  );
}
