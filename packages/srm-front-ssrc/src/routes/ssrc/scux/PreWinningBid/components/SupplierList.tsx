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
import SummaryDetailStoreProvider from '../../BidEvaluationManagement/SummaryDetail/store/StoreProvider';
import {
  SupplierList as ScoreDetailSupplierList,
} from '../../BidEvaluationManagement/SummaryDetail/components';
import { isRatingEnabled } from '../store/storeDS';
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
  const { headerDs, supplierListDs, sectionListDs } = commonDs || {};

  if (!supplierListDs || !sectionListDs) return null;

  const { scoreWay } = useObserver(() => headerDs?.current?.get(['scoreWay']) || {});

  // 通威二开 - 是否启用评标：templateScoreType 为 SCORE_NEW / WEIGHT 即启用了评标，
  // 此时才新增「评标明细」tab（内容同评标管理-评标明细供应商表）
  const ratingEnabled = useObserver(() => isRatingEnabled(headerDs?.current?.get('templateScoreType')));

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
      path,
      title: 'hzero.common.tab.title.cux.twnf.tenderDetail',
      action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      search: querystring.stringify(searchObj),
      closable: true,
    }, undefined);
  };

  // 无评分方式时 tabTitle 为「供应商列表」，仅该场景启用最终价编辑/同步与附件上传
  const isPlainSupplierList = !['10', '20', '30', '40'].includes(scoreWay);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      // {
      //   name: 'attributeVarchar2',
      //   lock: true, // 拟定标列固定左侧
      //   width: 100,
      //   editor: () => <Switch />,
      // },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      // {
      //   name: 'bidDetail',
      //   width: 120,
      //   renderer: ({ record }) => (
      //     <Button
      //       funcType={FuncType.link}
      //       wait={1200}
      //       onClick={() => directorQuotationDetail(record)}
      //     >
      //       {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
      //     </Button>
      //   ),
      // },
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
      // {
      //   name: 'sectionBidQtnTotalAmount',
      //   width: 130,
      // },
      // {
      //   name: 'sectionQtnTotalAmount',
      //   width: 130,
      // },
      {
        name: 'bidQtnTotalAmount',
        width: 130,
      },
      {
        name: 'qtnTotalAmount',
        width: 130,
        // 仅"供应商列表"场景且行 barginFlag = '1' 时不可编辑，数字输入框，最大14位、最小0
        // 金额保留两位小数（与字段 precision 保持一致），千分位/补零由字段的 numberGrouping、padDecimalZeros 继承
        editor: (record) =>
          isPlainSupplierList && record.get('barginFlag') !== '1' ? (
            <NumberField name="qtnTotalAmount" record={record} min={0} max={99999999999999} precision={2} />
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
      // {
      //   name: 'attributeLongtext2',
      //   lock: ColumnLock.right, // 备注列冻结右侧
      //   minWidth: 150,
      //   editor: true,
      // },
    ];
  }, [scoreWay]);

  // 通威二开 - 新「供应商列表」tab 的列，字段与标段列表对齐：
  // 推荐、供应商名称、投标详情、中标金额、投标价、最终价、备注，其中推荐（开关）/最终价/备注可编辑
  const supplierListColumns: ColumnProps[] = useMemo(() => [
    {
      name: 'attributeVarchar9', // 1-推荐，其余为不推荐
      width: 120,
      editor: () => <Switch />,
    },
    {
      name: 'supplierCompanyName',
      width: 150,
    },
    {
      name: 'bidDetail', // 虚列，仅用于承接投标详情跳转，逻辑与标段列表一致
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
      name: 'awardAmount',
      width: 130,
    },
    {
      name: 'bidQtnTotalAmount',
      width: 130,
    },
    {
      name: 'qtnTotalAmount',
      width: 130,
      // 最终价与下一列附件同属 getFinalPriceSyncFields 逻辑：未启用评标（ratingEnabled 为 false）时才启用，
      // 两者同进同退；启用评标时最终价只读，改由评标结果决定。
      // 此外仅行 barginFlag = '1'（议价中）时保持只读。
      // 数字输入框，最大14位、最小0，金额保留两位小数（与字段 precision 一致），
      // 千分位/补零由字段的 numberGrouping、padDecimalZeros 继承
      editor: (record) =>
        !ratingEnabled && record.get('barginFlag') !== '1' ? (
          <NumberField name="qtnTotalAmount" record={record} min={0} max={99999999999999} precision={2} />
        ) : false,
    },
    {
      name: 'attributeLongtext9', // 最终价附件，与最终价同组：未启用评标时才出现；
      // 最终价被改动过的行必填，见 storeDS 的 required
      width: 130,
      hidden: ratingEnabled,
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
      name: 'attributeLongtext22', // 备注（后端字段由 attributeLongtext2 变更为 attributeLongtext22）
      lock: ColumnLock.right, // 备注列冻结右侧
      minWidth: 150,
      editor: true,
    },
  ], [directorQuotationDetail, ratingEnabled]);

  // 通威二开 - 标段列表 tab 的列，数据取自接口的 sectionList
  const sectionColumns: ColumnProps[] = useMemo(() => [
    {
      name: 'attributeVarchar9', // 1-推荐，其余为不推荐
      width: 120,
      editor: () => <Switch />,
    },
    {
      name: 'attributeLongtext8',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 150,
    },
    {
      name: 'bidDetail', // 虚列，仅用于承接投标详情跳转，逻辑与供应商列表一致
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
      name: 'awardAmount',
      width: 130,
    },
    {
      name: 'quotationAmount',
      width: 130,
    },
    {
      name: 'finalAmount',
      width: 130,
    },
    {
      name: 'attributeLongtext2',
      lock: ColumnLock.right, // 备注列冻结右侧
      minWidth: 150,
      editor: true, // 备注可编辑，保存/提交时随 sectionList 一起下发
    },
  ], [directorQuotationDetail]);

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
        // 通威二开 - 「供应商列表」场景已抽成独立 tab，此处不再兜底该标题
        return '';
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

  // 通威二开 - 新增的 tab 单独一组，不再和旧 tab 混在同一个 Tabs 里
  const newTabPanes = [
    <TabPane
      tab={intl.get('scux.preWinningBid.view.title.sectionList').d('标段列表')}
      key="sectionList"
    >
      <Table
        dataSet={sectionListDs}
        columns={sectionColumns}
        border={false}
        customizedCode='SCUX_TONGWEI_PRE_WINNING_BID_SECTION_LIST'
      />
    </TabPane>,
    <TabPane
      tab={intl.get('scux.preWinningBid.view.title.supplierList').d('供应商列表')}
      key="supplierList"
    >
      <Table
        dataSet={supplierListDs}
        columns={supplierListColumns}
        border={false}
        // 与评分方式表列不同，单独一份列设置，避免两表共用 customizedCode 互相影响
        customizedCode='SCUX_TONGWEI_PRE_WINNING_BID_SUPPLIER_LIST_NEW'
      />
    </TabPane>,
    <TabPane forceRender tab={intl.get(`ssrc.common.view.attachmentTable`).d('附件表格')} key="attachmentTable">
      <FileTemplateAttachmentCheckPricePage {...fileProps} />
    </TabPane>,
  ];

  const oldTabPanes: React.ReactElement[] = [];
  // 旧 tab 保留：有评分方式时才展示（「供应商列表」场景已由上面的新 tab 承接）
  if (['10', '20', '30', '40'].includes(scoreWay)) {
    oldTabPanes.push(
      <TabPane tab={tabTitle} key="supplierListByScoreWay">
        <Table
          dataSet={supplierListDs}
          columns={columns}
          border={false}
          customizedCode='SCUX_TONGWEI_PRE_WINNING_BID_SUPPLIER_LIST'
        />
      </TabPane>
    );
  }
  // 通威二开 - 启用了评标才展示「评标明细」tab，复用评标管理-评标明细供应商表
  // if (ratingEnabled) {
    oldTabPanes.push(
      <TabPane
        tab={intl.get('scux.preWinningBid.view.title.evaluationDetail').d('评标明细')}
        key="evaluationDetail"
      >
        <SummaryDetailStoreProvider
          match={{ params: { rfxHeaderId, pageType: 'view' } }}
          location={{ pathname: '', search: '' }}
        >
          <ScoreDetailSupplierList />
        </SummaryDetailStoreProvider>
      </TabPane>
    );
  // }

  return (
    <>
      <Tabs style={{ marginBottom: '48px' }}>
        {newTabPanes}
      </Tabs>
      <Tabs tabBarExtraContent={tabBarExtraContent}>
        {oldTabPanes}
      </Tabs>
    </>
  );
});

export default SupplierList;
