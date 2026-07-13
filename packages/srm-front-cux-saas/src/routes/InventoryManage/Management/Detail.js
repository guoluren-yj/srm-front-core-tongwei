import React, { Fragment, useMemo, useEffect, useState } from 'react';
import {
  Table,
  DataSet,
  Button,
  Spin,
  Form,
  Output,
  Lov,
  TextArea,
  Modal,
  NumberField,
} from 'choerodon-ui/pro';
import { Card, notification } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import './index.less';

import { formData, lineData, itemData, operation } from './initialDataDs';
import {
  headerSave,
  headerSubmit,
  headerDelete,
  lineDelete,
  itemSave,
  approve,
  reject,
} from '@/services/inventoryManageService';

const organizationId = getCurrentOrganizationId();

const prefix = 'scux.dhqflyInventoryManage';

const DhqflyManageDetail = props => {
  const { inventoryManageHeaderId, status } = props.match.params;
  const formDs = useMemo(() => new DataSet(formData()), []);
  const lineDs = useMemo(() => new DataSet(lineData(status)), []);
  const itemDs = new DataSet(itemData());
  const operationDs = new DataSet(operation());

  const [uid, setUuid] = useState('');
  const [flag, setFlag] = useState('NEW');

  useEffect(() => {
    queryData();
  }, []);

  const queryData = () => {
    if (inventoryManageHeaderId) {
      formDs.setQueryParameter('inventoryManageHeaderId', inventoryManageHeaderId);
      formDs.query().then(res => {
        setUuid(res?.attachmentUuid);
        setFlag(res?.status);
      });
    }
  };

  useEffect(() => {
    queryLine();
  }, []);

  const queryLine = () => {
    if (inventoryManageHeaderId) {
      lineDs.setQueryParameter('inventoryManageHeaderId', inventoryManageHeaderId);
      lineDs.query();
    }
  };

  // 提价
  const handleSubmit = async () => {
    const headerValidate = await formDs.validate();
    const lineValidate = await lineDs.validate();
    if (headerValidate && lineValidate) {
      const headerInfo = formDs.current.toData();
      const lineInfo = lineDs.toData();
      headerSubmit([
        {
          ...headerInfo,
          typeFlag: status,
          attachmentUuid: uid,
          yangoInventoryManageLineList: lineInfo,
        },
      ]).then(res => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.message.submitSuccess`).d('提交成功'),
              placement: 'bottomRight',
            });
            props.history.push({
              pathname: `/scux/inventory-manage/list`,
            });
          }
        }
      });
    }
  };

  // 保存
  const handleSave = async () => {
    const headerValidate = await formDs.validate();
    const lineValidate = await lineDs.validate();
    if (headerValidate && lineValidate) {
      const headerInfo = formDs.current.toJSONData();
      const lineInfo = lineDs.toData();
      headerSave({
        ...headerInfo,
        typeFlag: status,
        attachmentUuid: uid,
        yangoInventoryManageLineList: lineInfo,
      }).then(res => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.message.saveSuccess`).d('保存成功'),
              placement: 'bottomRight',
            });
            if (inventoryManageHeaderId) {
              queryData();
              queryLine();
            } else {
              props.history.push({
                pathname: `/scux/inventory-manage/detail/${res.inventoryManageHeaderId}/${status}`,
              });
            }
          }
        }
      });
    }
  };

  // 头删除
  const handleDelete = () => {
    const headerInfo = formDs.current.toData();
    const lineInfo = lineDs.toData();
    headerDelete({
      ...headerInfo,
      attachmentUuid: uid,
      yangoInventoryManageLineList: lineInfo,
    }).then(res => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.message.deleteSuccess`).d('删除成功'),
            placement: 'bottomRight',
          });
          props.history.push({
            pathname: `/scux/inventory-manage/list`,
          });
        }
      }
    });
  };

  // 行删除
  const handleLineDelete = record => {
    const data = record.toData();
    lineDelete(data).then(res => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.message.deleteSuccess`).d('删除成功'),
            placement: 'bottomRight',
          });
        }
      }
    });
  };

  const handleApprove = () => {
    const info = formDs.current.toData();
    approve(info).then(res => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.message.approveSuccess`).d('审批成功'),
            placement: 'bottomRight',
          });
          props.history.push({
            pathname: '/scux/inventory-manage/list',
          });
        }
      }
    });
  };

  const handleReject = () => {
    const info = formDs.current.toData();
    reject(info).then(res => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.message.approveSuccess`).d('审批成功'),
            placement: 'bottomRight',
          });
          props.history.push({
            pathname: '/scux/inventory-manage/list',
          });
        }
      }
    });
  };

  // 批量导入
  const handleImport = () => {
    openTab({
      key: `/scux/inventory-manage/data-import/SUCX.DHQFLY_STOCK_ITEM_IMPORT`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('导入'),
      }),
    });
  };

  const handleItem = () => {
    const columns = [
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
      },
      {
        name: 'categoryName',
      },
      {
        name: 'specifications',
      },
      {
        name: 'model',
      },
      {
        name: 'inventoryUnitName',
      },
      {
        name: 'unitPrice',
      },
      {
        name: 'bookInventory',
      },
      {
        name: 'availableInventory',
      },
      {
        name: 'occupiedInventory',
      },
    ];
    const { organizationCode, inventoryCode } = formDs.current.toData();
    itemDs.setQueryParameter('organizationCode', organizationCode);
    itemDs.setQueryParameter('inventoryCode', inventoryCode);
    itemDs.setQueryParameter('inventoryManageHeaderId', inventoryManageHeaderId);
    itemDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.item`).d('选择物料'),
      style: { width: 1000 },
      closable: true,
      onOk: () => handleScoreOk(),
      children: <Table dataSet={itemDs} columns={columns} showAllPageSelectionButton />,
    });
  };

  const handleScoreOk = () => {
    const unSelect = itemDs.unSelected ? itemDs.unSelected.map(item => item.toData()) : [];
    const data = itemDs.selected.map(item => item.toData());
    const { organizationCode, inventoryCode } = formDs.current.toData();
    let params = {};
    // 判断当前是否是跨页全选状态，并且当前页全部勾选。
    if (itemDs.isAllPageSelection && unSelect.length < 1) {
      const queryDataList = filterNullValueObject(itemDs.queryDataSet.current.toData());
      params = {
        ...queryDataList,
        allSelectFlag: 1,
      };
    } else {
      params = {
        yangoInventoryManageLineList: data,
      };
    }
    itemSave({
      ...params,
      inventoryCode,
      organizationCode,
      inventoryManageHeaderId,
    }).then(res => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`${prefix}.message.success`).d('操作成功'),
            placement: 'bottomRight',
          });
          queryLine();
        }
      }
    });
  };

  // 操作记录
  const handleOperation = () => {
    const columns = [
      {
        name: 'processUserName',
      },
      {
        name: 'processDate',
      },
      {
        name: 'processStatus',
      },
      {
        name: 'processRemark',
      },
    ];
    operationDs.setQueryParameter('inventoryManageHeaderId', inventoryManageHeaderId);
    operationDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('操作记录'),
      style: { width: 800 },
      closable: true,
      children: <Table dataSet={operationDs} columns={columns} />,
    });
  };

  const columns = [
    {
      name: 'orderNum',
    },
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    status !== 'CF' && {
      name: 'specifications',
    },
    status !== 'CF' && {
      name: 'model',
    },
    status !== 'CF' && {
      name: 'inventoryUnitName',
    },
    {
      name: 'unitPrice',
    },
    {
      name: 'bookInventory',
    },
    {
      name: 'occupiedInventory',
    },
    status === 'PD' && {
      name: 'checkInventory',
      editor: flag === 'NEW' || flag === 'REJECT',
    },
    status === 'PD' && {
      name: 'inventorySurplus',
    },
    status === 'PD' && {
      name: 'inventoryLoss',
    },
    status === 'BF' && {
      name: 'scrapInventory',
      editor: flag === 'NEW' || flag === 'REJECT',
    },
    status === 'BF' && {
      name: 'scrapAfterInventory',
    },
    status === 'CF' && {
      name: 'bookInventory',
    },
    status === 'CF' && {
      name: 'inventoryUnitName',
    },
    status === 'CF' && {
      name: 'splitQuantity',
      editor: flag === 'NEW' || flag === 'REJECT',
    },
    status === 'CF' && {
      name: 'splitUnit',
      editor: flag === 'NEW' || flag === 'REJECT',
    },
    status === 'CF' && {
      name: 'splitScale',
      width: 160,
      renderer: ({ value, record }) => {
        if (flag === 'NEW' || flag === 'REJECT') {
          return (
            <div>
              1&nbsp;:&nbsp;
              <NumberField name="splitScale" record={record} style={{ width: '130px' }} />
            </div>
          );
        } else {
          return value;
        }
      },
      // editor: true,
    },
    status === 'CF' && {
      name: 'splitInventory',
    },
    (flag === 'NEW' || flag === 'REJECT') && {
      header: intl.get(`${prefix}.model.dhqflyInventoryManage.action`).d('操作'),
      align: 'center',
      renderer: ({ record }) => (
        <a onClick={() => handleLineDelete(record)}>
          {intl.get(`${prefix}.model.dhqflyInventoryManage.delete`).d('删除')}
        </a>
      ),
    },
  ];

  const Buttons = observer(propss => {
    return (
      <ExcelExport
        buttonText={intl.get(`${prefix}.button.export`).d('导出')}
        otherButtonProps={{ icon: 'export' }}
        requestUrl={`${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-lines/${inventoryManageHeaderId}/export`}
        queryParams={{
          ...propss.dataSet.queryDataSet,
          //  .toData()[0],
        }}
      />
    );
  });

  return (
    <Fragment>
      <Header
        title={
          status === 'PD'
            ? intl.get(`${prefix}.view.title.yangoManagePD`).d('库存盘点')
            : status === 'CF'
            ? intl.get(`${prefix}.view.title.yangoManageCF`).d('包装拆分')
            : intl.get(`${prefix}.view.title.yangoManageBF`).d('库存报废')
        }
        backPath="/scux/inventory-manage/list"
      >
        {(flag === 'NEW' || flag === 'REJECT') && (
          <>
            <Button icon="check" onClick={handleSubmit} wait={1000}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button icon="save" onClick={handleSave} wait={1000}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            {inventoryManageHeaderId && (
              <Button icon="delete" onClick={handleDelete} wait={1000}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            )}
          </>
        )}
        {flag.startsWith('APPROVING') && (
          <>
            <Button onClick={handleApprove}>
              {intl.get(`${prefix}.button.approve`).d('审批通过')}
            </Button>
            <Button onClick={handleReject}>
              {intl.get(`${prefix}.button.reject`).d('审批拒绝')}
            </Button>
          </>
        )}
        <Upload
          filePreview
          btnProps={{
            icon: flag === 'NEW' || flag === 'REJECT' ? 'upload' : 'eye',
            type: 'primary',
          }}
          bucketName="private-bucket"
          attachmentUUID={uid}
          afterOpenUploadModal={uuid => {
            setUuid(uuid);
          }}
          viewOnly={!(flag === 'NEW' || flag === 'REJECT')}
        />
        {inventoryManageHeaderId && (
          <Button onClick={handleOperation}>
            {intl.get(`${prefix}.button.operation`).d('操作记录')}
          </Button>
        )}
      </Header>
      <Content className="contentStyle">
        <Card>
          <div className="titleTag">{intl.get(`${prefix}.view.title.baseInfo`).d('基本信息')}</div>
          <Spin dataSet={formDs}>
            <Form dataSet={formDs} columns={3}>
              {flag === 'NEW' || flag === 'REJECT' ? (
                <>
                  <Lov name="organizationLov" />
                  <Lov name="inventoryLov" />
                </>
              ) : (
                <>
                  <Output name="organizationLov" />
                  <Output name="inventoryLov" />
                </>
              )}
              <Output name="statusMeaning" />
            </Form>
            <Form dataSet={formDs} columns={3}>
              <Output name="documentCode" />
              <Output name="createName" />
              <Output name="creationDate" />
            </Form>
            <Form dataSet={formDs} columns={1}>
              {flag === 'NEW' || flag === 'REJECT' ? (
                <TextArea name="remark" />
              ) : (
                <Output name="remark" />
              )}
            </Form>
          </Spin>
        </Card>
        {inventoryManageHeaderId && (
          <Card>
            <div className="titleTag">
              <span>{intl.get(`${prefix}.view.title.lineInfo`).d('行信息')}</span>
              <p style={{ position: 'absolute', top: '25px', left: '728px' }}>
                <Buttons dataSet={lineDs} />
              </p>
              {(flag === 'NEW' || flag === 'REJECT') && (
                <span style={{ position: 'absolute', right: '32px' }}>
                  <Button onClick={handleItem}>
                    {intl.get(`${prefix}.button.maintainItem`).d('选择物料')}
                  </Button>
                  <Button icon="import_export" onClick={handleImport}>
                    {intl.get(`hzero.common.button.import`).d('导入')}
                  </Button>
                </span>
              )}
            </div>
            <Table dataSet={lineDs} columns={columns} />
          </Card>
        )}
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['scux.dhqflyInventoryManage', 'hzero.common'] })(
  DhqflyManageDetail
);
