declare namespace MYAPI {
  type createUser = {
    username: string;
    name: string;
    role?: string[];
  };
  type createPermissionParams = {
    sub: string | null;
    obj: string;
    act: string[];
  };

  type result = {
    success?: boolean;
    data?: Record<string, any>;
    statusCode?: number;
    message?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
  };
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
    menuInfo?: Omit<MenuDataItem, 'routes'> & {
      children?: Route[];
    };
  };
}
