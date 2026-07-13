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
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import withProps from 'utils/withProps';
import { downloadFileByAxios } from 'srm-front-boot/lib/services/MarmotDownloadButtonServices';

import { tableDataSet } from './storeDs';
import { technicalDocumentsApi } from './api';
import { timeFilerProcess } from '../utils/fun';

const { TabPane } = Tabs;

// 用户个性化编码
const customizedCodes = {
  toBeProcessed: 'SCUX_TWNF_TECHNICAL_DOCUMENTS_WORKBENCH_TO_BE_PROCESSED_LIST',
  toBeReleased: 'SCUX_TWNF_TECHNICAL_DOCUMENTS_WORKBENCHTO_BE_RELEASED_LIST',
  all: 'SCUX_TWNF_TECHNICAL_DOCUMENTS_WORKBENCH_ALL_LIST',
};

const Index: React.FC<any> = (props) => {

  const {
    history,
    allDs,
    toBeReleasedDs,
    toBeProcessedDs,
  } = props;

  const [activeKey, setActiveKey] = useState('toBeReleased');

  // 编辑
  const handleEdit = (record) => {
    const { sourceProjectId, techFileId } = record.get(['techFileId', 'sourceProjectId']);
    if (!sourceProjectId || !techFileId) return;
    history.push({
      pathname: `/scux/ssrc/technical-documents-workbench/tech-update/${techFileId}`,
      search: querystring.stringify({
        sourceProjectId,
      }),
    });
  };

  // 列表按钮
  const getListButtons = ({ record }) => {
    const techFileStatus = record.get('techFileStatus');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    };
    if (techFileStatus === 'APPROVED') {
      return null;
    };
    return [
      ['NEW'].includes(techFileStatus) && (
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

  // 跳转文件明细页面
  const handleJumpTechFileDetail = (record) => {
    if (!record) return;
    const { sourceProjectId, techFileId } = record.get(['sourceProjectId', 'techFileId']);
    if (!sourceProjectId || !techFileId) return;
    history.push({
      pathname: `/scux/ssrc/technical-documents-workbench/tech-detail/${techFileId}`,
      search: querystring.stringify({
        sourceProjectId,
      }),
    });
  };

  // 获取列
  const getColumns = (tabKey: string): ColumnProps[] => {
    return [
      {
        name: 'techFileStatus',
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
        name: 'techFileNum',
        width: 130,
        hidden: tabKey === 'toBeProcessed',
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleJumpTechFileDetail(record)}>
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
        name: 'attributeVarchar18',
      },
      {
        name: 'companyName',
      },
      {
        name: 'manager',
      },
      {
        name: 'userInChargeMeaning',
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
        title: intl.get('scux.technicalDocumentsWorkBench.view.tab.title.toBeProcessed').d('待处理'),
        ds: toBeProcessedDs,
        component: getTableComponent({ tabKey: 'toBeProcessed', tableDs: toBeProcessedDs }),
      },
      {
        key: 'toBeReleased',
        title: intl.get('scux.technicalDocumentsWorkBench.view.tab.title.toBeReleased').d('待发布'),
        ds: toBeReleasedDs,
        component: getTableComponent({ tabKey: 'toBeReleased', tableDs: toBeReleasedDs }),
      },
      {
        key: 'all',
        title: intl.get('scux.technicalDocumentsWorkBench.view.tab.title.all').d('全部'),
        ds: allDs,
        component: getTableComponent({ tabKey: 'all', tableDs: allDs }),
      },
    ];
  }, [toBeProcessedDs, toBeReleasedDs, allDs]);

  // 待发布-新建
  const handleAddNewFile = () => {
    const selectedData = toBeProcessedDs.selected;
    if (selectedData.length === 1) {
      return technicalDocumentsApi({
        postType: 'NEW',
        bidPlanInfo: selectedData[0].toData(),
      }).then(res => {
        if (getResponse(res)) {
          history.push({
            pathname: `/scux/ssrc/technical-documents-workbench/tech-update/${res.techFileId}`,
          });
        };
      });
    };
    if (selectedData.length > 1) {
      notification.warning({
        message: intl.get('scux.technicalDocumentsWorkBench.view.message.twnf.notAllowMultipleSelectLine').d('不允许多选招标计划进行维护技术文件!'),
      });
      return;
    };
    if (selectedData.length === 0) {
      notification.warning({
        message: intl.get('scux.technicalDocumentsWorkBench.view.message.twnf.atLeastSelectOneLine').d('请勾选一行招标计划进行维护技术文件!'),
      });
      return;
    };
  };

  // 导出
  const handleExport = () => {
    const sourceProjectIds = (allDs.selected || []).map(r => r.get('sourceProjectId')).join(',');
    const queryData = omit((allDs?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty']);
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeHEXRxLvctcncYvAkDh8Yzc`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'GET',
      queryParams: Object.entries(filterNullValueObject({
        ...timeFilerProcess(queryData, [{
          name: 'creationDate_range',
          startName: 'creationDateFrom',
          endName: 'creationDateTo',
        }]),
        sourceProjectIds,
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
      <Header title={intl.get('scux.technicalDocumentsWorkBench.view.title.list.technicalDocumentsWorkBench').d('技术文件（含图纸）')}>
        {/* <Button icon="add" onClick={handleAddNewFile}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button> */}
        <Button icon="export" wait={500} onClick={handleExport}>
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
      </Header>
      <Content>
        {/* <Tabs activeKey={activeKey} onChange={handleChangeTab}>
          {tabs.map(tab => (
            <TabPane
              key={tab.key}
              tab={tab.title}
              count={tab.ds.totalCount}
            >
              {tab.component}
            </TabPane>
          ))}
        </Tabs> */}
        {getTableComponent({ tabKey: 'all', tableDs: allDs })}
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidPlanWorkBench', 'scux.technicalDocumentsWorkBench'],
})(withProps(() => ({
  // 待处理
  toBeProcessedDs: new DataSet(tableDataSet({ queryTab: 'NEW' })),
  // 待发布
  toBeReleasedDs: new DataSet(tableDataSet({ queryTab: 'UN_RELEASE' })),
  // 全部
  allDs: new DataSet(tableDataSet({ queryTab: 'ALL' })),
}), {
  cacheState: true,
  cleanWhenClose: false,
  keepOriginDataSet: true,
})(observer(Index)));
