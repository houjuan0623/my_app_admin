import type { CustomMenuDataItem } from './dynamicRoutesToUsableRoutes';

export type CustomRoutes = CustomMenuDataItem & {
  exact?: boolean;
  redirect?: string;
  children?: CustomRoutes[];
};

function simplifyRoutes(routes: CustomRoutes[]): CustomRoutes[] {
  return routes.map((obj) => {
    const simplifiedObj: CustomRoutes = { icon: 'TableOutlined' };

    if ('layout' in obj) {
      simplifiedObj.layout = obj.layout;
    }
    if ('path' in obj) {
      simplifiedObj.path = obj.path;
    }
    if ('name' in obj) {
      simplifiedObj.name = obj.name;
    }
    if ('exact' in obj) {
      simplifiedObj.exact = obj.exact;
    }
    if ('redirect' in obj) {
      simplifiedObj.redirect = obj.redirect;
    }
    if ('children' in obj && obj.children) {
      simplifiedObj.children = simplifyRoutes(obj.children);
    }
    return simplifiedObj;
  });
}

export default function filterStaticRoutes(routes: CustomRoutes[]): CustomRoutes[] {
  return simplifyRoutes(routes);
}
