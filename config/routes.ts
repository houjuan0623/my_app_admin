export default [
  // 必有项
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  // 必有项
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    // component: './Admin',
    routes: [
      {
        path: '/admin/user-management',
        name: 'user-management',
        component: './SysManagement/UserManagement',
      },
      {
        path: '/admin/role-management',
        name: 'role-management',
        component: './Admin',
      },
      {
        path: '/admin/permission-management',
        name: 'permission-management',
        component: './SysManagement/PermissionManagement',
      },
      {
        component: './404',
      },
    ],
  },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './TableList',
  // },
  {
    name: 'list.school-list',
    icon: 'table',
    path: '/listSchool',
    component: './SchoolList',
  },
  // 必有项
  {
    path: '/',
    redirect: '/welcome',
  },
  // 必有项，而且必须放在数组的最后一项
  {
    component: './404',
  },
];
