/*
 * Bom - 工作台Bom弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useMemo } from 'react';
import { DataSet, Modal, Table, Output, Form, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { clearPoItemBOM } from '@/services/orderWorkspaceService';
import { bom } from './store/bomDs';

const tenantId = getCurrentOrganizationId();

const Bom = (props) => {
  const { disabled, record, readOnly } = props;
  const bomDs = useMemo(
    () =>
      new DataSet({
        ...bom(),
        selection: readOnly ? false : 'multiple',
        queryParameter: {
          poHeaderId: record.get('poHeaderId'),
          poLineId: record.get('poLineId'),
          poLineLocationId: record.get('poLineLocationId'),
        },
      }),
    []
  );
  const columns = useMemo(
    () => [
      {
        name: 'orderSeq',
      },
      {
        name: 'itemLov',
        editor: true,
      },
      {
        name: 'itemName',
        editor: true,
      },
      {
        name: 'categoryLov',
        editor: true,
      },
      {
        name: 'quantity',
        editor: true,
      },
      {
        name: 'uomLov',
        editor: true,
      },
      {
        name: 'invOrganizationLov',
        editor: true,
      },
      {
        name: 'needByDate',
        editor: true,
      },
    ],
    []
  );

  const handleCreate = () => {
    bomDs.create({
      tenantId,
      needByDate: record.get('needByDate'),
      invOrganizationId: record.get('invOrganizationId'),
      invOrganizationName: record.get('invOrganizationName'),
      poHeaderId: record.get('poHeaderId'),
      poLineId: record.get('poLineId'),
      poLineLocationId: record.get('poLineLocationId'),
    });
  };

  const renderChildren = () => {
    const addButton = (
      <Button icon="add" funcType="flat" onClick={handleCreate}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>
    );
    return (
      <Fragment>
        <Form columns={2}>
          <Output
            label={intl.get('sodr.workspace.model.common.itemCode').d('物料编码')}
            value={record.get('itemCode')}
          />
          <Output
            label={intl.get('sodr.workspace.model.common.itemName').d('物料名称')}
            value={record.get('itemName')}
          />
        </Form>
        <Table
          dataSet={bomDs}
          columns={columns}
          buttons={readOnly ? [] : [addButton, 'delete', 'save']}
        />
      </Fragment>
    );
  };

  const handleModal = useCallback(async () => {
    const children = renderChildren();
    if (readOnly) {
      Modal.open({
        footer: null,
        closable: true,
        style: { width: 1000 },
        title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
        children,
      });
      bomDs.query();
    } else {
      if (record.status === 'add') {
        Modal.info({
          children: intl
            .get('sodr.workspace.view.info.noSaveBomLine')
            .d('该订单行未保存，bom信息不能维护，请先保存！'),
        });
        return;
      }
      Modal.open({
        footer: null,
        closable: true,
        style: { width: 1000 },
        title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
        children,
      });
      if (record.get('saveBomItemId') !== record.get('itemId')) {
        const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
        if (res) {
          record.set({ saveBomItemId: record.get('itemId') });
        }
      } else {
        bomDs.query();
      }
    }
  }, []);
  return readOnly ? (
    <a disabled={!!disabled} onClick={handleModal}>
      {intl.get('hzero.common.button.look').d('查看')}
    </a>
  ) : (
    <a disabled={!!disabled} onClick={handleModal}>
      {intl.get('hzero.common.button.maintain').d('维护')}
    </a>
  );
};

export default Bom;
