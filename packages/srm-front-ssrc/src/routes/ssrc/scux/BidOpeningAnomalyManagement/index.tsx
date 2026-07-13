import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Modal, DataSet, useDataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { omit } from 'lodash';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import querystring from 'querystring';
import { downloadFileByAxios } from 'srm-front-boot/lib/services/MarmotDownloadButtonServices';

import { tableDataSet } from './storeDs';
import { timeFilerProcess, handleDealQueryData } from '../utils/fun';

const prefix = 'scux.bidOpeningAnomalyManagement';

const Index: React.FC<any> = (props) => {

  const {
    history,
    location = {},
  } = props;
  // 供应商标志
  const tableDs = useDataSet(() => tableDataSet(), []);

  // 列表按钮
  const getListButtons = ({ record }) => {
    const abnormalStatus = record.get('abnormalStatus');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    }
    return [
      ['NEW'].includes(abnormalStatus) && (
        <Button {...commonButtonsProps} onClick={() => handleJumpAbnormal({ record, type: 'UPDATE' })}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
      ),
    ].filter(Boolean);
  };

  // 跳转到招标异常维护、明细页面
  const handleJumpAbnormal = (payload: { type?: string, record?: Record | null }) => {
    const { type, record } = payload;
    if (type === 'CREATE') { // 新建
      history.push({
        pathname: `/scux/ssrc/bid-opening-anomaly-management/create`,
      });
      return;
    };
    if (type === 'UPDATE' && record) {
      const abnormalHeaderId = record.get('abnormalHeaderId');
      if (!abnormalHeaderId) return;
      history.push({
        pathname: `/scux/ssrc/bid-opening-anomaly-management/update/${abnormalHeaderId}`,
      });
      return;
    };
    if (record) {
      const abnormalHeaderId = record.get('abnormalHeaderId');
      if (!abnormalHeaderId) return;
      history.push({
        pathname: `/scux/ssrc/bid-opening-anomaly-management/detail/${abnormalHeaderId}`,
      });
    };
  };

  // 跳转到招标明细
  const handleJumpBidDetail = (record) => {
    const { rfxHeaderId, projectLineSectionId } = record.get(['rfxHeaderId', 'projectLineSectionId']) || {};
    if (!rfxHeaderId) return;
    history.push({
      pathname: `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`,
      search: querystring.stringify({
        projectLineSectionId,
        rfxHeaderId,
        sourceCategory: 'RFQ',
      }),
    });
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'abnormalStatus',
        width: 100,
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => getListButtons({ record }),
        width: 100,
      },
      {
        name: 'abnormalNum',
        width: 120,
        renderer: ({ record, value }) => value ? (<a onClick={() => handleJumpAbnormal({ record })}>{value}</a>) : null,
      },
      {
        name: 'rfxNum',
        width: 130,
        renderer: ({ record, value }) => value ? (<a onClick={() => handleJumpBidDetail(record)}>{value}</a>) : null,
      },
      {
        name: 'rfxTitle',
        width: 130,
      },
      {
        name: 'companyName',
        width: 130,
      },
      {
        name: 'exceptionType',
        width: 130,
      },
      {
        name: 'createdByName',
        width: 100,
      },
      {
        name: 'approvalResult',
        width: 100,
      },
      {
        name: 'creationDate',
      }
    ];
  }, []);

  // 导出
  const handleExport = async () => {
    const queryData = omit((tableDs?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty']);
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq7CvT3qyQ9oB2gxbMGibkCAs`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'POST',
      queryData: {
        ...handleDealQueryData(timeFilerProcess(queryData, [{
          name: 'creationDate_range',
          startName: 'createStartDate',
          endName: 'createEndDate',
        }]))
      },
    }));
  };

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title.list.bidOpeningAnomalyManagement`).d('招标异常管理')}>
        <Button icon="add" color={ButtonColor.primary} onClick={() => handleJumpAbnormal({ type: 'CREATE' })}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
        {/*
        <Button icon='export' wait={1000} onClick={handleExport}>
          {intl.get('hzero.common.button.export').d('导出')}
        </Button> */}
      </Header>
      <Content>
        <FilterBarTable
          columns={columns}
          dataSet={tableDs}
          border={false}
          cacheState
          filterBarConfig={{
            cacheKey: 'bidOpeningAnomalyManagementList',
            autoQuery: true,
            left: {
              render: (ds) => {
                if (ds && (!ds.getField('multiNumOrTitle') || !ds.getField('multiNumOrTitle')?.get('transformRequest'))) {
                  ds.addField('multiNumOrTitle', {
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
                    name="multiNumOrTitle"
                    dataSet={ds}
                    placeholder={intl
                      .get(`${prefix}.view.placeholder.bidNumAndNameAndSupplierName`)
                      .d('招标单号，招标标题，异常处理号')}
                    style={{ width: '3rem' }}
                  />
                );
              },
            },
          }}
          customizable
          customizedCode="SCUX_TWNF_BID_OPENING_ANOMALY_MANAGEMENT_WORK_BENCH_LIST"
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidOpeningAnomalyManagement'],
})(observer(Index));
