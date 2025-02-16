import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import type { DocNavigationItem } from '../types/documentation.types';

interface DocNavigationProps {
  items: DocNavigationItem[];
  currentPath?: string;
}

export const DocNavigation: React.FC<DocNavigationProps> = ({
  items,
  currentPath,
}) => {
  const renderItems = (items: DocNavigationItem[]) => {
    return items.map(item => (
      <li key={item.id}>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          {item.title}
          {item.children && <Icon name="chevron-right" />}
        </NavLink>
        {item.children && (
          <ul className="nav-children">
            {renderItems(item.children)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <nav className="doc-navigation">
      <ul className="nav-list">
        {renderItems(items)}
      </ul>
    </nav>
  );
}; 