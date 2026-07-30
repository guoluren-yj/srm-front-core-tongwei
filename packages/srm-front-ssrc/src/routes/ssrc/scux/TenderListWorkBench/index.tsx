import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { Button, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { omit } from 'lodash';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import notification from 'hzero-front/lib/utils/notification';
import { filterNullValueObject, getResponse } from 'hzero-front/lib/utils/utils';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import withProps from 'hzero-front/lib/utils/withProps';

import { tableDataSet } from './storeDs';
import { tenderListBillCommonApi, tenderListExportApi } from './api';
import { timeFilerProcess } from '../utils/fun';

const { TabPane } = Tabs;

// 用户个性化编码
const customizedCodes = {
  toBeProcessed: 'SCUX_TWNF_TENDER_LIST_WORKBENCH_TO_BE_PROCESSED_LIST',
  toBeReleased: 'SCUX_TWNF_TENDER_LIST_WORKBENCHTO_BE_RELEASED_LIST',
  all: 'SCUX_TWNF_TENDER_LIST_WORKBENCH_ALL_LIST',
};

const prefix = 'scux.tenderListWorkbench';

const Index: React.FC<any> = (props) => {

  const {
    history,
    allDs,
    toBeReleasedDs,
    toBeProcessedDs,
  } = props;

  const [activeKey, setActiveKey] = useState('toBeProcessed');

  // 编辑
  const handleEdit = (record) => {
    const { sourceProjectId, bidCatalogId } = record.get(['bidCatalogId', 'sourceProjectId']);
    if (!sourceProjectId || !bidCatalogId) return;
    history.push({
      pathname: `/scux/ssrc/tender-workbench/update/${bidCatalogId}`,
      search: querystring.stringify({
        sourceProjectId,
      }),
    });
  };

  // 列表按钮
  const getListButtons = ({ record }) => {
    const catalogStatus = record.get('catalogStatus');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    };
    return [
      ['NEW'].includes(catalogStatus) && (
        <Button {...commonButtonsProps} onClick={() => handleEdit(record)}>
          {intl.get('scux.bidPlanWorkBench.view.button.edit').d('编辑')}
        </Button>
      ),
    ].filter(Boolean);
  };

  // 跳转招标计划明细页面
  const handleJumpBidPlanDetail = (record) => {
    if (!record) return;
    const { sourceProjectId, rfxHeaderId } = record.get(['sourceProjectId', 'rfxHeaderId']);
    if (!sourceProjectId) return;
    history.push({
      pathname: `/scux/ssrc/bid-plan-workbench/bid-full-process-detail/${sourceProjectId}/${rfxHeaderId || -1}`,
    });
  };

  // 跳转招标清单明细页面
  const handleBidListDetail = (record) => {
    if (!record) return;
    const { sourceProjectId, bidCatalogId } = record.get(['sourceProjectId', 'bidCatalogId']);
    if (!sourceProjectId || !bidCatalogId) return;
    history.push({
      pathname: `/scux/ssrc/tender-workbench/detail/${bidCatalogId}`,
      search: querystring.stringify({
        sourceProjectId,
      }),
    });
  };

  // 获取列
  const getColumns = (tabKey: string): ColumnProps[] => {
    return [
      {
        name: 'catalogStatus',
        width: 100,
        hidden: tabKey === 'toBeProcessed',
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        width: 120,
        renderer: ({ record }) => getListButtons({ record }),
        hidden: tabKey === 'toBeProcessed',
      },
      {
        name: 'catelogNum',
        width: 130,
        hidden: tabKey === 'toBeProcessed',
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleBidListDetail(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'sourceProjectNum',
        width: 130,
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleJumpBidPlanDetail(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'sourceProjectName',
        width: 130,
      },
      {
        name: 'templateName',
      },
      {
        name: 'companyName',
      },
      {
        name: 'bidDirectorName',
      },
      {
        name: 'createdByName',
      },
      {
        name: 'creationDate',
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
        filterBarConfig={{
          cacheKey: `cux_${tabKey}_technicalDocumentsWorkBench_list`,
          autoQuery: true,
          left: {
            render: (ds) => {
              if (ds && (!ds.getField('multiProjectNumOrTitle') || !ds.getField('multiProjectNumOrTitle')?.get('transformRequest'))) {
                ds.addField('multiProjectNumOrTitle', {
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
                  name="multiProjectNumOrTitle"
                  dataSet={ds}
                  placeholder={intl
                    .get('scux.technicalDocumentsWorkBench.view.placeholder.multiProjectNumOrTitle')
                    .d('招标计划单号，招标名称，技术文件编号')}
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
        key: 'toBeProcessed',
        title: intl.get(`${prefix}.view.tab.title.toBeProcessed`).d('待处理'),
        ds: toBeProcessedDs,
        component: getTableComponent({ tabKey: 'toBeProcessed', tableDs: toBeProcessedDs }),
      },
      {
        key: 'toBeReleased',
        title: intl.get(`${prefix}.view.tab.title.toBeReleased`).d('待发布'),
        ds: toBeReleasedDs,
        component: getTableComponent({ tabKey: 'toBeReleased', tableDs: toBeReleasedDs }),
      },
      {
        key: 'all',
        title: intl.get(`${prefix}.view.tab.title.all`).d('全部'),
        ds: allDs,
        component: getTableComponent({ tabKey: 'all', tableDs: allDs }),
      },
    ];
  }, [toBeProcessedDs, toBeReleasedDs, allDs]);

  // 待发布-新建
  const handleAddNewFile = () => {
    const selectedData = toBeProcessedDs.selected;
    if (selectedData.length === 1) {
      return tenderListBillCommonApi({
        operationType: 'CREATE',
        sourceProjectId: selectedData[0].get('sourceProjectId'),
      }).then(res => {
        if (getResponse(res) && res.bidCatalogId) {
          history.push({
            pathname: `/scux/ssrc/tender-workbench/update/${res.bidCatalogId}`,
            search: querystring.stringify({
              sourceProjectId: res.sourceProjectId,
            }),
          });
        };
      });
    };
    if (selectedData.length > 1) {
      notification.warning({
        message: intl.get(`${prefix}.view.message.twnf.notAllowMultipleSelectLine`).d('不支持多选，仅能选择一条数据进行创建!'),
      });
      return;
    };
    if (selectedData.length === 0) {
      notification.warning({
        message: intl.get(`${prefix}.view.message.twnf.atLeastSelectOneLine`).d('请勾选一行招标计划进行创建!'),
      });
      return;
    };
  };

  // 导出
  const handleExport = () => {
    const catalogIds = (allDs.selected || []).map(r => r.get('bidCatalogId'));
    const queryData = omit((allDs?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty']);
    const bodyParams = catalogIds?.length > 0 ? { catalogIds } : filterNullValueObject({
      ...timeFilerProcess(queryData, [{
        name: 'creationDate_range',
        startName: 'creationDateFrom',
        endName: 'creationDateTo',
      }]),
    });
    return tenderListExportApi(bodyParams).then(result => {
      if (result && result.data && getResponse(result.data)) {
        const link = document.createElement('a');
        link.href = result.data;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(result.data); // 释放内存
      };
    });
  };

  // 切换tab
  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title.list.tenderListWorkBench`).d('招标清单')}>
        {activeKey === 'toBeProcessed' && (
          <Button icon="add" onClick={handleAddNewFile}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}
        {activeKey === 'all' && (
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
  code: ['scux.bidPlanWorkBench', 'scux.technicalDocumentsWorkBench', 'scux.tenderListWorkbench'],
})(withProps(() => ({
  // 待处理
  toBeProcessedDs: new DataSet(tableDataSet({ queryType: 'PENDING' })),
  // 待发布
  toBeReleasedDs: new DataSet(tableDataSet({ queryType: 'UN_RELEASE' })),
  // 全部
  allDs: new DataSet(tableDataSet({ queryType: 'ALL' })),
}), {
  cacheState: true,
  cleanWhenClose: false,
  keepOriginDataSet: true,
})(observer(Index)));
