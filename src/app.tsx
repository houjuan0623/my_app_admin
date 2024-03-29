import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/my-app';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import { message } from 'antd';
import RootNode from '@/RootNode';
import { createElement } from 'react';
import type { ReactNode } from 'react';

import type { RequestConfig } from 'umi';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: MYAPI.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    // links: isDev
    //   ? [
    //       <Link to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //       <Link to="/~docs">
    //         <BookOutlined />
    //         <span>业务组件文档</span>
    //       </Link>,
    //     ]
    //   : [],
    // 注释掉links，重写links
    links: [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

// 页面创建，动态渲染路由
export function rootContainer(container: ReactNode) {
  return createElement(RootNode, null, container);
}

/** 请求拦截 */
const requestInterceptor = (url: any, options: any): any => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    // TODO: 这里还需要重新修改登录的过程
    // Authorization: `Bearer XXXXXXXXX`,
  };
  return {
    url: url,
    options: { ...options, headers: headers },
  };
};

const codeMessage = {
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
  429: '请求速率限制，请稍后重试',
};

export const request: RequestConfig = {
  timeout: 5000,
  errorConfig: {
    adaptor: (res: { statusCode: number; message: string; success: boolean; data?: object }) => {
      if (typeof res === 'object') {
        return {
          ...res,
          success: res.success,
          errorMessage: res.message,
        };
      } else {
        // 后端没有响应res
        return {
          success: false,
          errorMessage: res,
        };
      }
    },
  },
  middlewares: [],
  credentials: 'include',
  requestInterceptors: [requestInterceptor],
  responseInterceptors: [
    async (response) => {
      if (!response) {
        message.error('没有获取到响应，请重试');
      }
      if (response && response.status) {
        if (codeMessage[response.status]) {
          const errorText = codeMessage[response.status] || response.statusText;
          const { status, url } = response;
          message.error(`请求错误 ${status}: ${url}，详情：${errorText}`);
        }
      }
      return response;
    },
  ],
};
