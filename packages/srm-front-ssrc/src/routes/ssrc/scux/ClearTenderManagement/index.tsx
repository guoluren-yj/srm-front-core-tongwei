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

import { tableDataSet, referenceDocumentCreateDS } from './storeDs';
import { addReferenceData } from './api';
import { timeFilerProcess, handleDealQueryData } from '../utils/fun';
import ReferenceDocument from './components/ReferenceDocument';

const Index: React.FC<any> = (props) => {

  const {
    history,
    location = {},
  } = props;
  // 供应商标志
  const supplierFlag = location?.pathname?.includes('/scux/ssrc/clear-tender-management/sup');
  const tableDs = useDataSet(() => tableDataSet({ supplierFlag }), [supplierFlag]);

  // 列表按钮
  const getListButtons = ({ record }) => {
    const qbStatus = record.get('qbStatus');
    const commonButtonsProps = {
      funcType: FuncType.link,
      wait: 500,
    };
    return [
      ['NEW', 'RETURN'].includes(qbStatus) && (
        <Button {...commonButtonsProps} onClick={() => handleJumpClearTender({ record, type: 'UPDATE' })}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
      ),
      qbStatus === "CONFIRMED" && (
        <Button {...commonButtonsProps} onClick={() => handleJumpClearTender({ record, type: 'UPDATE' })}>
          {intl.get('scux.clearTenderManagement.button.confirmationCompleted').d('确认完成')}
        </Button>
      ),
    ].filter(Boolean);
  };

  // 跳转到清标维护、明细页面
  const handleJumpClearTender = (payload : { type?: string, record: Record | null | undefined }) => {
    const { record, type } = payload;
    if (!record) return;
    const qbHeaderId = record.get('qbHeaderId');
    if (!qbHeaderId) return;
    history.push({
      pathname: `/scux/ssrc/clear-tender-management/${supplierFlag ? 'sup' : 'pur'}/${type === 'UPDATE' ? 'update' : 'detail'}/${qbHeaderId}`,
    });
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

  // 引用单据新建
  const handleAddClearTender = () => {
    const referenceDocDs = new DataSet(referenceDocumentCreateDS());
    Modal.open({
      title: intl.get('ssrc.clearTenderManagement.view.title.referenceDocumentCreate').d('引用单据创建'),
      drawer: true,
      closable: true,
      style: { width: 800 },
      children: (
        <ReferenceDocument
          tableDs={referenceDocDs}
        />
      ),
      onOk: () => {
        const selectedData = referenceDocDs.selected;
        if (!selectedData.length) {
          notification.warning({
            message: intl.get('ssrc.clearTenderManagement.view.message.referenceDocumentCreate.notAllowEmpty').d('请勾选一条数据进行创建！'),
          });
          return false;
        };
        if (selectedData.length === 1) {
          const { rfxHeaderId, supplierCompanyId } = selectedData[0].get(['rfxHeaderId', 'supplierCompanyId']);
          return addReferenceData({
            rfxHeaderId,
            supplierCompanyId,
          }).then(res => {
            if (getResponse(res) && res.qbHeaderId) {
              history.push({
                pathname: `/scux/ssrc/clear-tender-management/pur/update/${res.qbHeaderId}`,
              });
            };
          });
        };
        return false;
      },
    });
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'qbStatus',
        width: 80,
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => getListButtons({ record }),
        hidden: supplierFlag,
        width: 100,
      },
      {
        name: 'qbNum',
        width: 120,
        renderer: ({ record, value }) => value ? (<a onClick={() => handleJumpClearTender({ record })}>{value}</a>) : null,
      },
      {
        name: 'qbTitle',
        width: 130,
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
        name: 'supplierCompanyName',
        hidden: supplierFlag,
        width: 130,
      },
      {
        name: 'createdByName',
        width: 100,
      },
      {
        name: 'creationDate',
      }
    ];
  }, [supplierFlag]);

  // 导出
  const handleExport = async () => {
    const queryData = omit((tableDs?.queryDataSet?.current?.toData() || {}), ['__id', '_status', '__dirty']);
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq7CvT3qyQ9oB2gxbMGibkCAs`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'POST',
      queryData: {
        queryRole: supplierFlag ? 'SUPPLIER' : 'PURCHASE',
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
      <Header title={intl.get('scux.clearTenderManagement.view.title.list.clearTenderManagement').d('清标管理')}>
        {supplierFlag ? (
          <Button icon='export' wait={1000} onClick={handleExport}>
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        ) : (
          <>
            <Button icon="add" color={ButtonColor.primary} onClick={handleAddClearTender}>
              {intl.get('scux.clearTenderManagement.view.button.addClearTender').d('新建')}
            </Button>
            <Button icon='export' wait={1000} onClick={handleExport}>
              {intl.get('hzero.common.button.export').d('导出')}
            </Button>
          </>
        )}
      </Header>
      <Content>
        <FilterBarTable
          columns={columns}
          dataSet={tableDs}
          border={false}
          cacheState
          filterBarConfig={{
            cacheKey: 'clearTenderManagementList',
            autoQuery: true,
            left: {
              render: (ds) => {
                if (ds && (!ds.getField('multiNumOrTitleOrSupplier') || !ds.getField('multiNumOrTitleOrSupplier')?.get('transformRequest'))) {
                  ds.addField('multiNumOrTitleOrSupplier', {
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
                    name="multiNumOrTitleOrSupplier"
                    dataSet={ds}
                    placeholder={intl
                      .get('scux.clearTenderManagement.view.placeholder.bidNumAndNameAndSupplierName')
                      .d('招标单号，项目名称，供应商名称')}
                    style={{ width: '3rem' }}
                  />
                );
              },
            },
          }}
          customizable
          customizedCode="SCUX_TWNF_CLEAR_TENDER_WORK_BENCH_LIST"
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.clearTenderManagement'],
})(observer(Index));
