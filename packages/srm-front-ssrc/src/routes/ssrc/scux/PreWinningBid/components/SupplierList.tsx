import React, { useMemo } from 'react';
import { Table, Button, Switch, NumberField, Attachment } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { observer, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import useIPDetailModal from '@/routes/components/IPDetails';

import EvaluationDetailModal from '../../BidEvaluationManagement/SummaryDetail/components/EvaluationDetailModal';
import { useStore } from '../store/StoreProvider';

const { openIPDetailModal } = useIPDetailModal();

const { TabPane } = Tabs;

const SupplierList: React.FC = observer(() => {
  const {
    commonDs,
    customizeTable,
    customizeBtnGroup,
    rfxHeaderId,
    setStoreData,
  } = useStore();
  const { headerDs, supplierListDs } = commonDs || {};

  if (!supplierListDs) return null;

  const { scoreWay } = useObserver(() => headerDs?.current?.get(['scoreWay']) || {});

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  const directorQuotationDetail = (record) => {
    const { quotationHeaderId = null } = record.get(['quotationHeaderId']) || {};

    const searchObj = {
      rfxHeaderId,
      noBackFlag: 1, // openTab 不需要返回
      pageType: 'SUPPLIER_DETAIL_QUERY',
      switchUrl: 2, // 采购方跳转标识
    };

    const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
    openTab({
      key: path,
      path: path,
      title: 'hzero.common.tab.title.cux.twnf.tenderDetail',
      action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      search: querystring.stringify(searchObj),
      closable: true,
    }, undefined);
  };

  const columns: ColumnProps[] = useMemo(() => {
    // 无评分方式时 tabTitle 为「供应商列表」，仅该场景启用最终价编辑/同步与附件上传
    const isPlainSupplierList = !['10', '20', '30', '40'].includes(scoreWay);
    return [
      {
        name: 'attributeVarchar2',
        lock: true, // 拟定标列固定左侧
        width: 100,
        editor: () => <Switch />,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'bidDetail',
        width: 120,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            wait={1200}
            onClick={() => directorQuotationDetail(record)}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
          </Button>
        ),
      },
      {
        name: 'invalidFlag',
        hidden: true, // 综评结果默认隐藏，可通过右上角列设置放出
        width: 100,
        renderer: ({ value }) =>
          isNil(value)
            ? '-'
            : value === true || value === '1' || value === 1
            ? '无效'
            : '有效',
      },
      {
        name: 'invalidReason',
        hidden: true, // 综评说明默认隐藏，可通过右上角列设置放出
        width: 120,
      },
      {
        name: 'rank',
        hidden: !['10', '30'].includes(scoreWay),
        width: 130,
      },
      {
        name: 'businessReviewSum',
        hidden: scoreWay !== '30',
        width: 130,
      },
      {
        name: 'allScoreSum',
        hidden: !['10', '20', '40'].includes(scoreWay),
        renderer: ({ record, value }) => scoreWay === '10' && !isNil(value) ? <EvaluationDetailModal record={record} btnName={value} /> : value,
      },
      {
        name: 'sectionName',
        width: 120,
      },
      {
        name: 'sectionBidQtnTotalAmount',
        width: 130,
      },
      {
        name: 'sectionQtnTotalAmount',
        width: 130,
      },
      {
        name: 'bidQtnTotalAmount',
        width: 130,
      },
      {
        name: 'qtnTotalAmount',
        width: 130,
        // 仅"供应商列表"场景且行 barginFlag = '1' 时不可编辑，数字输入框，最大14位、最小0
        editor: (record) =>
          isPlainSupplierList && record.get('barginFlag') !== '1' ? (
            <NumberField name="qtnTotalAmount" record={record} min={0} max={99999999999999} precision={6} />
          ) : false,
      },
      {
        name: 'attributeLongtext9', // 最终价附件，仅"供应商列表"场景显示；attributeDecimal2（最终价）有值时必填，可上传附件
        width: 130,
        hidden: !isPlainSupplierList,
        editor: (record) => (
          <Attachment
            record={record}
            name="attributeLongtext9"
            viewMode="popup"
            funcType={FuncType.link}
          />
        ),
      },
      {
        name: 'techSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'businessSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'priceSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'allScoreSumTech',
        hidden: scoreWay !== '30',
        width: 120,
        renderer: ({ record }) => !isNil(record?.get('allScoreSum')) ? <EvaluationDetailModal record={record} btnName={record?.get('allScoreSum')} /> : null,
      },
      {
        name: 'attributeLongtext2',
        lock: ColumnLock.right, // 备注列冻结右侧
        minWidth: 150,
        editor: true,
      },
    ];
  }, [scoreWay]);

  const tabTitle = useMemo(() => {
    switch (scoreWay) {
      case '10':
        return intl.get('scux.preWinningBid.view.title.comprehensiveScore').d('综合评分法');
      case '30':
        return intl.get('scux.preWinningBid.view.title.techRankingBusiness').d('技术排名/商务符合法');
      case '20':
      case '40':
        return intl.get('scux.preWinningBid.view.title.reasonableLowPrice').d('合理低价法');
      default:
        return intl.get('scux.preWinningBid.view.title.supplierList').d('供应商列表');
    }
  }, [scoreWay]);

  const handleAttachmentTableRef = (ref: any) => {
    if (setStoreData) {
      setStoreData('fileTemplateAttachmentRef', ref);
    };
  };

  const handleViewIPDetail = () => {
    openIPDetailModal({
      rfxHeaderId,
    });
  };

  const tabBarExtraContent = useMemo(() => {
    return (
      <>
        <Button
          name="viewIPDetails"
          funcType={FuncType.link}
          icon="find_in_page"
          onClick={handleViewIPDetail}
          style={{ marginRight: '16px' }}
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情')}
        </Button>
      </>
    );
  }, [handleViewIPDetail]);

  const fileProps = useMemo(() => ({
    customizeTable,
    customizeBtnGroup,
    headerDS: headerDs,
    fileTemplateManageFlag: 1,
    rfxHeaderId,
    editorFlag: 1,
    bidFlag: true,
    onRef: handleAttachmentTableRef,
    unitCodeSymbol: 'oldUpdateOrApproval', // 个性化标识
    fileEditorFlag: true, // 附件表格列对齐招标文件及附件表格(文件编辑 OnlyOffice 在线编辑 / 附件模板 文案)
  }), [customizeTable, customizeBtnGroup, headerDs, rfxHeaderId, handleAttachmentTableRef]);

  return (
    <Tabs tabBarExtraContent={tabBarExtraContent}>
      <TabPane tab={tabTitle} key="supplierList">
        <Table
          dataSet={supplierListDs}
          columns={columns}
          border={false}
          customizedCode='SCUX_TONGWEI_PRE_WINNING_BID_SUPPLIER_LIST'
        />
      </TabPane>
      <TabPane forceRender tab={intl.get(`ssrc.common.view.attachmentTable`).d('附件表格')} key="attachmentTable">
        <FileTemplateAttachmentCheckPricePage {...fileProps} />
      </TabPane>
    </Tabs>
  );
});

export default SupplierList;
