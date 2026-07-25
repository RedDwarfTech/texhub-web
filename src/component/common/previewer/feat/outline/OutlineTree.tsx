import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./OutlineTree.module.css";
import { getOutlineNodeKey } from "./outlineNavigation";

interface OutlineItem {
  title: string;
  dest?: any;
  items?: OutlineItem[];
}

interface OutlineTreeProps {
  outline: OutlineItem[];
  onItemClick: (dest: any) => void;
  activeNodeKey?: string;
  expandKeys?: string[];
}

const OutlineTree: React.FC<OutlineTreeProps> = ({
  outline,
  onItemClick,
  activeNodeKey,
  expandKeys = [],
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);
  const expandKeysToken = useMemo(() => expandKeys.join("\0"), [expandKeys]);

  useEffect(() => {
    if (expandKeys.length === 0) {
      return;
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const k of expandKeys) {
        next.add(k);
      }
      return next;
    });
  }, [expandKeys, expandKeysToken]);

  const isExpandedForKey = (key: string) =>
    expanded.has(key) || expandKeys.includes(key);

  useLayoutEffect(() => {
    if (!activeNodeKey) {
      return;
    }
    activeButtonRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [activeNodeKey, expandKeysToken]);

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpanded(newExpanded);
  };

  const renderOutlineItem = (
    item: OutlineItem,
    level: number = 0,
    parentKey: string = ""
  ) => {
    const key = getOutlineNodeKey(parentKey, item.title, level);
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = isExpandedForKey(key);
    const marginLeft = level == 0 ? 2 : 20;
    const isActive = activeNodeKey === key;

    return (
      <li key={key} className={styles.outlineItem} style={{ marginLeft: marginLeft }}>
        <div className={styles.outlineItemContainer}>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(key)}
              className={styles.expandButton}
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {!hasChildren && <span className={styles.placeholder}></span>}
          <button
            ref={isActive ? activeButtonRef : undefined}
            data-outline-key={key}
            onClick={() => onItemClick(item.dest)}
            className={
              isActive
                ? `${styles.titleButton} ${styles.titleButtonActive}`
                : styles.titleButton
            }
          >
            {item.title}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className={styles.nestedList}>
            {item.items!.map((subItem, index) =>
              renderOutlineItem(subItem, level + 1, key + index)
            )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className={styles.outlineTree}>
      {outline.map((item, index) => renderOutlineItem(item, 0, "root" + index))}
    </ul>
  );
};

export default OutlineTree;
