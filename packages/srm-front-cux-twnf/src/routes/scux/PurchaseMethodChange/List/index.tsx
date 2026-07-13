import React, { useMemo, useCallback } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { observer } from 'mobx-react-lite';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { stringify } from 'querystring';
import { tableDataSet, intlPrompt } from './initialDs';
import { openDocumentDetailModal } from '../modals/DocumentDetailModal';

const PurchaseMethodChangeList = ({ history }) => {
  const tableDs = useMemo(() => new DataSet(tableDataSet()), []);

  const handleToDetail = useCallback(
    (record?: any) => {
      history.push({
        pathname: `/scux/purchase-method-change/detail`,
        search: stringify({ fbcNum: record?.get('fbcNum'), readOnly: true }),
      });
    },
    [history]
  );

  const columns: ColumnProps[] = useMemo(() => ([
    { name: 'status' },
    {
      name: 'fbcNum',
      width: 150,
      renderer: ({ value, record }) =>
        <a
          onClick={() => handleToDetail(record)}
        >
          {value}
        </a>
    },
    { name: 'title', width: 200, },
    { name: 'applyUser' },
    { name: 'applyTime', width: 180 },
    {
      name: 'processLink',
      renderer: ({ value }) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ) : null,
    },
    { name: 'currencyCode' },
    { name: 'amount', width: 130, },
    { name: 'purchaseRange', width: 180 },
    { name: 'remark', width: 200 },
    { name: 'requestNum', width: 150, },
    { name: 'executionAmount' },
    {
      name: 'executionLink',
      renderer: ({ record }: any) =>
        record.get('dipRequestNum') ? (
          <Button
            funcType={FuncType.link}
            onClick={() => openDocumentDetailModal(record.get('dipRequestNum'))}
          >
            {intl.get('scux.purchaseMethodChange.button.documentDetail').d('单据详情')}
          </Button>
        ) : null,
    },
  ].filter(Boolean) as ColumnProps[]), [handleToDetail]);

  const getQueryData = () => {
    const queryDsData = tableDs?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryDsData,
      page: null,
      size: null
    });
  };

  
  const getSelectedKeys = useCallback((key) => {
    if (!key) return {};
    return { [`${key}s`]: tableDs.selected.map((r: any) => r.get(key)) };
  }, [tableDs]);

  const handleExport = useCallback(() => {
    let data = {};
    // if (tableDs.selected.length > 0) {
    //   data = getSelectedKeys('fbcNum');
    // } else {
      data = getQueryData();
    // }
    downloadFileByAxios({
      requestUrl: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/8dWrPxjlgvFsnJLhFNMnIUFNwuia2I7fOGxZfJENMPaE `,
      method: 'GET',
      queryParams: Object.entries(data).map(([key, value]) => ({ name: key, value })),
    });
  }, [tableDs]);


  const HeaderButtons = observer(({ dataSet }: any) => {
    const selected = dataSet?.selected || [];
    const buttons = [
        {
          name: 'newExport',
          // child: selected.length === 0
          //   ? intl.get('hzero.common.button.newExport').d('(新)导出')
          //   : intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出'),
          child: intl.get('hzero.common.button.newExport').d('(新)导出'),
          btnProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            onClick: () => handleExport(),
          },
        },
    ];
    return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
  });

  return (
    <>
      <Header
        title={intl.get(`${intlPrompt}.view.title`).d('采购方式变更查询')}
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
          customizedCode="purchase-method-change-list"
        />
      </Content>
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt] })(PurchaseMethodChangeList)
);
