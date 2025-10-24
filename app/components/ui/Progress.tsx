import styles from "./Progress.module.css";

interface ProgressProps {
  value: number; // 0-100
  showLabel?: boolean;
  variant?: "primary" | "success" | "warning";
}

export function Progress({
  value,
  showLabel = false,
  variant = "primary",
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${styles[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.progressLabel}>
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
