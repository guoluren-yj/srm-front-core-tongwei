import React, { useMemo } from 'react';
import { Table, Button, Switch } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { observer, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';

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
    return [
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
        hidden: !scoreWay,
        width: 100,
        renderer: ({ value }) => isNil(value) ? null : yesOrNoRender(value),
      },
      {
        name: 'invalidReason',
        hidden: !scoreWay,
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
        name: 'attributeVarchar2',
        width: 100,
        editor: () => <Switch />,
      },
      {
        name: 'attributeLongtext2',
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
