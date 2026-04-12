import React, { useState } from 'react';

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

  const renderItem = (item: OutlineItem, level: number = 0, parentKey: string = '') => {
    const key = parentKey + item.title + level;
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expanded.has(key);

    return (
      <li key={key} style={{ marginLeft: level * 20, listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '5px',
                fontSize: '12px'
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span style={{ width: '17px' }}></span>}
          <button
            onClick={() => onItemClick(item.dest)}
            style={{
              background: 'none',
              border: 'none',
              color: 'blue',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '2px 0',
              textDecoration: 'underline'
            }}
          >
            {item.title}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul style={{ padding: 0, margin: 0 }}>
            {item.items!.map((subItem, index) => renderItem(subItem, level + 1, key + index))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul style={{ listStyle: 'none', padding: '10px', margin: 0 }}>
      {outline.map((item, index) => renderItem(item, 0, 'root' + index))}
    </ul>
  );
};

export default OutlineTree;