import React, { useMemo } from 'react';
import { Collapse, Button, Card } from 'choerodon-ui';
import { Form, TextField, TextArea } from 'choerodon-ui/pro';
import { observer, useObserver } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { useStore } from '../store/StoreProvider';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

const { Panel } = Collapse;

const BaseInfo: React.FC = observer(() => {
  const { commonDs, prefix } = useStore();
  const { headerDs } = commonDs || {};

  if (!headerDs) return null;

  const { rfxNum, rfxTitle, rfxHeaderId } = useObserver(() =>
    headerDs?.current?.get(['rfxNum', 'rfxTitle', 'rfxHeaderId']) || {}
  );

  // 查看单据详情
  const handleViewDocDetail = () => {
    if (!rfxHeaderId) return;
    const path = `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`;
    openTab({
      key: path,
      path,
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
        <Card
          title={<CommonLevel title={intl.get(`${prefix}.view.card.title.preWinningBidDetail`).d('决标明细')} />}
          id="cuxBasicInfo"
          bordered={false}
        >
          <Form
            dataSet={headerDs}
            columns={3}
            labelLayout={LabelLayout.float}
            useWidthPercent
          >
            <TextField name="attributeLongtext31" />
            <TextField name="attributeLongtext32" />
            <TextField name="attributeLongtext3" />
            <TextArea name="attributeLongtext30" colSpan={2} resize={ResizeType.vertical} />
          </Form>
        </Card>
      </Panel>
    </Collapse>
  );
});

export default BaseInfo;
