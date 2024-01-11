// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function login(body: MYAPI.LoginParams, options?: { [key: string]: any }) {
  return request<MYAPI.result>('/api/v1/login', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/v1/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}
