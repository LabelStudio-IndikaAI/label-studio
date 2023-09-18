import React from 'react';
import { cn } from "../../../utils/bem";
import { Menu } from '../../Menu/Menu';
import './TopbarMenu.styl';

export const SidebarMenu = ({ children, menu, path, menuItems }) => {
  const rootClass = cn('topbar-menu');

  return (
    <div className={rootClass}>
      <div className={rootClass.elem('topbar')}>
        {/* Display menu items in the top bar */}
        {menuItems && menuItems.length > 1 ? (
          <Menu>
            {menuItems ? Menu.Builder(path, menuItems) : menu}
          </Menu>
        ) : null}
      </div>
      <div className={rootClass.elem('content')}>
        {children}
      </div>
    </div>
  );
};
