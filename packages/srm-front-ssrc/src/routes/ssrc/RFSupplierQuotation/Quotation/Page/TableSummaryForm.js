import React, { memo, useMemo, useEffect, useLayoutEffect } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
// import { Popover, } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { math } from 'choerodon-ui/dataset';
import { noop, isNil, isEmpty } from 'lodash';

import { numberSeparatorRender } from '@/utils/renderer';
import { capitalAmount } from 'srm-front-boot/lib/utils/utils';

// import intl from 'utils/intl';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';
// import CollapseForm from '_components/CollapseForm';

import Styles from '../index.less';

// 币种字段是对象类型(valueField: currencyCode)，这里兼容对象与字符串两种取值
const getCurrencyCode = (value) =>
  value && typeof value === 'object' ? value.currencyCode : value;

// 通威二开 - 金额转中文大写
// 金额为空或为「***」(密封报价)时不做转换；超出大写转换上限(999999999999999.99)时兜底为 -
const getUpperCaseAmount = (value) => {
  if (isNil(value) || math.isNaN(value)) {
    return '-';
  }
  try {
    return capitalAmount(value);
  } catch (e) {
    return '-';
  }
};

const TableSummaryForm = observer((props) => {
  const {
    // customizeForm = noop,
    // customizeCollapseForm = noop,
    customizeCommon = noop,
    basicFormDS = {},
    summaryFormDS,
    // custLoading,
    // organizationId,
    getCustomizeUnitCode = () => {},
    // isBidSectionData,
    quotationRemote,
  } = props;

  let customizeHiddenTimer = null;

  const { quotationScope, priceTypeCode, currencyCode } = basicFormDS?.current
    ? basicFormDS.current.get(['quotationScope', 'priceTypeCode', 'currencyCode'])
    : {};

  const { quotationTotalAmount } = summaryFormDS?.current
    ? summaryFormDS.current.get(['quotationTotalAmount'])
    : {};

  const partQuotationFlag = useMemo(() => quotationScope === 'PART_QUOTATION', [quotationScope]);
  const isUnTaxPriceFlag = useMemo(() => priceTypeCode && priceTypeCode === 'NET_PRICE', [
    priceTypeCode,
  ]);
  // 通威二开 - 基础信息币种为人民币时，投标总金额带单位（元），且左侧展示投标总金额大写
  const isCNYFlag = useMemo(() => getCurrencyCode(currencyCode) === 'CNY', [currencyCode]);

  // 通威二开 - 投标总金额取值（净价时取不含税金额，与列表展示口径一致）
  const getCurrentTotalAmount = (record) => {
    const {
      quotationCurrentTotalAmount,
      quotationCurrentNetAmount,
      quotationCurrentTotalAmountValue,
      quotationCurrentNetAmountValue,
    } = record?.get
      ? record.get([
          'quotationCurrentTotalAmount',
          'quotationCurrentNetAmount',
          'quotationCurrentTotalAmountValue',
          'quotationCurrentNetAmountValue',
        ])
      : {};

    return isUnTaxPriceFlag
      ? quotationCurrentNetAmountValue ?? quotationCurrentNetAmount
      : quotationCurrentTotalAmountValue ?? quotationCurrentTotalAmount;
  };

  useEffect(() => {
    return () => {
      clearCustomizeHiddenTimer();
    };
  }, []);

  const clearCustomizeHiddenTimer = () => {
    if (customizeHiddenTimer) {
      clearTimeout(customizeHiddenTimer);
    }
  };

  const handlecustomizeHiddenTimer = () => {
    const container = document.querySelectorAll(
      '.ssrc-quotation-table-summary-form-wrap .c7n-pro-form .c7n-row>.c7n-col-6'
    );
    if (isEmpty(container)) {
      return;
    }

    // todo 临时方案
    for (const field of container) {
      if (field && isEmpty(field.children)) {
        if (field.style) {
          field.style.display = 'none';
        }
      }
    }
  };

  useLayoutEffect(() => {
    customizeHiddenTimer = setTimeout(handlecustomizeHiddenTimer, 2000);
  }, []);

  const renderCommonFields = ({ fieldLabel, fieldValue }) => {
    const currentFieldValue = fieldValue ?? '-';

    return (
      <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
        <span>{fieldLabel}：</span>
        <div className={Styles['table-summary-form-wrap-amount-wrap']}>
          <Tooltip title={currentFieldValue}>{currentFieldValue}</Tooltip>
        </div>
      </div>
    );
  };

  const fieldsConfigs = {
    rfxNumTitle: {
      hidden: true,
    },
    currentQuotationTotalCount: {
      useLabel: true,
      hidden: !partQuotationFlag,
      render: ({ record, name, dataSet }) => {
        const { currentQuotationTotalCount, currentQuotationTotalCountValue } = record?.get
          ? record.get(['currentQuotationTotalCount', 'currentQuotationTotalCountValue'])
          : {};

        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        let amount = currentQuotationTotalCountValue ?? currentQuotationTotalCount;
        if (isNil(amount)) {
          amount = '-';
        }

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            <span>{fieldLabel}：</span>
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amount}>{amount}</Tooltip>
            </div>
          </div>
        );
      },
    },
    currentTotalAmount: {
      useLabel: true,
      render: ({ record, name, dataSet }) => {
        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        const amount = getCurrentTotalAmount(record);

        // 通威二开 - 币种为人民币时补充单位（金额为空或为「***」时不补充）
        let amountText = numberSeparatorRender(amount);
        if (isCNYFlag && math.isValidNumber(amount)) {
          amountText = `${amountText}（元）`;
        }

        // 通威二开 - 人民币时在投标总金额左侧展示大写金额
        // 说明：1) 这里不单独占一个 normalFields 项，因为个性化(AF-BASIC)会用个性化字段列表整体覆盖
        //          normalFields，并入投标总金额的 render 才能保证无论是否有个性化配置都展示；
        //       2) 标签直接取投标总金额的 label 加「大写」，不走 intl——多语言里没有对应 key 时
        //          .d() 不会对 {quotationName} 做插值，会原样显示占位符
        const upperCaseLabel = `${fieldLabel}大写`;
        const upperCaseText = getUpperCaseAmount(amount);

        return (
          <>
            {isCNYFlag && (
              // 结构与相邻字段保持一致（inline-flex + align-items: center），保证两个金额在同一水平线上
              <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
                {upperCaseLabel}：
                <div className={Styles['table-summary-form-wrap-amount-wrap']}>
                  <Tooltip title={upperCaseText}>{upperCaseText}</Tooltip>
                </div>
              </div>
            )}
            {isCNYFlag && <span className={Styles['table-summary-fields-split']}>|</span>}
            <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
              {fieldLabel}：
              <div className={Styles['table-summary-form-wrap-amount-wrap']}>
                <Tooltip title={amountText}>{amountText}</Tooltip>
              </div>
            </div>
          </>
        );
      },
    },
    quotationLineNumber: {
      useLabel: true,
      hidden: !partQuotationFlag,
      render: ({ record, name, dataSet }) => {
        const { quotationLineNumber } = record?.get ? record.get(['quotationLineNumber']) : {};

        const amountText = numberSeparatorRender(quotationLineNumber);
        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            {fieldLabel}：
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amountText}>{amountText}</Tooltip>
            </div>
          </div>
        );
      },
    },
    quotationTotalAmount: {
      useLabel: true,
      hidden: isNil(quotationTotalAmount),
      render: ({ value, name, dataSet }) => {
        const amountText = numberSeparatorRender(value);
        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            {fieldLabel}：
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amountText}>{amountText}</Tooltip>
            </div>
          </div>
        );
      },
    },
  };

  const FieldConfigsObj = quotationRemote
    ? quotationRemote.process(
        'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_TABLE_SUMMARY_FORM_FIELDS_CONFIG',
        fieldsConfigs,
        {
          ...props,
          renderCommonFields,
        }
      )
    : fieldsConfigs;

  return (
    <div className={Styles['ssrc-quotation-table-summary-form-wrapper-new']}>
      {customizeCommon(
        {
          code: getCustomizeUnitCode('tableSummary'),
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={summaryFormDS}
          titleField="rfxNumTitle"
          tagFields={['biddingMode', 'currencyCode']}
          normalFields={[
            'currentQuotationTotalCount',
            // 通威二开 - 人民币时的大写金额由 currentTotalAmount 的 render 一并输出（见 fieldsConfigs）
            'currentTotalAmount',
            'quotationLineNumber',
            'quotationTotalAmount',
          ]}
          fieldsConfig={FieldConfigsObj}
        />
      )}
    </div>
  );

  // return (
  //   <div>
  //     {customizeCollapseForm(
  //       {
  //         code: getCustomizeUnitCode('tableSummary'),
  //         dataSet: summaryFormDS,
  //         gutter: 6,
  //       },
  //       <CollapseForm
  //         dataSet={summaryFormDS}
  //         labelLayout="horizontal"
  //         layout="none"
  //         showLines={1}
  //         columns={4}
  //         custLoading={custLoading}
  //         labelWidth={120}
  //         useColon={false}
  //         wrapperClassName="ssrc-quotation-table-summary-form-wrap"
  //         firstShowFields={[
  //           'currentQuotationTotalCount',
  //           'currentTotalAmount',
  //           'quotationLineNumber',
  //           'quotationTotalAmount',
  //         ]}
  //       >
  //         <Row gutter={6}>
  //           {partQuotationFlag ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output
  //                   name="currentQuotationTotalCount"
  //                   renderer={({ record }) => {
  //                     const {
  //                       currentQuotationTotalCount,
  //                       currentQuotationTotalCountValue,
  //                     } = record?.get
  //                       ? record.get([
  //                           'currentQuotationTotalCount',
  //                           'currentQuotationTotalCountValue',
  //                         ])
  //                       : {};

  //                     const amount = currentQuotationTotalCountValue ?? currentQuotationTotalCount;
  //                     if (isNil(amount)) {
  //                       return '-';
  //                     }

  //                     return (
  //                       <span>
  //                         {partQuotationFlag && !isBidSectionData
  //                           ? numberSeparatorRender(amount)
  //                           : '-'}
  //                       </span>
  //                     );
  //                   }}
  //                 />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //           <Col span={6}>
  //             <Form.Item>
  //               <Output
  //                 name="currentTotalAmount"
  //                 renderer={({ record }) => {
  //                   const {
  //                     quotationCurrentTotalAmount,
  //                     quotationCurrentNetAmount,
  //                     quotationCurrentTotalAmountValue,
  //                     quotationCurrentNetAmountValue,
  //                   } = record?.get
  //                     ? record.get([
  //                         'quotationCurrentTotalAmount',
  //                         'quotationCurrentNetAmount',
  //                         'quotationCurrentTotalAmountValue',
  //                         'quotationCurrentNetAmountValue',
  //                       ])
  //                     : {};

  //                   let amount = quotationCurrentTotalAmountValue ?? quotationCurrentTotalAmount;
  //                   if (isUnTaxPriceFlag) {
  //                     amount = quotationCurrentNetAmountValue ?? quotationCurrentNetAmount;
  //                   }

  //                   const amountText = numberSeparatorRender(amount);

  //                   return (
  //                     <div className={Styles['table-summary-form-wrap-amount-wrap']}>
  //                       <Popover content={amountText}>{amountText}</Popover>
  //                     </div>
  //                   );
  //                 }}
  //               />
  //             </Form.Item>
  //           </Col>

  //           {partQuotationFlag ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output name="quotationLineNumber" />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //           {!isNil(quotationTotalAmount) ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output
  //                   name="quotationTotalAmount"
  //                   renderer={({ value }) => {
  //                     const amountText = numberSeparatorRender(value);

  //                     return (
  //                       <div className={Styles['table-summary-form-wrap-amount-wrap']}>
  //                         <Popover content={amountText}>{amountText}</Popover>
  //                       </div>
  //                     );
  //                   }}
  //                 />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //         </Row>
  //       </CollapseForm>
  //     )}
  //   </div>
  // );
});

export default memo(TableSummaryForm);
