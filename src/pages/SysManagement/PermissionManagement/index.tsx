import { useState, useEffect } from 'react';
import { Tree, message, Button, Form } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { PlusOutlined } from '@ant-design/icons';
import {
  ProCard,
  ModalForm,
  ProFormRadio,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import request from 'umi-request';

import type { roleItem } from '../definition';
import { createPermission } from '../../../services/my-app';

export default () => {
  const [form] = Form.useForm<{ name: string; radioButton: string[]; checkbox: string[] }>();
  // 记录树形roleData
  const [roleData, setRoleData] = useState<DataNode[]>([]);
  // 利用一个加载状态来控制树组件的渲染。防止角色列表树组件已经加载成功，但是数据还没有返回
  const [isRoleTreeLoading, setIsRoleTreeLoading] = useState(true);
  // 利用一个加载状态来控制树组件的渲染。防止权限列表组件树已经加载成功，但是数据还没有返回
  const [isPermissionTreeLoading, setIsPermissionTreeLoading] = useState(true);
  const [isRoute, setIsRoute] = useState(false); // 追踪 radio 的选中值
  // 记录左侧角色列表中选中的是父节点还是叶节点
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const treeData: DataNode[] = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: <span style={{ color: '#1890ff' }}>sss</span>, key: '0-0-1-0' }],
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      setIsRoleTreeLoading(true); // 开始加载时设置为 true
      try {
        const response = await request('http://172.16.17.88:4000/api/v1/getRoles');
        if (response.statusCode === 200 && response.success) {
          // 构建树形数据结构
          const rolesData: DataNode[] = [
            {
              title: '角色列表',
              key: 'roleList', // 设置父节点的 key
              children: response.data.map((role: roleItem) => ({
                title: role.name,
                key: role._id,
                // 根据需要设置 icon
              })),
            },
          ];
          setRoleData(rolesData);
        } else {
          // 处理非成功状态的响应
          console.error('加载角色数据失败：', response.message);
          message.error('加载角色数据失败');
        }
      } catch (error) {
        // 捕获到请求错误
        console.error('请求角色数据出错：', error);
        message.error('请求角色数据出错');
      }
      setIsRoleTreeLoading(false); // 加载完成后设置为 false
    };

    fetchRoles();
  }, []);

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const key = selectedKeys.length > 0 ? selectedKeys[0] : null;
    console.log('selectedKeys is: ', selectedKeys);
    console.log('key is: ', key);
    setSelectedKey(key as string);
  };

  const renderRightSideContent = () => {
    if (selectedKey === 'roleList') {
      return '您正在点击的是角色分类节点，请点击角色节点以显示权限。';
    } else if (selectedKey) {
      return <Tree defaultExpandAll treeData={treeData} />;
    } else {
      return '请从左侧选择一个角色以显示权限。';
    }
  };

  // 当 radio 的值变化时触发的函数
  const onFormValuesChange = (changedValues: any) => {
    if ('radioButton' in changedValues) {
      const isRouteSelected = changedValues.radioButton === '路由';
      setIsRoute(isRouteSelected);
      // 如果选择了 '路由'，则清除所有 checkbox 的选中状态
      if (isRouteSelected) {
        form.setFieldsValue({
          checkbox: ['find'], // 只选中 '查看'，其他都不选中
        });
      } else {
        // 如果选择了 '按钮'，也清除所有 checkbox 的选中状态
        form.setFieldsValue({
          checkbox: [],
        });
      }
    }
  };

  const renderModalForm = () => {
    return (
      <ModalForm
        title="新建权限"
        trigger={
          <Button type="primary">
            <PlusOutlined />
            新建权限
          </Button>
        }
        form={form}
        onValuesChange={onFormValuesChange} // 添加此行来监听表单值的变化
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          const payload = {
            sub: selectedKey === 'roleList' ? null : selectedKey,
            obj: values.name,
            act: values.checkbox,
          };
          console.log('values is: ', values);
          try {
            await createPermission(payload)
              .then((res) => {
                console.log('2323223');
                console.log('res222 is: ', res);
              })
              .catch((err) => console.error(err.message));
          } catch (error) {
            // 捕获到请求错误
            console.error('权限创建失败：', error);
            message.error('权限创建失败，刷新后重试');
          }
          return true;
        }}
      >
        <ProFormText
          width="md"
          name="name"
          label="资源名称"
          tooltip="请在了解权限管理的原理之后添加对应的权限，目前默认路由只具有查看的权限，下一步会将按钮的增删改查权限添加进去"
          placeholder="请输入资源名称"
          rules={[
            {
              required: true,
              message: '请输入资源名称',
            },
          ]}
        />
        <ProFormRadio.Group
          label="资源类型："
          name="radioButton"
          options={['路由', '按钮']}
          rules={[
            {
              required: true,
              message: '请选择资源类型',
            },
          ]}
        />
        <ProFormCheckbox.Group
          name="checkbox"
          label="操作类型："
          options={[
            { label: '增加', value: 'create', disabled: isRoute },
            { label: '删除', value: 'delete', disabled: isRoute },
            { label: '更新', value: 'update', disabled: isRoute },
            { label: '查看', value: 'find', disabled: false },
          ]}
          rules={[
            {
              required: true,
              message: '请选择对资源的操作类型',
            },
          ]}
        />
      </ModalForm>
    );
  };

  return (
    <ProCard split="vertical">
      <ProCard loading={isRoleTreeLoading} title="角色列表" colSpan="30%">
        <Tree
          defaultExpandedKeys={['roleList']}
          defaultSelectedKeys={['roleList']}
          onSelect={onSelect}
          treeData={roleData}
        />
      </ProCard>
      <ProCard
        loading={isRoleTreeLoading}
        title="权限列表"
        headerBordered
        extra={renderModalForm()}
      >
        {renderRightSideContent()}
      </ProCard>
    </ProCard>
  );
};
