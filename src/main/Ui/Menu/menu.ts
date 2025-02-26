import { app, BrowserWindow, KeyboardEvent, MenuItemConstructorOptions, Menu } from "electron";

import { getMenuTemplate } from "./menuItems";
import { handleUrl } from "Utils/Main";
import { stringOfActionMenuItemName, assertNever } from "Utils/Common";

export const handlePluginMenuAction = (
  // item: Menu.PluginMenuItem,
  item: Menu.PluginMenuItem,
  window: BrowserWindow | undefined,
  event: KeyboardEvent,
): void => {
  if (item && item.pluginMenuAction && window) {
    if (item.pluginMenuAction.type === "manage") {
      handleUrl("/my_plugins");
      return;
    }

    app.emit("handlePluginMenuAction", item.pluginMenuAction);
  }
};

// Menu.PluginMenuItem
export const electronOfPluginMenuItem = (input: Menu.MenuItem): any | undefined => {
  switch (input.type) {
    case "run-menu-action": {
      const label = stringOfActionMenuItemName(input.name);
      return {
        type: "normal",
        label,
        click: handlePluginMenuAction,
        enabled: !input.disabled,
        visible: input.visible,
        pluginMenuAction: input.menuAction,
      };
    }
    case "separator": {
      return {
        type: "separator",
      };
    }
    case "submenu": {
      return {
        type: "submenu",
        label: input.name,
        submenu: input.submenu.map(electronOfPluginMenuItem),
      };
    }
    default: {
      assertNever(input);
    }
  }

  return undefined;
};

export const setMenuFromTemplate = (
  pluginMenuData: Menu.MenuItem[],
  template?: MenuItemConstructorOptions[],
): Menu => {
  let mainMenu: Menu;

  const pluginMenuItems =
    pluginMenuData.length === 0 ? undefined : pluginMenuData.map(electronOfPluginMenuItem);

  if (template) {
    mainMenu = Menu.buildFromTemplate(template as MenuItemConstructorOptions[]);
  } else {
    mainMenu = Menu.buildFromTemplate(
      getMenuTemplate(pluginMenuItems) as MenuItemConstructorOptions[],
    );
  }

  Menu.setApplicationMenu(mainMenu);

  return mainMenu;
};

export const buildActionToMenuItemMap = (menu: Menu) => {
  const map: any = {};
  const parseMenu = (menu: any) => {
    for (const item of menu.items) {
      if (item.action) {
        map[item.action] = item;
      }
      if (item.submenu) {
        parseMenu(item.submenu);
      }
    }
  };

  parseMenu(menu);
  return map;
};
