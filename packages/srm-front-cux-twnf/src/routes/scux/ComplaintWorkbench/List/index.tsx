import React, { useMemo, useCallback } from 'react';
import { DataSet, Modal, Lov, Form, Button, TextArea } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { stringify } from 'querystring';
import { observer } from 'mobx-react-lite';
import { tableDataSet, intlPrompt, allocationDataSet, replyDataSet } from './initialDs';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'hzero-front/lib/utils/notification';
import request from 'hzero-front/lib/utils/request';

const ComplaintWorkbench = ({ history }) => {
  const tableDs = useMemo(() => new DataSet(tableDataSet()), []);

  const handleToDetail = useCallback(
    (record?: any, readOnly?: boolean) => {
      history.push({
        pathname: `/scux/complaint-workbench/detail`,
        search: stringify({ id: record?.get('complaintReqId'), readOnly: readOnly || false }),
      });
    },
    [history]
  );

  const handleAllocation = async () => {
    const ds = new DataSet(allocationDataSet());
    Modal.open({
      title: intl.get(`${intlPrompt}.title.complaintAllocation`).d('投诉分配'),
      drawer: true,
      style: { width: '380px' },
      children: (
        <Form dataSet={ds} labelLayout={LabelLayout.float}>
          <Lov name="replyUser" />
        </Form>
      ),
      onOk: async () => {
        const validate = await ds.validate();
        if (!validate) {
          return false;
        }
        const body = tableDs.selected?.map(item => ({
          ...(item.toData() || {}),
          preOperateBy: ds?.current?.get('preOperateBy')
        }));
        const result = await request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/2TSQwG8AA3OnXvD77gIUo39BCSYAMngfO3YDgibKIsDE`, {
          method: 'POST',
          query: { methodCode: 'distribute' },
          body,
        });
        if (getResponse(result)) {
          notification.success({});
          tableDs.query();
        }
        return true;
      },
      afterClose: () => {
        ds.reset();
      },
    })
  };

  const handleReply = async () => {
    const ds = new DataSet(replyDataSet());
    Modal.open({
      title: intl.get(`${intlPrompt}.title.complaintReply`).d('投诉回复'),
      drawer: true,
      style: { width: '380px' },
      children: (
        <Form dataSet={ds} labelLayout={LabelLayout.float}>
          <TextArea name="replyRemark" />
          <Lov name="replyUnitLov" />
        </Form>
      ),
      onOk: async () => {
        const validate = await ds.validate();
        if (!validate) {
          return false;
        }
        const body = tableDs.selected?.map(item => ({
          ...(item.toData() || {}), 
          operatedContent: ds?.current?.get('replyRemark'),
          operatedDept: ds?.current?.get('unitId')
        }));
        const result = await request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/2TSQwG8AA3OnXvD77gIUo39BCSYAMngfO3YDgibKIsDE`, {
          method: 'POST',
          query: { methodCode: 'reply' },
          body,
        });
        if (getResponse(result)) {
          notification.success({});
          tableDs.query();
        }
        return true;
      },
      afterClose: () => {
        ds.reset();
      },
    })
  };

  const columns: ColumnProps[] = useMemo(() => ([
    { name: 'statusMeaning' },
    {
      name: 'complaintReqNum',
      wdith: 120,
      renderer: ({ value, record }) =>
        <Button
          funcType={FuncType.link}
          onClick={() =>
            handleToDetail(record, record.get('status') !== 'NEW')
          }
        >
          {value}
        </Button>
    },
    { name: 'companyName' },
    { name: 'ouName' },
    { name: 'complainRealName' },
    { name: 'complainMobile' },
    { name: 'complainTypeMeaning' },
    { name: 'reqNum' },
    { name: 'creationDate' },
    { name: 'complainContent' },
    { name: 'preOperateRealName' },
    { name: 'distributeTime' },
    { name: 'operatedRealName' },
    { name: 'unitName' },
    { name: 'operatedMobile' },
    { name: 'operatedTime' },
    { name: 'operatedContent' },
  ].filter(Boolean) as ColumnProps[]), []);

  const getQueryData = () => {
    const queryDsData = tableDs?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryDsData,
    });
  };

  const getSelectedKeys = key => {
    return { [`${key}s`]: tableDs.selected.map(item => item.get('complaintReqId')) };
  };

  const HeaderButtons = observer(({ dataSet }: any) => {
    const selected = dataSet?.selected || [];
    const buttons = [
      {
        name: 'add',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          color: 'primary',
          icon: 'add',
          onClick: () => handleToDetail(),
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          selected.length === 0
            ? intl.get('hzero.common.button.newExport').d('(新)导出')
            : intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          },
          exportAsync: false,
          requestUrl: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/2TSQwG8AA3OnXvD77gIUo4aP6G9HX6jl6PxKN1zjsQ9AYpf43oiaEoLxM9rhIuibG2`,
          queryParams: selected.length === 0 ? getQueryData() : getSelectedKeys('exportId'),
          method: 'POST',
          allBody: true,
        },
      },
      {
        name: 'allocation',
        child: intl.get(`${intlPrompt}.button.allocation`).d('分配'),
        btnProps: {
          funcType: 'flat',
          disabled: selected.length === 0 || selected.some(item => item.get('status') !== 'SUBMITTED'),
          onClick: () => handleAllocation(),
        },
      },
      {
        name: 'reply',
        child: intl.get(`${intlPrompt}.button.reply`).d('回复'),
        btnProps: {
          funcType: 'flat',
          disabled: selected.length !== 1 || selected.some(item => item.get('status') !== 'SUBMITTED'),
          onClick: () => handleReply(),
        },
      },
    ];
    return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
  });

  return (
    <>
      <Header
        title={intl.get(`${intlPrompt}.view.title`).d('投诉工作台')}
      >
        <HeaderButtons dataSet={tableDs} />
      </Header>
      <Content>
        <FilterBarTable
          virtual
          virtualCell
          border={false}
          columns={columns as any}
          dataSet={tableDs as any}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -50 }}
          customizable
          customizedCode="customized"
        />
      </Content>
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt] })(ComplaintWorkbench)
);
