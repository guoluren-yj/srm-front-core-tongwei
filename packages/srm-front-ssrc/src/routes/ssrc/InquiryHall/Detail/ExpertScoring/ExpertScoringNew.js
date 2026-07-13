/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看-专家评分进度条
 * @date: 2022-02-07
 * @author: Goku <xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2022, Zhen Yun
 */

import React, { PureComponent } from 'react';
import { Table, Tabs, Tag, Tooltip } from 'hzero-ui';
import { isEmpty, noop, find } from 'lodash';
import { Output, DataSet } from 'choerodon-ui/pro';
import { toJS } from 'mobx';
import classnames from 'classnames';

import { Content } from 'components/Page';
import { tableScrollWidth, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import CollapseForm from '_components/CollapseForm';

import ScoringDetail from '@/routes/components/ScoringDetail';
import CPopover from '@/routes/components/CPopover/';

import { fetchExpertScoreDetails } from '@/services/expertScoringService';
import { fetchEvaluateSummary } from '@/services/inquiryHallService';
import { INQUIRY } from '@/utils/globalVariable';

import maintainStyles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import detailStyles from '../index.less';

import { basicFormDS } from './store/storeDS';
import BidScoreModule from './BidScoreModule';

export default class ExpertScoring extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      bidSectionList: {},
      supplierList: [],
    };
  }

  basicFormDs = new DataSet(basicFormDS());

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { sourceHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { sourceHeaderId = null } = this.props;
    const RefreshFlag = sourceHeaderId && prevRfxHeaderId && prevRfxHeaderId !== sourceHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPageMain();
  }

  // 查询头/行
  fetchPageMain = async () => {
    await this.fetchExpertScoreDetails();
    this.fetchEvaluateSummary();
  };

  async fetchExpertScoreDetails() {
    const { sourceHeaderId, organizationId, rfx = {}, pubRouterAddParams = () => {} } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await fetchExpertScoreDetails({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT_SCORE_BASEINFO`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      this.basicFormDs.loadData([data]);
    } catch (e) {
      throw e;
    }
  }

  async fetchEvaluateSummary(page = {}) {
    const { sourceHeaderId, organizationId, pubRouterAddParams = () => {} } = this.props;

    try {
      let data = await fetchEvaluateSummary({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        page,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      data = this.addDataStateForBidSectionList(data);
      this.setState({
        bidSectionList: data,
        supplierList: data.supplierList,
      });
    } catch (e) {
      throw e;
    }
  }

  addDataStateForBidSectionList(data = {}) {
    const mapData = data.evaluateSummaryMap || {};

    const { supplierList = [] } = this.generateDataSource() || {};

    Object.keys(mapData).forEach((item) => {
      if (!Array.isArray(mapData[item]) || !mapData[item].length) {
        return;
      }

      // 遍历key时, 需要把supplierList数据加入
      // 从根据主键id 从supplierList集合中查找对应数据 组装新数据evaluateSummaryMap
      const subConfig = mapData[item].map((child) => {
        // 每一个供应商 映射取值外层 `supplierList`
        let childMappingSupplier;
        if (child.supplierCompanyId) {
          childMappingSupplier = find(
            supplierList,
            (supplier) => child.supplierCompanyId === supplier.supplierCompanyId
          );
        } else {
          childMappingSupplier = find(
            supplierList,
            (supplier) => child.quotationHeaderId === supplier.quotationHeaderId
          );
        }
        return {
          ...childMappingSupplier,
          ...child,
          supplierCompanyNum: childMappingSupplier?.supplierCompanyNum,
          _status: 'update',
        };
      });

      mapData[item] = subConfig;
    });

    return {
      ...data,
      evaluateSummaryMap: mapData,
      supplierList,
    };
  }

  /**
   * 金额千分隔
   *
   * @param {*} val
   * @returns
   * @memberof BidSectionTable
   */
  thousandDivider(val) {
    if (!val || val === '－') {
      return '--';
    }

    const num = parseFloat(val).toLocaleString();
    return num;
  }

  renderFormContent() {
    const { customizeCollapseForm = noop, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;
    const { current } = this.basicFormDs;
    const { secondarySourceCategoryMeaning, sourceCategoryMeaning } =
      current?.get(['secondarySourceCategoryMeaning', 'sourceCategoryMeaning']) || {};

    return customizeCollapseForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.EXPERT_SCORE_BASEINFO`,
        dataSet: this.basicFormDs,
        showLines: 2,
      },
      <CollapseForm
        dataSet={this.basicFormDs}
        columns={3}
        showLines={2}
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
        useWidthPercent
      >
        <Output name="companyName" />
        <Output
          name="sourceCategoryMeaning"
          renderer={() => secondarySourceCategoryMeaning || sourceCategoryMeaning}
        />
        <Output name="sourceMethodMeaning" />
        <Output name="expertScoreTypeMeaning" />
        <Output name="openBidOrderMeaning" />
      </CollapseForm>
    );
  }

  renderHeaderForm() {
    return (
      <Content className={maintainStyles['custom-page-content']}>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`ssrc.expertScoring.view.title.basicInfo`).d('基本信息')}
        </h3>
        {this.renderFormContent()}
      </Content>
    );
  }

  renderScoringDetail(scoringDetailProps, record, val) {
    const {
      fieldData: { team = '', evaluateExpertId = null },
    } = scoringDetailProps;

    return (
      <ScoringDetail
        {...scoringDetailProps}
        recordData={record}
        text={val}
        redFlag={record[`${team}${evaluateExpertId}Score`] === 'UN_PASS'}
      />
    );
  }

  // 整合动态列
  generateDynamicColumns(evaluateExpertsColumnsData = []) {
    const { current } = this.basicFormDs;
    const { customizeCollapseForm = noop, rfx = {}, remote } = this.props;
    const { sourceKey = INQUIRY } = rfx;
    if (!Array.isArray(evaluateExpertsColumnsData) || isEmpty(evaluateExpertsColumnsData)) {
      return [];
    }

    const RelativeColumns = evaluateExpertsColumnsData.map((item) => {
      const { evaluateExpertId = null, expertName = null, team = '' } = item || {};
      const scoringDetailProps = {
        remote,
        sourceKey,
        customizeCollapseForm,
        displayType: 'text',
        headerData: current,
        fieldData: {
          team,
          expertName,
          evaluateExpertId,
        },
      };
      return {
        title: expertName,
        dataIndex: `${team}${evaluateExpertId}`,
        width: 150,
        align: 'right',
        render: (val, record) => {
          return !['ALL_PASS', 'PART_PASS', 'UN_PASS'].includes(
            record[`${team}${evaluateExpertId}Score`]
          ) && isNaN(Number(val))
            ? val
            : this.renderScoringDetail(scoringDetailProps, record, val);
        },
      };
    });

    return RelativeColumns;
  }

  // 评分明细动态列 eg: 区分商务技术 - 商务组/技术组; 不区分商务技术
  scoringDetaiDynamiclColumns() {
    const {
      remote,
      rfx: { bidFlag = false },
    } = this.props;
    const { bidSectionList = {} } = this.state;
    const { businessWeight = null, technologyWeight = null } = bidSectionList || {};
    const { current } = this.basicFormDs;
    const { evaluateExperts = {}, firstTeam = null, preEvaluationFlag, templateScoreType } =
      current?.get(['evaluateExperts', 'firstTeam', 'preEvaluationFlag', 'templateScoreType']) ||
      {};
    const evaluateExpertsData = toJS(evaluateExperts);
    if (isEmpty(evaluateExpertsData)) {
      return [];
    }

    const { BUSINESS_TECHNOLOGY = [], BUSINESS = [], TECHNOLOGY = [] } = evaluateExpertsData;

    let NoneColumns = this.generateDynamicColumns(BUSINESS_TECHNOLOGY);
    let BusinessColumns = this.generateDynamicColumns(BUSINESS);
    let TechnologyColumns = this.generateDynamicColumns(TECHNOLOGY);

    // 不区分商务技术组
    NoneColumns = !isEmpty(NoneColumns) ? NoneColumns : null;

    // 区分商务技术组
    BusinessColumns = !isEmpty(BusinessColumns)
      ? {
          title: (
            <div>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.businessTeam`).d('商务组')}
              {remote
                ? remote.process(
                    'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORING_BUSINESS',
                    !!preEvaluationFlag &&
                      !!Object.keys(bidSectionList.evaluateSummaryMap || {}).length &&
                      templateScoreType !== 'SCORE_NEW' &&
                      (businessWeight ? `(${businessWeight}%)` : '(0%)'),
                    {
                      preEvaluationFlag,
                      bidSectionList,
                      businessWeight,
                      bidFlag,
                      basicFormDs: this.basicFormDs,
                    }
                  )
                : !!preEvaluationFlag &&
                  !!Object.keys(bidSectionList.evaluateSummaryMap || {}).length &&
                  templateScoreType !== 'SCORE_NEW' &&
                  (businessWeight ? `(${businessWeight}%)` : '(0%)')}
            </div>
          ),
          children: BusinessColumns,
        }
      : null;
    TechnologyColumns = !isEmpty(TechnologyColumns)
      ? {
          title: (
            <div>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyTeam`).d('技术组')}
              {!!preEvaluationFlag &&
                !!Object.keys(bidSectionList.evaluateSummaryMap || {}).length &&
                templateScoreType !== 'SCORE_NEW' &&
                (technologyWeight ? `(${technologyWeight}%)` : '(0%)')}
            </div>
          ),
          children: TechnologyColumns,
        }
      : null;
    const DiffColumns =
      firstTeam === 'TECHNOLOGY'
        ? [].concat(TechnologyColumns, BusinessColumns)
        : [].concat(BusinessColumns, TechnologyColumns);

    return [].concat(NoneColumns, DiffColumns).filter(Boolean);
  }

  generateDataSource() {
    const { current } = this.basicFormDs;
    const supplierList = toJS(current?.get('supplierList'));
    if (!supplierList) {
      return {};
    }
    // 打平分数细项 到供应商行上
    const NewSupplierList = supplierList.map((item = {}) => {
      const { scoreDetails = [] } = item;
      if (!scoreDetails) {
        return item;
      }
      const scoreDetailCollect = {};
      const NewScoreDetails = scoreDetails.map((scoreItem = {}) => {
        const {
          team = null,
          evaluateExpertId = null,
          sumScore = null,
          sumScoreMeaning = null,
          evaluateScoreId,
        } = scoreItem;
        scoreDetailCollect[`${team}${evaluateExpertId}Score`] = sumScore;
        scoreDetailCollect[`${team}${evaluateExpertId}`] = sumScoreMeaning;
        scoreDetailCollect[`${team}${evaluateExpertId}evaluateScoreId`] = evaluateScoreId;

        return {
          ...scoreItem,
        };
      });

      return {
        ...item,
        ...scoreDetailCollect,
        scoreDetails: NewScoreDetails,
      };
    });

    return {
      supplierList: NewSupplierList,
    };
  }

  scoringDetail() {
    const { current } = this.basicFormDs;
    if (isEmpty(current)) {
      return;
    }

    const { supplierList = [] } = this.generateDataSource() || {};
    const Columns = this.scoringDetaiDynamiclColumns();
    const scrollX = tableScrollWidth(Columns);

    return (
      <Table
        bordered
        rowKey="quotationHeaderId"
        scroll={{ x: scrollX }}
        dataSource={supplierList}
        columns={Columns}
        pagination={false}
      />
    );
  }

  // 渲染表格
  renderTable({ dataSource = [] }) {
    const { bidSectionList = {} } = this.state;
    const {
      remote,
      quotationDetailFieldVisible,
      directorQuotationDetail = () => {},
      openScoreDetailModal = () => {},
      rfx: { quotationName, bidFlag = false },
      disabledAllLinkFlag = false,
      header,
    } = this.props;

    // 仅当登录子账户=当前询价单维护技术专家，且无其他角色（商务技术、商务专家无影响；不处理技术专家为评分负责人、核价员等寻源小组中任何一个成员的时候都不处理），隐藏报价详情/投标详情
    const { currentUserIsOnlyTechnologyExpertFlag } = header || {};

    const { current } = this.basicFormDs;
    const { bidRuleType = '', preEvaluationFlag } =
      current?.get?.(['bidRuleType', 'preEvaluationFlag']) || {};

    // 【报价详情】列是否显示
    const quotationNumColumnVisible = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORING_RESULT_TABLE_QUOTATION_NUM_COLUMN_VISIBLE',
          quotationDetailFieldVisible,
          {
            bidFlag,
          }
        )
      : quotationDetailFieldVisible;

    const preColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 180,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val, record) => (
          <div style={{ display: 'flex' }}>
            <CPopover content={val}>{val}</CPopover>
            {record?.eliminateFlag === 1 ? (
              <Tag
                style={{
                  background: '#868D9C',
                  color: 'white',
                  marginLeft: '10px',
                  borderRadius: '5px',
                }}
              >
                {intl.get(`ssrc.common.view.status.allEliminate`).d('全部淘汰')}
              </Tag>
            ) : null}
          </div>
        ),
      },
      // 该列被【海亮教育】【三宁化工】二开，请勿修改字段名
      quotationNumColumnVisible &&
        !currentUserIsOnlyTechnologyExpertFlag && {
          title: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
              quotationName,
            })
            .d('{quotationName}详情'),
          dataIndex: 'quotationNum',
          width: 100,
          render: (_, record) =>
            record?.supplierCompanyId ? (
              <a onClick={() => directorQuotationDetail(record)} disabled={disabledAllLinkFlag}>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
                    quotationName,
                  })
                  .d('{quotationName}详情')}
              </a>
            ) : (
              '-'
            ),
        },
      quotationDetailFieldVisible && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.recommend`).d('推荐'),
        dataIndex: 'candidateFlag',
        width: 80,
        render: yesOrNoRender,
      },
      quotationDetailFieldVisible && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateReason`).d('推荐理由'),
        dataIndex: 'candidateSuggestion',
        width: 280,
      },
      /** ********* 协鑫二开总分-勿动!!! *********** */
      quotationDetailFieldVisible && {
        title: dataSource[0]?.sumPassStatus
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringResult`).d('打分结果')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.totalScore`).d('总分'),
        dataIndex: 'score',
        width: 120,
        align: 'right',
        render: (val, record) => (
          <a onClick={() => openScoreDetailModal(record)}>{record.sumPassStatus || val}</a>
        ),
      },
      ...this.scoringDetaiDynamiclColumns(),
      // 该列被【绝味】【山鹰】二开，请勿修改字段名
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotation`, { quotationName })
          .d('无效{quotationName}'),
        dataIndex: 'invalidFlag',
        width: 100,
        render: (val) => {
          return val ? intl.get(`ssrc.inquiryHall.model.inquiryHall.invalid`).d('无效') : '-';
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotationReason`, { quotationName })
          .d('无效{quotationName}原因'),
        dataIndex: 'invalidReason',
        width: 100,
        render: (val) =>
          val ? (
            <Tooltip title={val} placement="leftTop">
              {val}
            </Tooltip>
          ) : (
            '-'
          ),
      },
    ].filter(Boolean);

    const processProps = {
      bidSectionList,
      bidFlag,
      bidRuleType,
      preEvaluationFlag,
      quotationDetailFieldVisible,
      basicFormDs: this.basicFormDs,
    };

    const columns = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SCORING_RESULT_TABLE_COLUMNS',
          preColumns,
          processProps
        )
      : preColumns;
    const scrollX = tableScrollWidth(columns);

    return (
      <Table
        bordered
        rowKey="evaluateSummaryId"
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    );
  }

  /**
   * 渲染评分结果
   */
  renderScoringResultWrap() {
    const {
      rfx: { bidFlag = false },
      sourceHeaderId,
    } = this.props;
    const { bidSectionList = {}, supplierList = [] } = this.state;
    const { current } = this.basicFormDs;
    const preEvaluationFlag = current?.get('preEvaluationFlag');

    if (bidFlag) {
      const bidScoreModuleProps = {
        rfxHeaderId: sourceHeaderId,
      };
      return <BidScoreModule {...bidScoreModuleProps} />;
    }

    return (
      <Content>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`ssrc.expertScoring.view.title.scoringResult`).d('评分结果')}
        </h3>
        {preEvaluationFlag && Object.keys(bidSectionList.evaluateSummaryMap || {}).length ? (
          <div>
            {bidSectionList.sectionFlag ? (
              <Tabs animated={false}>
                {Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                  <Tabs.TabPane forceRender key={item} tab={item}>
                    {this.renderTable({
                      dataSource: bidSectionList.evaluateSummaryMap[item] || [],
                    })}
                  </Tabs.TabPane>
                ))}
              </Tabs>
            ) : (
              <div>
                {Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                  <div key={item}>
                    {this.renderTable({
                      dataSource: bidSectionList.evaluateSummaryMap[item] || [],
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // foolish design
          <div>
            {this.renderTable({
              dataSource: supplierList,
            })}
          </div>
        )}
      </Content>
    );
  }

  render() {
    const { isSection = false } = this.props;
    return (
      <div
        className={classnames(
          'ued-detail-wrapper',
          maintainStyles['update-container'],
          detailStyles['rfx-detail-new-conteiner']
        )}
        style={isSection ? {} : { height: 'initial' }}
      >
        <div className={maintainStyles['ued-detail-container']}>
          <div className={maintainStyles['rfx-detail-list-card']}>
            {this.renderHeaderForm()}
            {this.renderScoringResultWrap()}
          </div>
        </div>
      </div>
    );
  }
}
