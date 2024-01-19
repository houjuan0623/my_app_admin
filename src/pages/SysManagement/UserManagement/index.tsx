import React, { useState, useEffect } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTable, ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, message, Modal, Tag } from 'antd';
import { useRef } from 'react';
import request from 'umi-request';

import type { roleItem } from '../definition';

export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

type UserItem = {
  _id: string;
  username: string;
  name?: string;
  roles: [];
  createdAt: Date;
  __v?: number;
};

type RoleEnum = Record<string, { text: string }>;

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm<{ name: string; company: string }>();
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<UserItem | null>(null);
  // 记录格式化后适用于protable中多选的的数据
  const [rolesEnum, setRolesEnum] = useState({});

  // 向后端发起请求，请求所有的角色
  useEffect(() => {
    const loadRolesData = async () => {
      try {
        const response = await request('http://172.16.17.88:4000/api/v1/getRoles');
        if (response.success && response.data) {
          const newRolesEnum = response.data.reduce((acc: RoleEnum, role: roleItem) => {
            acc[role._id] = { text: role.name };
            return acc;
          }, {});
          setRolesEnum(newRolesEnum);
        } else {
          // 处理响应失败的情况
          console.error('加载角色数据失败：', response.message);
          message.error('加载角色数据失败');
        }
      } catch (error) {
        // 捕获到请求错误
        console.error('请求角色数据出错：', error);
        message.error('请求角色数据出错，可刷新界面尝试重新加载');
      }
    };
    loadRolesData();
  }, []);

  // 显示模态框的函数
  const showModal = (school: UserItem) => {
    setCurrentSchool(school);
    setIsModalVisible(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleBatchDelete = () => {
    console.log('批量删除的ID: ', selectedRowKeys);
    // 这里可以添加删除逻辑
  };

  const updateSchool = async () => {
    return { _id: '121', name: '112312' };
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const valueEnum = {
    all: { text: '全部' },
    running: { text: '运行中' },
    online: { text: '已上线' },
    异常: { text: '异常' },
  };

  return (
    <>
      <ProTable<UserItem>
        columns={[
          {
            title: '用户名',
            dataIndex: 'username',
            copyable: true,
            ellipsis: true,
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '此项为必填项',
                },
              ],
            },
          },
          {
            title: '姓名',
            dataIndex: 'name',
            render: (_, record) => record.name || '暂未设置姓名',
            copyable: true,
            ellipsis: true,
          },
          {
            title: '角色',
            dataIndex: 'roles',
            valueType: 'checkbox',
            initialValue: ['all'],
            render: (_, record) =>
              record.roles && record.roles.length > 0
                ? record.roles.map((role) => (
                    <Tag color="blue" key={role}>
                      {role}
                    </Tag>
                  ))
                : '暂未配置角色',
            valueEnum: rolesEnum,
            hideInSearch: true,
          },
          {
            title: '创建时间',
            key: 'showTime',
            dataIndex: 'createdAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
          },
          {
            title: '创建时间',
            dataIndex: 'created_at',
            valueType: 'dateRange',
            hideInTable: true,
            search: {
              transform: (value) => {
                return {
                  startTime: value[0],
                  endTime: value[1],
                };
              },
            },
          },
          {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
              <a
                key="editable"
                onClick={() => {
                  action?.startEditable?.(record._id);
                }}
              >
                编辑
              </a>,
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showModal(record);
                }}
                key="view"
              >
                查看
              </a>,
            ],
          },
        ]}
        rowSelection={rowSelection}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          console.log(params, sort, filter);
          await waitTime(2000);
          return request<{
            data: UserItem[];
          }>('http://172.16.17.88:4000/api/v1/getUsers');
        }}
        editable={{
          type: 'multiple',
          onSave: () => {
            return updateSchool();
          },
        }}
        columnsState={{
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
          onChange(value) {
            console.log('value: ', value);
          },
        }}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          pageSize: 15,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="学校列表"
        toolBarRender={() => [
          // eslint-disable-next-line react/jsx-key
          <ModalForm
            form={form}
            title="新建用户"
            trigger={
              <Button type="primary">
                <PlusOutlined />
                新建用户
              </Button>
            }
            autoFocusFirstInput
            modalProps={{
              destroyOnClose: true,
              onCancel: () => console.log('run'),
            }}
            submitTimeout={2000}
            onFinish={async (values) => {
              await waitTime(2000);
              console.log(values.name);
              message.success('提交成功');
              return true;
            }}
          >
            <ProFormText
              rules={[
                {
                  required: true,
                },
              ]}
              name="id"
              label="学校名称"
            />
          </ModalForm>,
          <Button
            key="button"
            icon={<MinusOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            type="primary"
          >
            批量删除
          </Button>,
        ]}
      />
      <Modal
        title="学校详情"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        {currentSchool && (
          <div>
            <p>学校名称: {currentSchool.name}</p>
            <p>ID: {currentSchool._id}</p>
            {/* 其他信息 */}
          </div>
        )}
      </Modal>
    </>
  );
};
