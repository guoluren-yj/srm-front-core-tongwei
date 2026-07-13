import React, { useMemo } from 'react';
import { Collapse } from 'choerodon-ui';
import { Form, Output } from 'choerodon-ui/pro';
import { useObserver } from 'mobx-react-lite';

const { Panel } = Collapse;

const BaseInfo = (props) => {
  const { baseInfoDs } = props;

  const { rfxNum, rfxTitle } = useObserver(
    () => baseInfoDs?.current?.get(['rfxNum', 'rfxTitle']) || {}
  );

  // 折叠面板标题
  const panelHeader = useMemo(() => {
    return (
      <span>
        <span>{`${rfxNum}-${rfxTitle}`}</span>
      </span>
    );
  }, [rfxNum, rfxTitle]);

  return (
    <Collapse defaultActiveKey={['baseInfo']} expandIconPosition="text-right" ghost>
      <Panel header={panelHeader} key="baseInfo">
        {baseInfoDs && (
          <Form
            dataSet={baseInfoDs}
            columns={3}
            useWidthPercent
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="companyName" />
            <Output name="attributeLongtext20" />
            <Output name="scoreWay" />
          </Form>
        )}
      </Panel>
    </Collapse>
  );
};

export default BaseInfo;
