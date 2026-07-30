import React, { useMemo, useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { omit } from 'lodash';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import withProps from 'utils/withProps';
import { downloadFileByAxios } from 'srm-front-boot/lib/services/MarmotDownloadButtonServices';

import { tableDataSet } from './storeDs';
import { timeFilerProcess } from '../utils/fun';
import TechnicalSummary from './Detail/components/TechnicalSummary';

const { TabPane } = Tabs;

// 用户个性化编码
const customizedCodes = {
  toBeEvaluated: 'SCUX_TWNF_BID_EVALUATION_TO_BE_EVALUATED_LIST',
  historyEvaluated: 'SCUX_TWNF_BID_EVALUATION_HISTORY_LIST',
  evaluationSummary: 'SCUX_TWNF_BID_EVALUATION_SUMMARY_LIST',
};

// 1. 定义 Ref 的类型接口
interface SearchRefType {
  customizeDs?: DataSet;
}

const Index: React.FC<any> = (props) => {

  const {
    history,
    toBeEvaluatedDs,
    historyEvaluatedDs,
    evaluationSummaryDs,
    location: { search = '' } = {},
  } = props;

  const {
    positionTab, // 需要定位的tab
    sourceNum, // 来源编号
  } = querystring.parse(search?.substr(1));

  const [activeKey, setActiveKey] = useState('toBeEvaluated');
  const searchRef = useRef<SearchRefType>(null);

  useEffect(() => {
    if (positionTab) {
      // @ts-ignore
      setActiveKey(positionTab);
    };
    if (sourceNum && searchRef && searchRef.current && searchRef.current.customizeDs) {
      if (!searchRef.current.customizeDs?.current) {
        searchRef.current.customizeDs.create({});
        // @ts-ignore
        searchRef.current.customizeDs.current.init({ numOrTitle: [sourceNum] })
      } else {
        searchRef.current.customizeDs.current.set('numOrTitle', sourceNum);
      };
    }
  }, [positionTab, sourceNum, searchRef?.current?.customizeDs]);

  // 评标
  const handleEvaluate = (record) => {
    const { evaluateScoreId } = record.get(['evaluateScoreId']);
    if (!evaluateScoreId) return;
    history.push({
      pathname: `/scux/ssrc/bid-evaluation-management/evaluation/tech/${evaluateScoreId}`,
    });
  };

  // 查看评标
  const handleViewEvaluation = (record) => {
    const { evaluateScoreId } = record.get(['evaluateScoreId']);
    if (!evaluateScoreId) return;
    history.push({
      pathname: `/scux/ssrc/bid-evaluation-management/evaluation/view/${evaluateScoreId}`,
    });
  };

  // 技术综评
  const handleTechnicalSummary = (record) => {
    const { evaluateSummaryId } = record.get(['evaluateSummaryId']);
    if (!evaluateSummaryId) return;
    // 修复：使用 let 声明变量，以允许在初始化之前引用（尽管是在同一语句中，但 JS 引擎处理对象字面量时变量已提升但未初始化，使用 let 并在下一行赋值可避免 TDZ 错误，或者更准确地说，是将声明和赋值分开）
    // 注意：Modal.open 是同步执行的，children 中的 techModal 引用在运行时才会被访问（当 React 渲染该元素时），此时 techModal 已经被赋值。
    let techModal: any;
    techModal = Modal.open({
      title: intl.get('scux.bidEvaluationManagement.view.title.technicalSummary').d('技术综评'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      footer: null,
      style: {
        width: 800,
      },
      children: <TechnicalSummary modal={techModal} listDS={toBeEvaluatedDs} evaluateSummaryId={evaluateSummaryId} />,
    });
  };

  // 评标汇总
  const handleEvaluationSummary = ({ record, type }) => {
    const { rfxHeaderId } = record.get(['rfxHeaderId']);
    if (!rfxHeaderId) return;
    history.push({
      pathname: `/scux/ssrc/bid-evaluation-management/summary/${type === 'viewSummary' ? 'view' : 'update'}/${rfxHeaderId}`,
    });
  };

  // 列表按钮
  const getListButtons = ({ record, tabKey }) => {
    const scoreStatus = record.get('scoreStatus');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    };

    // 修复：显式声明数组类型，避免 TS 推断为 never[]
    const buttons: React.ReactNode[] = [];

    // 评标：专家评分状态为「待评标」
    if (tabKey === 'toBeEvaluated' && scoreStatus === 'UNSCORE') {
      buttons.push(
        <Button {...commonButtonsProps} onClick={() => handleEvaluate(record)}>
          {intl.get('scux.bidEvaluationManagement.view.button.evaluate').d('评标')}
        </Button>
      );
    };

    // 技术综评：评分状态为「评标中」，专家评分状态「待技术综评」
    if (tabKey === 'toBeEvaluated' && scoreStatus === 'TECHSCORING') {
      buttons.push(
        <Button {...commonButtonsProps} onClick={() => handleTechnicalSummary(record)}>
          {intl.get('scux.bidEvaluationManagement.view.button.technicalSummary').d('技术综评')}
        </Button>
      );
    };

    // 查看评标：评分状态为「评标中」，专家评分状态「已评标」或者已评标或者待技术综评或者评标历史页签
    if ((tabKey === 'toBeEvaluated' && ['SCORED', 'TECHSUMMED', 'TECHSCORING'].includes(scoreStatus)) || tabKey === 'historyEvaluated') {
      buttons.push(
        <Button {...commonButtonsProps} onClick={() => handleViewEvaluation(record)}>
          {intl.get('scux.bidEvaluationManagement.view.button.viewEvaluation').d('查看评标')}
        </Button>
      );
    };

    // 评标汇总：评分状态为「待汇总」
    if (tabKey === 'evaluationSummary' && scoreStatus === 'SUMMING') {
      buttons.push(
        <Button {...commonButtonsProps} onClick={() => handleEvaluationSummary({ record, type: 'summary' })}>
          {intl.get('scux.bidEvaluationManagement.view.button.evaluationSummary').d('评标汇总')}
        </Button>
      );
    };

    // 评标汇总页签显示-评标明细查看
    if (tabKey === 'evaluationSummary') {
      buttons.push(
        <Button {...commonButtonsProps} onClick={() => handleEvaluationSummary({ record, type: 'viewSummary' })}>
          {intl.get('scux.bidEvaluationManagement.view.button.viewEvaluationProcess').d('评标进度查看')}
        </Button>
      );
    };

    return buttons.length > 0 ? buttons : null;
  };

  // 跳转招标单明细页面
  const handleJumpBidDetail = (record) => {
    if (!record) return;
    const { rfxHeaderId } = record.get(['rfxHeaderId']) || {};
    if (!rfxHeaderId) return;
    history.push({
      pathname: `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`,
      search: querystring.stringify({
        rfxHeaderId,
        sourceCategory: 'RFQ',
      }),
    });
  };

  // 获取列
  const getColumns = (tabKey: string): ColumnProps[] => {
    return [
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        width: 150,
        renderer: ({ record }) => getListButtons({ record, tabKey }),
      },
      tabKey === 'historyEvaluated' ? {
        name: 'scoreStatus',
        width: 100,
        renderer: () => {
          return intl.get('scux.bidEvaluationManagement.model.workbench.scored').d('已评分');
        },
      } :{
        name: 'scoreStatus',
        width: 100,
      },
      {
        name: 'rfxNum',
        width: 150,
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleJumpBidDetail(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'rfxTitle',
        width: 180,
      },
      {
        name: 'scoreTeam',
        width: 120,
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'attributeLongtext20',
        width: 100,
      },
      {
        name: 'scoreWay',
        width: 120,
      },
      {
        name: 'attributeVarchar12',
        width: 120,
      },
      {
        name: 'inquiryByName',
        width: 120,
      },
      {
        name: 'techLeaderName',
        width: 120,
      },
      {
        name: 'roundNumber',
        width: 80,
      },
      {
        name: 'versionNumber',
      },
    ];
  };

  // 表格
  const getTableComponent = ({ tabKey, tableDs }) => {
    return (
      <FilterBarTable
        columns={getColumns(tabKey)}
        dataSet={tableDs}
        border={false}
        cacheState
        filterBarRef={(ref) => {
          if (ref) {
            (searchRef as React.MutableRefObject<SearchRefType | null>).current = ref;
          }
        }}
        filterBarConfig={{
          cacheKey: `cux_${tabKey}_bidEvaluationManagement_list`,
          autoQuery: true,
          left: {
            render: (ds) => {
              if (ds && (!ds.getField('numOrTitle') || !ds.getField('numOrTitle')?.get('transformRequest'))) {
                ds.addField('numOrTitle', {
                  transformRequest: (value) => {
                    if (value) {
                      return value.join(',');
                    }
                    return '';
                  },
                });
              };
              return (
                <MultipleTextSplitInput
                  name="numOrTitle"
                  dataSet={ds}
                  placeholder={intl
                    .get('scux.bidEvaluationManagement.view.placeholder.multiBidNumOrName')
                    .d('招标编号，项目名称')}
                  style={{ width: '3rem' }}
                />
              );
            },
          },
        }}
        customizable
        customizedCode={customizedCodes[tabKey]}
      />
    );
  };

  // 获取tab展示标识
  const tabs = useMemo(() => {
    return [
      {
        key: 'toBeEvaluated',
        title: intl.get('scux.bidEvaluationManagement.view.tab.title.toBeEvaluated').d('待评标'),
        ds: toBeEvaluatedDs,
        component: getTableComponent({ tabKey: 'toBeEvaluated', tableDs: toBeEvaluatedDs }),
      },
      {
        key: 'historyEvaluated',
        title: intl.get('scux.bidEvaluationManagement.view.tab.title.historyEvaluated').d('历史评标'),
        ds: historyEvaluatedDs,
        component: getTableComponent({ tabKey: 'historyEvaluated', tableDs: historyEvaluatedDs }),
      },
      {
        key: 'evaluationSummary',
        title: intl.get('scux.bidEvaluationManagement.view.tab.title.evaluationSummary').d('评标汇总'),
        ds: evaluationSummaryDs,
        component: getTableComponent({ tabKey: 'evaluationSummary', tableDs: evaluationSummaryDs }),
      },
    ];
  }, [toBeEvaluatedDs, historyEvaluatedDs, evaluationSummaryDs]);

  // 导出
  const handleExport = () => {
    const evaluateScoreIds = (evaluationSummaryDs.selected || []).map(r => r.get('evaluateScoreId')).join(',');
    const queryData = omit((evaluationSummaryDs?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty']);
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/bid-evaluation-export`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'GET',
      queryParams: Object.entries(filterNullValueObject({
        ...timeFilerProcess(queryData, [{
          name: 'creationDate_range',
          startName: 'creationDateFrom',
          endName: 'creationDateTo',
        }]),
        evaluateScoreIds,
      })).map((item) => ({
        name: item[0],
        value: item[1],
      })),
    }));
  };

  // 切换tab
  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <Header title={intl.get('scux.bidEvaluationManagement.view.title.list.bidEvaluationManagement').d('评标管理')}>
        {activeKey === 'evaluationSummary' && (
          <Button icon="export" wait={500} onClick={handleExport}>
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        )}
      </Header>
      <Content>
        <Tabs activeKey={activeKey} onChange={handleChangeTab}>
          {tabs.map(tab => (
            <TabPane
              key={tab.key}
              tab={tab.title}
              count={tab.ds.totalCount}
            >
              {tab.component}
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidEvaluationManagement'],
})(withProps(() => ({
  // 待评标
  toBeEvaluatedDs: new DataSet(tableDataSet({ queryType: 'SCORING' })),
  // 历史评标
  historyEvaluatedDs: new DataSet(tableDataSet({ queryType: 'SCORED' })),
  // 评标汇总
  evaluationSummaryDs: new DataSet(tableDataSet({ queryType: 'SUMMARY' })),
}), {
  cacheState: true,
  cleanWhenClose: false,
  keepOriginDataSet: true,
})(observer(Index)));
