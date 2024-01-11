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
}
