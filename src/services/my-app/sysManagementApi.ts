// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

//////permission
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

//////resource
export async function createResource(
  params: MYAPI.createResource,
  options?: { [key: string]: any },
) {
  return request<MYAPI.result>('/api/v1/createResource', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function updateResourceAPI(
  params: MYAPI.updateResource,
  options?: { [key: string]: any },
) {
  return request<MYAPI.result>('/api/v1/updateResource', {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

export async function getResource(options?: { [key: string]: any }) {
  return request<MYAPI.result>('/api/v1/getResource', {
    method: 'GET',
    ...(options || {}),
  });
}
