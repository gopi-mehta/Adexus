import { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outlined" | "elevated";
}

export function Card({
  children,
  onClick,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className} ${
        onClick ? styles.clickable : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.cardBody} ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
}
