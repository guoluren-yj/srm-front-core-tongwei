import React, { useEffect, useMemo, useState } from 'react';
import { Button, useDataSet, Form, Output } from 'choerodon-ui/pro';
import { Card, Spin, Collapse } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { useObserver } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'utils/notification';

import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import {
  getSourceCategoryName,
  getDocumentTypeName,
  getQuotationName,
  getCheckPriceName,
} from '@/utils/globalVariable';
import useIPDetailModal from '@/routes/components/IPDetails';

import { formDataSet, tableDataSet } from './storeDs';
import TenderDocInspection from './TenderDocInspection';
import CommonLevel from '../components/SecLevelTitle/CommonLevel';

import Style from './index.less';

const { openModal } = useOperationRecordModal();
const { openIPDetailModal } = useIPDetailModal();

const Index: React.FC<any> = (props = {}) => {

  const {
    match: { params },
    // location: { pathname: '', search: '' },
    history,
  } = props;

  const { rfxHeaderId } = params || {};

  if (!rfxHeaderId) {
    return null;
  };

  const [pageLoading, setPageLoading] = useState(false);

  const headerDs = useDataSet(() => formDataSet(), []);
  const tableDs = useDataSet(() => tableDataSet(), []);

  const { rfxNum, rfxTitle, companyId = '' } = useObserver(() => headerDs.current?.get(['rfxNum', 'rfxTitle', 'companyId']) || {});

  useEffect(() => {
    if (rfxHeaderId) {
      headerDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
      tableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
      setPageLoading(true);
      Promise.all([
        headerDs.query(),
        tableDs.query(),
      ]).finally(() => {
        setPageLoading(false);
      });
    };
  }, [rfxHeaderId]);

  // 保存、提交
  const saveOrSubmitPageData = async (type) => {
    setPageLoading(true);
    if (!await tableDs.validate()) {
      notification.warning({
        message: intl.get('scux.confirmationOfBiddingStatus.view.tip.validatePageMessage').d('标书检查校验不通过！'),
      });
      setPageLoading(false);
      return;
    };
    return request(`/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqcuXpZzya7cR6tqLeyib6RhkTiahDph05Jw6ZvrFaHxk0u`, {
      method: 'POST',
      body: {
        postType: type, // GET（查询）/SAVE（保存）/SUBMIT（提交）,
        rfxHeaderId,
        supplierList: tableDs.toData(), //（保存、提交时传需要保存的行）
      },
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        if (type === 'SUBMIT') {
          history.push(`/ssrc/new-bid-hall/list`);
        } else {
          tableDs.query();
        };
      }
    }).finally(() => {
      setPageLoading(false);
    });
  };

   // 打开操作记录弹框
  const handleShowOperationRecordModal = () => {
    openModal({
      rfxHeaderId,
      rfx: {
      bidFlag: true,
      documentTypeName: getDocumentTypeName(true),
      sourceCategoryName: getSourceCategoryName(true),
      quotationName: getQuotationName(true),
      checkPriceName: getCheckPriceName(true),
      },
      header: headerDs?.current?.toData(),
    });
  };

  // 查看IP重合详情
  const handleViewIPDetail = () => {
    openIPDetailModal({
      rfxHeaderId,
    });
  };

  const collapseHeader = useMemo(() => {
    return `${rfxNum}-${rfxTitle ?? ''}`;
  }, [rfxNum, rfxTitle]);

  return (
    <div className={Style['scux-twnf-wrapper']}>
      <Spin spinning={pageLoading}>
        <Header
          title={intl.get('scux.confirmationOfBiddingStatus.view.title.twnf.confirmBidStatus').d('投标状态确认')}
          backPath={'/ssrc/new-bid-hall/list'}
        >
          <Button wait={1200} color={ButtonColor.primary} onClick={() => saveOrSubmitPageData('SUBMIT')}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button wait={1200} onClick={() => saveOrSubmitPageData('SAVE')}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="operation_service_request" funcType={FuncType.flat} onClick={handleShowOperationRecordModal}>
            {intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录')}
          </Button>
          <Button icon="find_in_page" funcType={FuncType.flat} onClick={handleViewIPDetail}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情')}
          </Button>
        </Header>
        <div className={Style['scux-twnf-content']}>
          <div className={Style['scux-twnf-content-maintainer']}>
            <div className={Style['scux-twnf-content-base-info-collapse']}>
              <Collapse
                defaultActiveKey={["SCUX_CONFIRM_BIDDING_STATUS_BASE_INFO"]}
                expandIconPosition="text-right"
                ghost
              >
                <Collapse.Panel
                  header={collapseHeader}
                  key="SCUX_CONFIRM_BIDDING_STATUS_BASE_INFO"
                >
                  <Form
                    dataSet={headerDs}
                    columns={3}
                    useWidthPercent
                    labelLayout={LabelLayout.vertical}
                    className="c7n-pro-vertical-form-display"
                  >
                    <Output name="companyName" />
                    <Output name="rfxTitle" />
                    <Output name="createdByName" />
                  </Form>
                </Collapse.Panel>
              </Collapse>
            </div>
            <Card
              title={<CommonLevel title={intl.get('scux.confirmationOfBiddingStatus.view.card.title.tenderDocumentInspection').d('标书检查')} />}
              id=""
              bordered={false}
            >
              <TenderDocInspection companyId={companyId} history={history} rfxHeaderId={rfxHeaderId} ds={tableDs} readOnlyFlag={false} />
            </Card>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default formatterCollections({
  code: [
    'scux.confirmationOfBiddingStatus',
    'ssrc.inquiryHall',
    'ssrc.common',
  ],
})(Index);
