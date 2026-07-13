import React, { useMemo, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Switch, Form, NumberField, Select } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';

import intl from 'utils/intl';

import Store from '../store/index';
import SecLevelTitle from '../../components/SecLevelTitle';

const BidPlanRule = (props) => {
  const { setPageLoading = noop } = props;
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
        header: () => (
          <div>
            <span style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle' }}>
              *{' '}
            </span>
            <span>
              {intl
                .get(`sscux.ssrc.view.model.sourceTemplate.twnf.processNode.order`)
                .d('节点顺序')}
            </span>
          </div>
        ),
        name: 'order',
        editor: true,
      },
      {
        header: () => (
          <div>
            <span style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle' }}>
              *{' '}
            </span>
            <span>
              {intl
                .get(`sscux.ssrc.view.model.sourceTemplate.twnf.processNode.limitDays`)
                .d('工作时限(天)')}
            </span>
          </div>
        ),
        name: 'limitDays',
        editor: true,
      },
      {
        name: 'enabledFlag',
        editor: () => <Switch name="enabledFlag" />,
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
        editor: true,
      },
      {
        name: 'depositCount',
        editor: true,
      },
      {
        name: 'techCount',
        editor: true,
      },
      {
        name: 'enabledFlag',
        editor: () => <Switch name="enabledFlag" />,
      },
    ],
    []
  );

  const handleAdd = () => {
    invitationControlDs.create({
      number: invitationControlDs.length + 1,
      enabledFlag: 1,
    });
  };

  // batch delete
  const handleBatchDelete = () => {
    const selectedRecords = invitationControlDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.status !== 'add') || [];

    // 删除新增数据
    invitationControlDs.remove(addRecords);

    if (oldRecords.length > 0) {
      setPageLoading(true);
      // 删除线上数据
      invitationControlDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(() => {
          invitationControlDs.query(undefined, undefined, true);
        })
        .finally(() => setPageLoading(false));
    }
  };

  return (
    <div>
      <div>
        <SecLevelTitle
          title={intl.get('sscux.ssrc.view.title.sourceTemplate.twnf.bidPreparation').d('招标准备')}
          style={{ marginTop: '20px' }}
        />
        <Form dataSet={bidPlanFormDs} columns={3} labelLayout="float" useWidthPercent>
          <NumberField name="minSupplierCount" showHelp="tooltip" />
          <Select name="supplierMainApproveMethod" clearButton={false} showHelp="tooltip" />
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
          buttons={[
            ['add', { onClick: handleAdd }],
            ['delete', { onClick: handleBatchDelete }],
          ]}
          customizedCode="SCUX_TWNF_SSRC_SOURCE_TEMPLATE_INVITATION_CONTROL_TABLE"
        />
      </div> */}
    </div>
  );
};
export default observer(BidPlanRule);
