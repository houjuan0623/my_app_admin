// RootNode.tsx
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Router } from 'react-router-dom';
import type { IRoute } from 'umi';
import { history, useModel } from 'umi';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { renderRoutes } from '@umijs/renderer-react';
import dynamicRoutesToUsableRoutes from './utils/dynamicRoutesToUsableRoutes';
import filterStaticRoutes from './utils/filterStaticRoutes';
import { getMenuData } from '@ant-design/pro-components';
import type { CustomMenuDataItem } from '@/utils/dynamicRoutesToUsableRoutes';
import type { CustomRoutes } from '@/utils/filterStaticRoutes';
import { dynamic } from 'umi';

interface RootNodePorps {
  routes: MenuDataItem[];
}

const RootNode: FC<RootNodePorps> = (props) => {
  console.dir(props);
  // @ts-ignore
  const plugin = props.children.props.plugin; // 这里是获取 renderRoutes 中所需要的plugin参数
  // const routes = props.routes;
  // 获取保存的用户信息
  const { initialState } = useModel('@@initialState');

  // renderRoutes 中的routes参数
  const [routes, setRoutes] = useState<IRoute[]>(props.routes);

  useEffect(() => {
    // 获取后端的菜单
    const menuInfo = initialState?.currentUser?.menuInfo as CustomMenuDataItem[];

    // 获取当前的菜单，这是配置文件中的routes生成的，
    const dymnaicRoutes = props.routes;
    // 记录404路由，404一般是兜底路由，所以采用这种方式在静态路由中获取，这里children是一定存在的
    const routerOf404 = props.routes[1]?.children[props.routes[1]?.children.length - 1];
    // 配置文件中的routes作为默认权限的路由，任何角色都可以访问
    const staticRoutes = props.routes[1].children as CustomRoutes[];
    // 提取staticRoutes中有用的路由数据，供生成menuData使用
    const filteredStaticRoutes = filterStaticRoutes(staticRoutes);
    console.log('filteredStaticRoutes is: ', filteredStaticRoutes);
    // 合并静态的（从routes.ts中读取的，默认的权限）和动态的（后端返回）路由数据
    const aaa = filteredStaticRoutes.concat(menuInfo);
    // 获取通过menuino生成的路由信息
    const menuData = getMenuData(aaa).menuData as CustomMenuDataItem[];
    const result = dynamicRoutesToUsableRoutes(menuData);
    dymnaicRoutes[1].routes = result;
    dymnaicRoutes[1].children = result;
    // add 404 路由
    dymnaicRoutes[1].children.forEach((dynamicRoute) => {
      if (dynamicRoute?.children) {
        dynamicRoute.children.push(routerOf404);
        dynamicRoute.routes.push(routerOf404);
      }
    });
    dymnaicRoutes[1].children.push(routerOf404);
    console.log('1111111111111111111111111111');
    console.log(dymnaicRoutes);
    setRoutes(dymnaicRoutes);
  }, [initialState?.currentUser?.menuInfo]);

  return <Router history={history}>{renderRoutes({ routes, plugin })}</Router>;
};

export default RootNode;
