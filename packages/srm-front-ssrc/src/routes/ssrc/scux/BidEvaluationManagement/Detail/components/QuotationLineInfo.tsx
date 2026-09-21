import React, { useEffect, useMemo, useState } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import remote from 'hzero-front/lib/utils/remote';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { isText } from '@/utils/utils';
import { getDocumentTypeName, getQuotationName } from '@/utils/globalVariable';
import { queryEnableDoubleUnit } from '@/services/commonService';
import QuotationLineTable from '@/routes/ssrc/RFSupplierQuotation/QueryDetail/Page/QuotationLineTable';
import { quotationLineDataSet } from '@/routes/ssrc/RFSupplierQuotation/QueryDetail/Stores/quotationLineDataSet';

import CommonLevel from '../../../components/SecLevelTitle/CommonLevel';

// 类型断言，解决组件 Props 类型缺失导致的报错（QuotationLineTable 为 js 组件）
const TypedQuotationLineTable: React.ComponentType<any> = QuotationLineTable;

// 通威二开 - 投标详情（QueryDetail，bidFlag 场景）使用的个性化单元编码。
// 评标管理-价格组详情的「报价行信息」要与投标详情展示完全一致的列，
// 必须走同一套个性化配置，否则会退化成 QuotationLineTable 里写死的全量列
const CUSTOMIZE_UNIT_CODES = {
  table: 'SSRC.SUPPLIER_QUERY_BID.APPLY_LINE_BID',
  history: 'SSRC.SUPPLIER_QUERY_BID.LINE_HISTORY_BID', // 报价行-报价历史
};

const getCustomizeUnitCode = (type = 'table') => CUSTOMIZE_UNIT_CODES[type];

// QuotationLineTable 内部用 customizeTable 包了一层表格，默认值是 noop（返回 undefined，
// 会导致表格整体不渲染）。个性化 HOC 未注入时兜底为直接返回原始表格
const passThroughCustomizeTable = (_config: any, table: React.ReactNode) => table;

interface QuotationLineInfoProps {
  /** 招标头 id */
  rfxHeaderId?: string;
  /** 报价头 id */
  quotationHeaderId?: string;
  /** 个性化 HOC 注入 */
  customizeTable?: (config: any, table: React.ReactNode) => React.ReactNode;
  /** 个性化 HOC 注入 */
  custLoading?: boolean;
  /** remote HOC 注入 */
  quotationRemote?: {
    process: (code: string, target: any, ...args: any[]) => any;
  };
}

/**
 * 评标管理-详情（价格组）：「报价行信息」只读表格
 * 复用投标详情（QueryDetail）的表格、数据集与个性化配置，保证列与数据口径完全一致
 */
const QuotationLineInfo: React.FC<QuotationLineInfoProps> = ({
  rfxHeaderId,
  quotationHeaderId,
  customizeTable = passThroughCustomizeTable,
  custLoading,
  quotationRemote,
}) => {
  const organizationId = getCurrentOrganizationId();
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);

  const quotationLineDS = useMemo(() => {
    // 类型断言：quotationLineDataSet 为 js 模块，推断出的字段类型与 DataSetProps 的枚举不兼容
    const lineDataSetProps: any = quotationLineDataSet({
      bidFlag: 1, // 评标管理为招标场景
      documentTypeName: getDocumentTypeName(1),
      quotationName: getQuotationName(1),
      switchUrl: 2, // 采购方跳转标识，与投标详情一致
      pageType: 'SUPPLIER_DETAIL_QUERY',
    });
    return new DataSet(lineDataSetProps);
  }, []);

  useEffect(() => {
    if (!rfxHeaderId || !quotationHeaderId) {
      return;
    }
    // 双单位是否开启，与投标详情一致（开启时展示辅助单价相关列）
    queryDoubleUnit();
    quotationLineDS.setQueryParameter('commonProps', {
      organizationId,
      rfxHeaderId,
      quotationHeaderId,
      // 与投标详情一致，告知后端返回该个性化单元对应的（含扩展字段的）报价行数据
      customizeUnitCode: getCustomizeUnitCode('table'),
    });
    quotationLineDS.query();
  }, [rfxHeaderId, quotationHeaderId]);

  const queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({ businessModule: 'RFX' });
    if (isText(res)) {
      const flag = !!Number(res);
      quotationLineDS.setState('doubleUnitFlag', flag);
      setDoubleUnitFlag(flag);
    }
  };

  return (
    <div>
      <CommonLevel
        title={intl.get('ssrc.common.quotationLineInfomations').d('报价行信息')}
        style={{ fontSize: '.14rem', fontWeight: '600', marginBottom: '8px' }}
      />
      <TypedQuotationLineTable
        quotationLineDS={quotationLineDS}
        organizationId={organizationId}
        doubleUnitFlag={doubleUnitFlag}
        pageType="SUPPLIER_DETAIL_QUERY"
        bidFlag={1}
        customizeTable={customizeTable}
        custLoading={custLoading}
        getCustomizeUnitCode={getCustomizeUnitCode}
        quotationName={getQuotationName(1)}
        quotationRemote={quotationRemote}
      />
    </div>
  );
};

export default WithCustomizeC7N({
  unitCode: [
    CUSTOMIZE_UNIT_CODES.table,
    CUSTOMIZE_UNIT_CODES.history,
  ],
})(
  remote({ code: 'SSRC_SUPPLIER_QUOTATION_NEW_QUERY', name: 'quotationRemote' })(
    observer(QuotationLineInfo)
  )
);
