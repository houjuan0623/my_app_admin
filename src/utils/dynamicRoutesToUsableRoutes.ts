import * as icons from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { dynamic } from 'umi';
import { createElement } from 'react';

const Component = {
  /** 欢迎页面 */
  welcome: dynamic(() => import('@/pages/Welcome')),
  'list.table-list': dynamic(() => import('@/pages/TableList')),
  'user-management': dynamic(() => import('@/pages/SysManagement/UserManagement')),
  'role-management': dynamic(() => import('@/pages/Admin')),
  'permission-management': dynamic(() => import('@/pages/SysManagement/PermissionManagement')),
  'list.school-list': dynamic(() => import('@/pages/SchoolList')),
  '404': dynamic(() => import('@/pages/404')),
  login: dynamic(() => import('@/pages/user/Login')),
};

export type CustomMenuDataItem = Omit<MenuDataItem, 'icon'> & { icon?: string };

export default function dynamicRoutesToUsableRoutes(routes: CustomMenuDataItem[]): MenuDataItem[] {
  return routes.map((route) => {
    // route 是后端返回的数据
    // item 是最终antd-pro需要数据
    const item: MenuDataItem = {
      ...route,
    };

    // icon 匹配
    if (route?.icon) {
      item.icon = createElement(icons[route.icon]);
    }

    // 组件匹配, 因为后端菜单配置的时候只会返回当前菜单对应的组件标识，所以通过组件标识来匹配组件
    // 当name存在且不为父级菜单的时候才匹配指定的组件
    if (route?.name && !route.children) {
      item.component = Component[route.name || ''];
    }

    if (route?.redirect) {
      item.redirect = route.redirect;
    }

    // 子路由 处理
    if (route.children && route.children.length > 0) {
      item.routes = [
        // 如果有子路由那么肯定是要进行重定向的，重定向为第一个组件
        { path: item?.path, redirect: route.children[0]?.path, exact: true },
        ...dynamicRoutesToUsableRoutes(route.children),
      ];
      item.children = [
        { path: item.path, redirect: route.children[0].path, exact: true },
        ...dynamicRoutesToUsableRoutes(route.children),
      ];
    }
    return item;
  });
}
