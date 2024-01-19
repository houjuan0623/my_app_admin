import React, { useState, useEffect, useMemo } from 'react';
import { Tree, message, Dropdown, Modal, Form, Input, Radio, Checkbox, Tag, Button } from 'antd';
import type { DataNode, TreeProps } from 'antd/lib/tree';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import request from 'umi-request';

import type { roleItem } from '../definition';
import { getResource, createResource, updateResourceAPI } from '../../../services/my-app';

type ResourceNode = {
  key: React.Key;
  title: React.ReactNode;
  children: ResourceNode[];
};

export default () => {
  // 记录树形roleData
  const [roleData, setRoleData] = useState<DataNode[]>([]);
  // 利用一个加载状态来控制树组件的渲染。防止角色列表树组件已经加载成功，但是数据还没有返回
  const [isRoleTreeLoading, setIsRoleTreeLoading] = useState(true);
  // 利用一个加载状态来控制树组件的渲染。防止权限列表组件树已经加载成功，但是数据还没有返回
  const [isResourceTreeLoading, setIsResourceTreeLoading] = useState(false);
  // 记录树形ResourceData
  const [ResourceTreeData, setResourceTreeData] = useState<ResourceNode[]>([
    {
      title: '权限列表',
      key: 'resourceList',
      children: [],
    },
  ]);
  // 记录左侧角色列表中选中的是父节点还是叶节点
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // 定义一个状态来跟踪上下文菜单的显示位置和被选中的树节点
  const [selectedResource, setSelectedResource] = useState<{
    key?: string;
    title?: React.ReactNode;
    name?: string;
    type?: string;
    action?: string;
    children?: [];
  }>({});
  // Add a state to track the selected resource type
  const [addResourceFormType, setAddResourceFormType] = useState('Button');
  const [updateResourceFormType, setUpdateResourceFormType] = useState('Button');
  // 使用状态控制新增资源的modal的消隐
  const [addResourceModal, setaddResourceModal] = useState(false);
  const [buttonOfAddResourceloading, setbuttonOfAddResourceloading] = useState(false);
  // 使用状态控制更新资源的modal的消隐
  const [updateResourceModal, setupdateResourceModal] = useState(false);
  const [buttonOfUpdateResourceloading, setbuttonOfUpdateResourceloading] = useState(false);
  // 使用状态控制删除资源的modal的消隐
  const [deleteResourceModal, setdeleteResourceModal] = useState(false);

  const [addResourceForm] = Form.useForm();
  const [updateResourceForm] = Form.useForm();

  // 加载角色数据
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
              disabled: true,
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

  // 将获取资源的方法单独封装起来
  const fetchResourceData = async (key: React.Key | null) => {
    if (key) {
      setIsResourceTreeLoading(true);
      // TODO: 此处应该加载权限列表的数据。
      getResource()
        .then((res: any) => {
          console.log('res is: ', res);
          const resources = res.data.resource;
          // 创建节点索引：创建一个对象以存储每个节点的引用，这样我们可以在O(1)的时间复杂度内访问任何节点。
          const nodeMap = {};
          resources.forEach((resource: any) => {
            nodeMap[resource._id] = {
              ...resource,
              children: [],
            };
          });
          // 构建树结构：遍历所有节点，对于每个节点，根据其 parent_id 将其添加到对应父节点的 children 数组中。如果找不到对应的父节点，就将该节点作为根节点。
          const treeData: {
            key: React.Key;
            title: React.ReactNode;
            name?: string;
            type?: string;
            action?: string;
          }[] = [];
          resources.forEach((resource: any) => {
            const node = nodeMap[resource._id];
            if (resource.parent_id === 'resourceList') {
              treeData.push(node);
            } else {
              const parentNode = nodeMap[resource.parent_id];
              if (parentNode) {
                parentNode.children.push(node);
              }
            }
          });

          // 格式化节点数据：在构建树的同时，按照Ant Design Tree组件的要求格式化节点数据。
          const formatTreeData = (nodes: any) => {
            return nodes.map((node: any) => ({
              key: node._id,
              title: (
                <span>
                  <b>{node.name}</b>{' '}
                  <Tag color="cyan">{node.type === 'Route' ? '路由' : '按钮'}</Tag>
                  <Tag color="blue">{node.action}</Tag>
                </span>
              ),
              name: node.name,
              action: node.action,
              type: node.type,
              children: formatTreeData(node.children),
            }));
          };

          const formattedTreeData = formatTreeData(treeData);
          const resourcesTreeData = [
            {
              title: (
                <span>
                  <BankOutlined /> 权限列表
                </span>
              ),
              key: 'resourceList',
              children: formattedTreeData,
            },
          ];
          setResourceTreeData(resourcesTreeData);
        })
        .catch((error) => {
          console.log('error is: ', error);
          message.error('权限列表加载失败');
        })
        .finally(() => {
          setIsResourceTreeLoading(false);
        });
    }
  };

  // 选中角色树节点的handler
  const onSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys.length > 0 ? selectedKeys[0] : null;
    console.log('selectedKeys is: ', selectedKeys);
    setSelectedKey(key as string);
    fetchResourceData(key);
  };

  // 选中权限树节点的handler
  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

  // 右键单击权限树节点的handler
  const onTreeNodeRightClick = ({ event, node }: { event: React.MouseEvent; node: any }) => {
    setSelectedResource({
      key: node?.key,
      title: node?.title,
      name: node?.name,
      type: node.type,
      action: node?.action,
    });
    console.log('node is: ', node);
    event.preventDefault(); // 防止默认的浏览器右键菜单出现
  };

  // 下拉菜单中的新增资源按钮对应的handler
  const addResource = () => {
    setaddResourceModal(true);
  };
  const handleAddResourceOk = async () => {
    try {
      setbuttonOfAddResourceloading(true);
      const values = await addResourceForm.validateFields();
      console.log('Form Values:', values);
      if (!values?.errorFields) {
        const playLoad = {
          name: values.name,
          type: values.type,
          action: values.operableTypes,
          parent_id: selectedResource?.key,
        };
        await createResource(playLoad);
        await fetchResourceData(selectedKey);
        setaddResourceModal(false);
        message.success('新增资源成功');
      }
    } catch (error) {
      console.log('Validation Failed:', error);
      message.error('新增资源失败');
    } finally {
      setbuttonOfAddResourceloading(false);
    }
  };

  const handleAddResourceCancel = () => {
    setaddResourceModal(false);
  };

  // 下拉菜单中的更新资源按钮对应的handler
  const updateResource = () => {
    updateResourceForm.setFieldsValue({
      name: selectedResource.name,
      type: selectedResource.type,
      operacleTypes: selectedResource.action,
    });
    setUpdateResourceFormType(selectedResource.type as string);
    setupdateResourceModal(true);
  };
  const handleUpdateResourceOk = async () => {
    try {
      setbuttonOfUpdateResourceloading(true);
      const values = await updateResourceForm.validateFields();
      if (!values?.errorFields) {
        console.log('values is: ', values);
        const data = {
          name: values.name,
          type: values.type,
          action: values.operableTypes,
          _id: selectedResource?.key,
        };
        await updateResourceAPI(data as any);
        await fetchResourceData(selectedKey);
        setupdateResourceModal(false);
        message.success('更新资源成功');
      }
    } catch (error) {
      console.log('error is: ', error);
      message.error('更新资源失败');
    } finally {
      setSelectedResource({});
      setbuttonOfUpdateResourceloading(false);
    }
  };

  const handleUpdateResourceCancel = () => {
    setupdateResourceModal(false);
    setSelectedResource({});
  };

  // 下拉菜单中的删除资源按钮对应的handler
  const deleteResource = () => {
    setdeleteResourceModal(true);
  };
  // TODO: 编写到了这里
  const handleDeleteResourceOk = () => {
    if (selectedResource.children?.length && selectedResource.children?.length > 0) {
      message.error('当前节点有子节点，请删除子节点后再删除当前节点。');
    } else {
    }
    setdeleteResourceModal(false);
  };

  const handleDeleteResourceCancel = () => {
    setdeleteResourceModal(false);
  };

  // 点击下拉菜单的handler
  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'add':
        // 处理新增权限逻辑
        console.log('新增权限', selectedResource?.key);
        addResource();
        break;
      case 'update':
        // 处理更新权限逻辑
        console.log('更新权限', selectedResource?.key);
        updateResource();
        break;
      case 'delete':
        // 处理删除权限逻辑
        console.log('删除权限', selectedResource?.key);
        deleteResource();
        break;
      default:
        console.log('未知操作');
    }
  };

  // 渲染下拉菜单
  const renderContextMenu = (nodeData: DataNode) => {
    let items;
    if (nodeData?.key === 'resourceList') {
      items = [{ label: '新增资源', key: 'add', icon: <PlusOutlined /> }];
    } else {
      items = [
        { label: '新增资源', key: 'add', icon: <PlusOutlined /> },
        { label: '更新资源', key: 'update', icon: <EditOutlined /> },
        { label: '删除资源', key: 'delete', icon: <DeleteOutlined /> },
      ];
    }

    const menuProps = {
      items,
      onClick: handleMenuClick,
    };

    // 显示菜单并定位到右键点击的位置
    return (
      <Dropdown menu={menuProps} trigger={['contextMenu']}>
        <div>{nodeData.title}</div>
      </Dropdown>
    );
  };

  // 渲染右侧的权限树
  const renderRightSideContent = () => {
    if (selectedKey === 'roleList') {
      return '您正在点击的是角色分类节点，请点击角色节点以显示权限。';
    } else if (selectedKey) {
      return (
        <Tree
          checkable
          defaultExpandAll
          treeData={ResourceTreeData}
          onCheck={onCheck}
          titleRender={renderContextMenu}
          onRightClick={onTreeNodeRightClick}
        />
      );
    } else {
      return '请从左侧选择一个角色以显示权限。';
    }
  };

  const renderModalForm = () => {
    return <Button type="primary"> 保 存 </Button>;
  };

  const resourceNameValidator = (_: any, value: any) => {
    if (addResourceForm.getFieldValue('type') === 'Route' && !value.startsWith('/')) {
      return Promise.reject(new Error('资源名称必须是以 "/"开头的字母或数字组成'));
    }
    return Promise.resolve();
  };

  const onAddResourceFormTypeChange = (e: any) => {
    console.log('e.target.value is: ', e.target.value);
    setAddResourceFormType(e.target.value);
  };

  const onUpdateResourceFormTypeChange = (e: any) => {
    console.log('e.target.value is: ', e.target.value);
    setUpdateResourceFormType(e.target.value);
  };

  const renderAddResourceForm = () => {
    const isRouteSelected = addResourceFormType === 'Route';
    return (
      <Form form={addResourceForm} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="资源名称"
          rules={[
            { required: true, message: '请输入资源名称' },
            { validator: resourceNameValidator },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label="资源类型"
          rules={[{ required: true, message: '请选择资源类型' }]}
        >
          <Radio.Group onChange={onAddResourceFormTypeChange}>
            <Radio value="Route">路由</Radio>
            <Radio value="Button">按钮</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="operableTypes"
          label="可操作类型"
          rules={[{ required: true, message: '请选择可操作类型' }]}
        >
          <Radio.Group>
            <Radio value="create" disabled={isRouteSelected}>
              增加
            </Radio>
            <Radio value="delete" disabled={isRouteSelected}>
              删除
            </Radio>
            <Radio value="update" disabled={isRouteSelected}>
              更新
            </Radio>
            <Radio value="find">查看</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    );
  };

  const renderUpdateResourceForm = () => {
    const isRouteSelected = updateResourceFormType === 'Route';
    return (
      <Form form={updateResourceForm} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="资源名称"
          rules={[
            { required: true, message: '请输入资源名称' },
            { validator: resourceNameValidator },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label="资源类型"
          rules={[{ required: true, message: '请选择资源类型' }]}
        >
          <Radio.Group onChange={onUpdateResourceFormTypeChange}>
            <Radio value="Route">路由</Radio>
            <Radio value="Button">按钮</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="operableTypes"
          label="可操作类型"
          rules={[{ required: true, message: '请选择可操作类型' }]}
        >
          <Radio.Group>
            <Radio value="create" disabled={isRouteSelected && selectedResource.type === 'Route'}>
              增加
            </Radio>
            <Radio value="delete" disabled={isRouteSelected && selectedResource.type === 'Route'}>
              删除
            </Radio>
            <Radio value="update" disabled={isRouteSelected && selectedResource.type === 'Route'}>
              更新
            </Radio>
            <Radio value="find">查看</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <Modal
        title="新增资源"
        open={addResourceModal}
        destroyOnClose={true}
        // onOk={handleAddResourceOk}
        onCancel={handleAddResourceCancel}
        footer={[
          <Button key="back" loading={buttonOfAddResourceloading} onClick={handleAddResourceCancel}>
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={buttonOfAddResourceloading}
            onClick={handleAddResourceOk}
          >
            确 定
          </Button>,
        ]}
      >
        {renderAddResourceForm()}
      </Modal>
      <Modal
        title="更新资源"
        destroyOnClose={true}
        open={updateResourceModal}
        onCancel={handleUpdateResourceCancel}
        footer={[
          <Button
            key="back"
            loading={buttonOfUpdateResourceloading}
            onClick={handleUpdateResourceCancel}
          >
            取 消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={buttonOfUpdateResourceloading}
            onClick={handleUpdateResourceOk}
          >
            确 定
          </Button>,
        ]}
      >
        {renderUpdateResourceForm()}
      </Modal>
      <Modal
        title="删除资源"
        open={deleteResourceModal}
        onOk={handleDeleteResourceOk}
        onCancel={handleDeleteResourceCancel}
      >
        <p>您确定删除当前路由吗？？？</p>
      </Modal>
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
          loading={isResourceTreeLoading}
          title="权限列表"
          headerBordered
          extra={renderModalForm()}
        >
          {renderRightSideContent()}
        </ProCard>
      </ProCard>
    </>
  );
};
