// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function createPermission(
  params: MYAPI.createPermissionParams,
  options?: { [key: string]: any },
) {
  return request<MYAPI.result>('/api/v1/createPermission', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}
