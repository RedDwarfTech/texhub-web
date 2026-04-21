import React, { useState } from 'react';
import styles from './OutlineTree.module.css';

interface OutlineItem {
  title: string;
  dest?: any;
  items?: OutlineItem[];
}

interface OutlineTreeProps {
  outline: OutlineItem[];
  onItemClick: (dest: any) => void;
}

const OutlineTree: React.FC<OutlineTreeProps> = ({ outline, onItemClick }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpanded(newExpanded);
  };

  const renderOutlineItem = (item: OutlineItem, level: number = 0, parentKey: string = '') => {
    const key = parentKey + item.title + level;
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expanded.has(key);
    const marginLeft = level == 0 ? 2 : 20;

    return (
      <li key={key} className={styles.outlineItem} style={{ marginLeft: marginLeft }}>
        <div className={styles.outlineItemContainer}>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(key)}
              className={styles.expandButton}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className={styles.placeholder}></span>}
          <button
            onClick={() => onItemClick(item.dest)}
            className={styles.titleButton}
          >
            {item.title}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className={styles.nestedList}>
            {item.items!.map((subItem, index) => renderOutlineItem(subItem, level + 1, key + index))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul className={styles.outlineTree}>
      {outline.map((item, index) => renderOutlineItem(item, 0, 'root' + index))}
    </ul>
  );
};

export default OutlineTree;