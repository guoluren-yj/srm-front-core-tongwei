import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Form, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';
import SecLevelTitle from '../../components/SecLevelTitle';

const BidPlanRule = () => {
  const {
    commonDs: { processNodeDs, invitationControlDs, bidPlanFormDs },
  } = useContext(Store);

  const processNodeColumns = useMemo(
    () => [
      {
        name: 'number',
      },
      {
        name: 'name',
      },
      {
        name: 'remark',
        width: 260,
      },
      {
        name: 'order',
      },
      {
        name: 'limitDays',
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );

  const invitationControlColumns = useMemo(
    () => [
      {
        name: 'number',
      },
      {
        name: 'supplierCount',
      },
      {
        name: 'depositCount',
      },
      {
        name: 'techCount',
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );

  return (
    <div>
      <div>
        <SecLevelTitle
          title={intl.get('sscux.ssrc.view.title.sourceTemplate.twnf.bidPreparation').d('招标准备')}
          style={{ marginTop: '20px' }}
        />
        <Form dataSet={bidPlanFormDs} columns={3} labelLayout="float" useWidthPercent>
          <Output name="minSupplierCount" />
          <Output name="supplierMainApproveMethod" />
        </Form>
      </div>
      <div>
        <SecLevelTitle
          title={intl.get('sscux.ssrc.view.title.sourceTemplate.twnf.processNode').d('流程节点')}
          style={{ marginTop: '20px' }}
        />
        <Table
          dataSet={processNodeDs}
          columns={processNodeColumns}
          customizable
          customizedCode="SCUX_TWNF_SSRC_SOURCE_TEMPLATE_PROCESS_NODE_TABLE"
        />
      </div>
      {/* <div>
        <SecLevelTitle
          title={intl
            .get('sscux.ssrc.view.title.sourceTemplate.twnf.invitationControl')
            .d('邀请控制')}
          style={{ marginTop: '20px' }}
        />
        <Table
          dataSet={invitationControlDs}
          columns={invitationControlColumns}
          customizedCode="SCUX_TWNF_SSRC_SOURCE_TEMPLATE_INVITATION_CONTROL_TABLE"
        />
      </div> */}
    </div>
  );
};
export default observer(BidPlanRule);
