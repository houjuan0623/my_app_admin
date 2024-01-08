import React, { useState } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ProTable,
  TableDropdown,
  ModalForm,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message, Modal } from 'antd';
import { useRef } from 'react';
import request from 'umi-request';
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

type SchoolItem = {
  name: string;
  _id: string;
  __v?: number;
  classIds?: string[];
};

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm<{ name: string; company: string }>();
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<SchoolItem | null>(null);

  // 显示模态框的函数
  const showModal = (school: SchoolItem) => {
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
    console.log('121231213');
    return { _id: '121', name: '112312' };
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <ProTable<SchoolItem>
        columns={[
          {
            title: '学校',
            dataIndex: 'name',
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
          // {
          //   title: '创建时间',
          //   key: 'showTime',
          //   dataIndex: 'created_at',
          //   valueType: 'date',
          //   sorter: true,
          //   hideInSearch: true,
          // },
          // {
          //   title: '创建时间',
          //   dataIndex: 'created_at',
          //   valueType: 'dateRange',
          //   hideInTable: true,
          //   search: {
          //     transform: (value) => {
          //       return {
          //         startTime: value[0],
          //         endTime: value[1],
          //       };
          //     },
          //   },
          // },
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
            data: SchoolItem[];
          }>('http://172.16.17.206:4000/api/v1/getSchools');
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
            title="新建学校"
            trigger={
              <Button type="primary">
                <PlusOutlined />
                新建学校
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
