import React, { useMemo } from 'react';
import { Collapse } from 'choerodon-ui';
import { Form, Output, Button } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { useObserver } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { useStore } from '../store/StoreProvider';
import CommonLevel from '../../../components/SecLevelTitle/CommonLevel';
import BidManagementAttachment from '../../../components/BidAttachmentDetail/BidManagementAttachment';
import QuotationLineInfo from './QuotationLineInfo';

const { Panel } = Collapse;

const SupplierInfo: React.FC = () => {
  const { commonDs: { evaluationHeaderDs } = {}, prefix } = useStore();

  const { scoreTeam, quotationHeaderId, rfxHeaderId } = useObserver(() =>
    evaluationHeaderDs?.current?.get(['scoreTeam', 'quotationHeaderId', 'rfxHeaderId']) || {}
  );

  // 通威二开 - 价格组详情才展示「投标详情」跳转与报价行信息表格，其他组别保持原有逻辑
  const isPriceTeam = scoreTeam === 'PRICE';

  const bidManagementAttachmentProps = useMemo(() => {
    if (!scoreTeam || !quotationHeaderId) {
      return null;
    };
    return {
      attachType: 'SUP',
      queryParams: {
        scoreTeam,
        quotationHeaderId,
      },
    };
  }, [scoreTeam, quotationHeaderId]);

  // 通威二开 - 跳转投标详情（与评标汇总页的跳转参数保持一致）
  const handleBidDetail = () => {
    if (!quotationHeaderId) {
      return;
    }
    const searchObj = {
      rfxHeaderId,
      noBackFlag: 1, // openTab 不需要返回
      pageType: 'SUPPLIER_DETAIL_QUERY',
      switchUrl: 2, // 采购方跳转标识
    };
    const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
    openTab(
      {
        key: path,
        path,
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        search: querystring.stringify(searchObj),
        closable: true,
      },
      undefined
    );
  };

  return (
    <Collapse
      defaultActiveKey={['supplierInfo']}
      expandIconPosition="text-right"
      ghost
    >
      <Panel header={<CommonLevel title={intl.get(`${prefix}.view.card.title.supplierInfo`).d('供应商信息')} style={{ fontSize: '.16rem', fontWeight: '600' }} />} key="supplierInfo">
        {evaluationHeaderDs && (
          <Form
            dataSet={evaluationHeaderDs}
            columns={3}
            useWidthPercent
            labelLayout={LabelLayout.vertical}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="supplierCompanyName" />
            <Output name="supplierCompanyNum" />
            {scoreTeam === 'PRICE' && <Output name="qtnTotalAmount" />}
            {isPriceTeam && (
              <Output
                name="bidDetail"
                renderer={() => (
                  <Button funcType={FuncType.link} wait={1200} onClick={handleBidDetail}>
                    {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
                  </Button>
                )}
              />
            )}
          </Form>
        )}
        {isPriceTeam && !!quotationHeaderId && (
          <div style={{ marginTop: '24px' }}>
            <QuotationLineInfo rfxHeaderId={rfxHeaderId} quotationHeaderId={quotationHeaderId} />
          </div>
        )}
        <div style={{ marginTop: '24px' }}>
          {bidManagementAttachmentProps ? <BidManagementAttachment {...bidManagementAttachmentProps} /> : null}
        </div>
      </Panel>
    </Collapse>
  );
};

export default SupplierInfo;
