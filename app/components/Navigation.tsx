"use client";
import { useState } from "react";
import styles from "./Navigation.module.css";

interface NavigationProps {
  activeTab: "campaigns" | "rewards" | "creator";
  onTabChange: (tab: "campaigns" | "rewards" | "creator") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.navItem} ${
          activeTab === "campaigns" ? styles.active : ""
        }`}
        onClick={() => onTabChange("campaigns")}
      >
        <span className={styles.icon}>🎯</span>
        <span className={styles.label}>Campaigns</span>
      </button>
      <button
        className={`${styles.navItem} ${
          activeTab === "rewards" ? styles.active : ""
        }`}
        onClick={() => onTabChange("rewards")}
      >
        <span className={styles.icon}>💰</span>
        <span className={styles.label}>Rewards</span>
      </button>
      <button
        className={`${styles.navItem} ${
          activeTab === "creator" ? styles.active : ""
        }`}
        onClick={() => onTabChange("creator")}
      >
        <span className={styles.icon}>🏢</span>
        <span className={styles.label}>Creator</span>
      </button>
    </nav>
  );
}

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: "all", label: "All", icon: "📋" },
    { id: "video", label: "Videos", icon: "🎥" },
    { id: "survey", label: "Surveys", icon: "📊" },
    { id: "share", label: "Share", icon: "📢" },
    { id: "quiz", label: "Quizzes", icon: "❓" },
  ];

  return (
    <div className={styles.filterBar}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`${styles.filterBtn} ${
            activeFilter === filter.id ? styles.activeFilter : ""
          }`}
          onClick={() => onFilterChange(filter.id)}
        >
          <span className={styles.filterIcon}>{filter.icon}</span>
          <span className={styles.filterLabel}>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
