import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { omit } from 'lodash';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { filterNullValueObject, getCurrentUser, getResponse } from 'hzero-front/lib/utils/utils';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import withProps from 'hzero-front/lib/utils/withProps';

import { tableDataSet } from './storeDs';
import { tenderListExportApi } from './api';
import { timeFilerProcess } from '../utils/fun';

// 用户个性化编码
const customizedCode = 'SCUX_TWNF_TENDER_LIST_WORKBENCH_ALL_LIST';

const prefix = 'scux.tenderListWorkbench';

const Index: React.FC<any> = (props) => {

  const {
    history,
    allDs,
    location,
  } = props;

  const currentUser = getCurrentUser();
  console.log('当前登录账号信息:', currentUser);
  console.log('当前登录账号信息 JSON:', JSON.stringify(currentUser, null, 2));

  // 从详情页返回时，location.key 变化，表格 key 随之变化强制重新挂载，解决 cacheState 下 autoHeight 不重算的问题
  const tableKey = location?.key || 'tenderList';

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
    const createdBy = record.get('createdBy');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    };
    return [
      ['NEW', 'APPROVED'].includes(catalogStatus) && `${createdBy}` === `${currentUser.id}` && (
        <Button {...commonButtonsProps} onClick={() => handleEdit(record)}>
          {intl.get('scux.bidPlanWorkBench.view.button.provideList').d('清单提供')}
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
  const getColumns = (): ColumnProps[] => {
    return [
      {
        name: 'catalogStatus',
        width: 100,
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        width: 120,
        renderer: ({ record }) => getListButtons({ record }),
      },
      {
        name: 'catelogNum',
        width: 130,
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

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title.list.tenderListWorkBench`).d('招标清单')}>
        <Button icon="export" wait={500} onClick={handleExport}>
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
      </Header>
      <Content>
        <FilterBarTable
          key={tableKey}
          columns={getColumns()}
          dataSet={allDs}
          border={false}
          cacheState
          filterBarConfig={{
            cacheKey: 'cux_all_technicalDocumentsWorkBench_list',
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
          customizedCode={customizedCode}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -50 }}
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidPlanWorkBench', 'scux.technicalDocumentsWorkBench', 'scux.tenderListWorkbench'],
})(withProps(() => ({
  allDs: new DataSet(tableDataSet({ queryType: 'ALL' })),
}), {
  // cacheState: true,
  // cleanWhenClose: false,
  keepOriginDataSet: true,
})(observer(Index)));
