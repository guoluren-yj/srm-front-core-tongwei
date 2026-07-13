import React, { Fragment, useMemo, useEffect, useState } from 'react';
import {
  Table,
  DataSet,
  Button,
  Spin,
  Form,
  TextField,
  Lov,
  TextArea,
  Modal,
  Select,
  // DatePicker,
  Output,
} from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Card, Tabs } from 'choerodon-ui';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import ApproveRecord from '_components/ApproveRecord';
import './index.less';

import { formData, itemData, gooutData, itemModal, operation } from './initialDataDs';
import {
  toReceiveSave,
  toReceiveSubmit,
  toReceiveDelete,
  toItemAdd,
  toLineDelete,
  toLinePrint,
  toReceiveApprovalRecord,
} from '@/services/inventoryManageService';

const prefix = 'scux.dhqflyInventoryManage';

const DhqflyManageDetail = (props) => {
  const { inventoryReceiveHeaderId, status } = props.match.params;
  const formDs = useMemo(() => new DataSet(formData()), []);
  const gooutDs = useMemo(() => new DataSet(gooutData()), []);
  const itemDs = useMemo(() => new DataSet(itemData()), []);
  const modalDs = new DataSet(itemModal());
  const operationDs = new DataSet(operation());

  const [uid, setUuid] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [invCode, setInvCode] = useState('');
  const [printFlag, setPrintFlag] = useState(false);

  useEffect(() => {
    if (inventoryReceiveHeaderId) {
      queryForm();
      queryLine();
    }
  }, []);

  const queryForm = () => {
    formDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
    formDs.query().then((res) => {
      setUuid(res?.attachmentUuid);
      setOrgCode(res?.organizationCode);
      setInvCode(res?.outInventoryCode);
    });
  };

  const queryLine = () => {
    itemDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
    itemDs.query();
  };

  const changeTabs = (type) => {
    if (type === 'item') {
      itemDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
      itemDs.query();
    } else {
      gooutDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
      gooutDs.query();
    }
  };

  // 提交
  const handleSubmit = async () => {
    const validate = await formDs.validate();
    const lineValidate = await itemDs.validate();
    if (!validate || !lineValidate) {
      notification.error({
        description: intl.get(`${prefix}.error.message`).d('必输字段未填写，请检查'),
      });
      return;
    }
    if (validate && lineValidate) {
      const formInfo = formDs.current.toJSONData();
      const itemLineList = itemDs.toData();
      const res = await toReceiveSubmit([
        {
          ...formInfo,
          attachmentUuid: uid,
          itemLineList,
        },
      ]);
      if (getResponse(res)) {
        notification.success();
        props.history.push({
          pathname: '/scux/inventory-receiving/list',
        });
      }
    }
  };

  // 保存
  const handleSave = async () => {
    const validate = await formDs.validate();
    const lineValidate = await itemDs.validate();
    if (!validate || !lineValidate) {
      notification.error({
        description: intl.get(`${prefix}.error.message`).d('必输字段未填写，请检查'),
      });
      return;
    }
    if (validate && lineValidate) {
      const formInfo = formDs.current.toJSONData();
      const itemLineList = itemDs.toData();
      const res = await toReceiveSave({
        ...formInfo,
        attachmentUuid: uid,
        itemLineList,
      });
      if (getResponse(res)) {
        notification.success();
        if (inventoryReceiveHeaderId) {
          queryForm();
          queryLine();
        } else {
          props.history.push({
            pathname: `/scux/inventory-receiving/detail/${res?.inventoryReceiveHeaderId}/${res?.receiveStatus}`,
          });
        }
      }
    }
  };

  // 头删除
  const handleDelete = async () => {
    const formInfo = formDs.current.toJSONData();
    const itemLineList = itemDs.toData();
    const res = await toReceiveDelete({
      ...formInfo,
      attachmentUuid: uid,
      itemLineList,
    });
    if (getResponse(res)) {
      notification.success();
      props.history.push({
        pathname: '/scux/inventory-receiving/list',
      });
    }
  };

  // 行删除
  const handleLineDelete = async () => {
    const data = itemDs.selected.map((item) => item.toData());
    const res = await toLineDelete(data);
    if (getResponse(res)) {
      notification.success();
      itemDs.query();
    }
  };

  // 打印
  const handlePrint = () => {
    setPrintFlag(true);
    const data = formDs.current.toData();
    const newData = {
      ...data,
    };
    const response = toLinePrint(newData);
    response.then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.setAttribute('target', '_blank');
        a.href = fileURL;
        a.click();
      }
    }).finally(() => {
      setPrintFlag(false);
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
        name: 'quantity',
      },
      {
        name: 'receivedQuantity',
      },
      {
        name: 'receivableQuantity',
      },
      {
        name: 'unitPrice',
      },
      {
        name: 'unitName',
      },
      {
        name: 'categoryName',
      },
      {
        name: 'specifications',
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
    modalDs.setQueryParameter('organizationCode', orgCode);
    modalDs.setQueryParameter('inventoryCode', invCode);
    modalDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
    modalDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.item`).d('选择物料'),
      style: { width: 1000 },
      closable: true,
      onOk: () => handleScoreOk(),
      children: <Table dataSet={modalDs} columns={columns} />,
    });
  };

  const handleScoreOk = async () => {
    const data = modalDs.selected.map((item) => item.toData());
    const res = await toItemAdd({
      inventoryReceiveHeaderId,
      list: data,
    });
    if (getResponse(res)) {
      notification.success();
      queryLine();
    }
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
    operationDs.setQueryParameter('inventoryReceiveHeaderId', inventoryReceiveHeaderId);
    operationDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('操作记录'),
      style: { width: 800 },
      closable: true,
      children: <Table dataSet={operationDs} columns={columns} />,
    });
  };
  // 审批记录
  const approvalRecord = async () => {
    const params = {
      inventoryReceiveHeaderId,
    };
    const res = await toReceiveApprovalRecord(params);
    const approvalRecordData = !isEmpty(res)
      ? [].concat(...res.map((item) => item.historicTaskExtList || []))
      : [];
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('审批记录'),
      style: { width: 800 },
      closable: true,
      children: <ApproveRecord data={approvalRecordData.reverse()} />,
    });
  };

  const columns = [
    {
      name: 'lineNum',
      width: 90,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 120,
    },
    // {
    //   name: 'quantity',
    //   width: 120,
    // },
    // {
    //   name: 'receivedQuantity',
    //   width: 120,
    // },
    // {
    //   name: 'receivableQuantity',
    //   width: 120,
    // },
    {
      name: 'unitName',
      width: 120,
    },
    {
      name: 'bookInventory',
      width: 120,
    },
    {
      name: 'availableInventory',
      width: 120,
    },
    {
      name: 'occupiedInventory',
      width: 120,
    },
    {
      name: 'receivingQuantity',
      width: 120,
      editor: status === 'NEW',
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'specifications',
      width: 120,
    },
    {
      name: 'brandName',
      width: 120,
    },
    {
      name: 'originName',
      width: 120,
    },
    {
      name: 'productionDate',
      width: 120,
    },
    {
      name: 'shelfLife',
      width: 120,
    },
  ];

  const goColumns = [
    {
      name: 'lineNum',
      width: 120,
    },
    {
      name: 'trxNumber',
      width: 120,
    },
    {
      name: 'trxLineNum',
      width: 120,
    },
    {
      name: 'inboundDate',
      width: 120,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 120,
    },
    {
      name: 'quantity',
      width: 120,
    },
    {
      name: 'receivedQuantity',
      width: 120,
    },
    {
      name: 'receivableQuantity',
      width: 120,
    },
    {
      name: 'unitPrice',
      width: 120,
    },
    {
      name: 'amount',
      width: 120,
    },
    {
      name: 'unitName',
      width: 120,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'specifications',
      width: 120,
    },
    {
      name: 'brandName',
      width: 120,
    },
    {
      name: 'originName',
      width: 120,
    },
    {
      name: 'productionDate',
      width: 120,
    },
    {
      name: 'shelfLife',
      width: 120,
    },
    {
      name: 'bookInventory',
      width: 120,
    },
    {
      name: 'availableInventory',
      width: 120,
    },
    {
      name: 'occupiedInventory',
      width: 120,
    },
    {
      name: 'inboundQuantity',
      width: 120,
    },
  ];

  return (
    <Fragment>
      <Header
        title={intl.get(`${prefix}.view.title.dhqflyInventoryReceiveDetail`).d('库存领用')}
        backPath="/scux/inventory-receiving/list"
      >
        {status === 'NEW' && (
          <>
            <Button color="primary" icon="check" onClick={handleSubmit}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button icon="save" onClick={handleSave}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button icon="delete" onClick={handleDelete}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </>
        )}
        <Upload
          filePreview
          btnProps={{ icon: status === 'NEW' ? 'upload' : 'eye', type: 'primary' }}
          bucketName="private-bucket"
          attachmentUUID={uid}
          afterOpenUploadModal={(uuid) => {
            setUuid(uuid);
          }}
          viewOnly={status !== 'NEW'}
        />
        {inventoryReceiveHeaderId && (
          <Button onClick={handleOperation}>
            {intl.get(`${prefix}.button.operation`).d('操作记录')}
          </Button>
        )}
        <Button color="primary" onClick={handlePrint} loading={printFlag}>
          {intl.get(`${prefix}.button.print`).d('打印')}
        </Button>
        <Button onClick={approvalRecord}>
          {intl.get(`${prefix}.button.approvalRecord`).d('审批记录')}
        </Button>
      </Header>
      <Content className="contentStyle">
        <Card>
          <div className="titleTag">{intl.get(`${prefix}.view.title.baseInfo`).d('基本信息')}</div>
          <Spin dataSet={formDs}>
            <Form dataSet={formDs} columns={3}>
              {status === 'NEW' ? (
                <>
                  <TextField name="receiveNumber" />
                  <Lov name="companyLov" />
                  <Lov name="departmentLov" />
                  <TextField name="creationDate" />
                  <TextField name="finishDate" />
                  <TextField name="manager" />
                  <Select name="receiveType" />
                  <TextField name="receiveStatus" />
                  <Lov
                    name="outDepotLov"
                    onChange={(record) => {
                      setOrgCode(record?.organizationCode);
                      setInvCode(record?.inventoryCode);
                    }}
                  />
                  <Lov name="outDepotUnitLov" />
                  <Lov name="inDepotLov" />
                  <Lov name="inDepotUnitLov" />
                </>
              ) : (
                <>
                  <Output name="receiveNumber" />
                  <Output name="companyLov" />
                  <Output name="departmentLov" />
                  <Output name="creationDate" />
                  <Output name="finishDate" />
                  <Output name="manager" />
                  <Output name="receiveType" />
                  <Output name="receiveStatus" />
                  <Output name="outDepotLov" />
                  <Output name="outDepotUnitLov" />
                  <Output name="inDepotLov" />
                  <Output name="inDepotUnitLov" />
                </>
              )}
            </Form>
            <Form dataSet={formDs} columns={1}>
              {status === 'NEW' ? <TextArea name="remark" /> : <Output name="remark" />}
            </Form>
          </Spin>
        </Card>
        {inventoryReceiveHeaderId && (
          <Card>
            <div className="titleTag">
              <span>{intl.get(`${prefix}.view.title.lineInfo`).d('物品信息')}</span>
            </div>
            <Tabs animated={false} onChange={changeTabs}>
              <Tabs.TabPane key="item" tab={intl.get(`${prefix}.view.tab.item`).d(`物料明细`)}>
                {status === 'NEW' && (
                  <div className="item-Button">
                    {orgCode && (
                      <Button onClick={handleItem}>
                        {intl.get(`${prefix}.button.maintainItem`).d('选择物料')}
                      </Button>
                    )}
                    <Button icon="delete" onClick={handleLineDelete}>
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>
                  </div>
                )}
                <Table dataSet={itemDs} columns={columns} />
              </Tabs.TabPane>
              <Tabs.TabPane key="goout" tab={intl.get(`${prefix}.view.tab.goout`).d(`出库明细`)}>
                <Table dataSet={gooutDs} columns={goColumns} />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        )}
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['scux.dhqflyInventoryManage', 'hzero.common'] })(
  DhqflyManageDetail
);
