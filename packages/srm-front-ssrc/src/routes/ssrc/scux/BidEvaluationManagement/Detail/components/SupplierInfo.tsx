import React, { useMemo, useState } from 'react';
import { Collapse, Button } from 'choerodon-ui';
import { Form, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { useObserver } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { useStore } from '../store/StoreProvider';
import CommonLevel from '../../../components/SecLevelTitle/CommonLevel';
import BidManagementAttachment from '../../../components/BidAttachmentDetail/BidManagementAttachment';

const { Panel } = Collapse;

const SupplierInfo: React.FC = () => {
  const { commonDs: { evaluationHeaderDs } = {}, prefix } = useStore();

  const { scoreTeam, quotationHeaderId } = useObserver(() =>
    evaluationHeaderDs?.current?.get(['scoreTeam', 'quotationHeaderId']) || {}
  );

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
          </Form>
        )}
        <div style={{ marginTop: '24px' }}>
          {bidManagementAttachmentProps ? <BidManagementAttachment {...bidManagementAttachmentProps} /> : null}
        </div>
      </Panel>
    </Collapse>
  );
};

export default SupplierInfo;
