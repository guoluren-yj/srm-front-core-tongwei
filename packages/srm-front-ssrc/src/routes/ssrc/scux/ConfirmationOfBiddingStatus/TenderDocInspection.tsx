import React, { useMemo, useImperativeHandle, useRef, useEffect } from "react";
import { Table, useDataSet, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import querystring from 'querystring';
import { Badge } from 'choerodon-ui';

import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { tableDataSet } from './storeDs';

interface Props {
  rfxHeaderId: string;
  companyId: string;
  parentRef?: React.RefObject<any>;
  ds?: DataSet;
  readOnlyFlag?: boolean;
  dispatch?: (action: any) => void; // 添加 dispatch 属性
};

const TenderDocInspection: React.FC<Props> = (props) => {

  const {
    rfxHeaderId,
    parentRef = useRef(),
    readOnlyFlag = false,
    ds,
    companyId,
  } = props;

  if (!rfxHeaderId) {
    return null;
  };

  const tableDs = ds ? ds : useDataSet(() => tableDataSet(), [rfxHeaderId]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(parentRef, () => ({
    tableDs,
  }));

  useEffect(() => {
    if (readOnlyFlag) {
      tableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
      tableDs.query();
    }
  }, [readOnlyFlag, rfxHeaderId]);

  // 跳转供应商生命周期管理详情
  const directionSupplierLifeManagerDetail = (record) => {
    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } = record.get([
      'tenantId',
      'partnerCompanyId',
      'partnerTenantId',
      'spfmSupplierCompanyId',
      'spfmCompanyId',
      'supplierCompanyId',
    ]) || {};

    if (
      !companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId
    ) {
      return;
    }

    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };
    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };
    openTab({
      key: '/sslm/supplier-detail-new',
      path: '/sslm/supplier-detail-new',
      title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
      search: querystring.stringify(params),
      closable: true,
    }, {});
  }

  const tableColumns: ColumnProps[] = useMemo(() => [
    {
      name: 'sequence',
      width: 80,
    },
    {
      name: 'supplierCompanyNum',
      width: 120,
      renderer: ({ record, value }) => value ? <a onClick={() => directionSupplierLifeManagerDetail(record)}>{value}</a> : null,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    {
      name: 'contactName',
      width: 100,
    },
    {
      name: 'contactMobilephone',
      width: 130,
    },
    {
      name: 'repeatIpFlag',
      width: 110,
      renderer: ({ value }) =>
        value ? (
          <span>
            <Badge style={{ marginTop: '-2px' }} status={Number(value) ? 'error' : 'success'} />
            <span>
              {Number(value)
                ? intl.get(`hzero.common.model.yes`).d('是')
                : intl.get(`hzero.common.model.no`).d('否')}
            </span>
          </span>
        ) : value,
    },
    {
      name: 'attributeVarchar11',
      width: 100,
      editor: !readOnlyFlag,
    },
    {
      name: 'attributeLongtext11',
      editor: !readOnlyFlag,
    }
  ], [
    directionSupplierLifeManagerDetail,
  ]);

  return (
    <Table
      dataSet={tableDs}
      columns={tableColumns}
    />
  );
};

export default formatterCollections({
  code: [
    'scux.confirmationOfBiddingStatus',
    'ssrc.inquiryHall',
    'ssrc.common',
  ],
})(TenderDocInspection);