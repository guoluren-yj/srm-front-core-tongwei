import React, { useMemo } from 'react';
import { Collapse, Button } from 'choerodon-ui';
import { Form, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { useObserver } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { useStore } from '../store/StoreProvider';

const { Panel } = Collapse;

const BaseInfo: React.FC = () => {
  const {
    commonDs: { evaluationHeaderDs } = {},
  } = useStore();

  const { rfxNum, rfxTitle, rfxHeaderId } = useObserver(() =>
    evaluationHeaderDs?.current?.get(['rfxNum', 'rfxTitle', 'rfxHeaderId']) || {}
  );

  // 查看单据详情
  const handleViewDocDetail = () => {
    if (!rfxHeaderId) return;
    const path = `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`;
    openTab({
      key: path,
      path: path,
      title: 'srm.common.tab.title.bidDetail',
      action: intl.get('srm.common.tab.title.bidDetail').d('招标详情'),
      search: querystring.stringify({
        rfxHeaderId,
        sourceCategory: 'RFQ',
        backPath: 'NO',
      }),
      closable: true,
    }, undefined);
  };

  // 折叠面板标题
  const panelHeader = useMemo(() => {
    return (
      <span>
        <span>{`${rfxNum}-${rfxTitle}`}</span>
        <Button icon="feed" funcType={FuncType.flat} onClick={handleViewDocDetail}>{intl.get('scux.bidEvaluationManagement.view.title.viewDocDetail').d('查看单据详情')}</Button>
      </span>
    );
  }, [rfxNum, rfxTitle]);

  return (
    <Collapse
      defaultActiveKey={['baseInfo']}
      expandIconPosition="text-right"
      ghost
    >
      <Panel header={panelHeader} key="baseInfo">
        {evaluationHeaderDs && (
          <Form
            dataSet={evaluationHeaderDs}
            columns={3}
            useWidthPercent
            labelLayout={LabelLayout.vertical}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="companyName" />
            <Output name="attributeVarchar11" />
            <Output name="attributeVarchar12" />
            <Output name="scoreWay" />
            <Output name="attributeLongtext20" />
          </Form>
        )}
      </Panel>
    </Collapse>
  );
};

export default BaseInfo;
