import React, { useMemo } from "react";
import { Form, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Collapse } from 'choerodon-ui';
import { useObserver } from 'mobx-react-lite';

import Style from '../index.less';
import { useStore } from '../store/StoreProvider';
const BaseInfo: React.FC<any> = () => {
  const {
    commonDs: { baseInfoDs } = {},
  } = useStore();

  if (!baseInfoDs) {
    return null;
  }

  const { sourceProjectNum, sourceProjectName } = useObserver(() =>
    baseInfoDs.current?.get(['sourceProjectNum', 'sourceProjectName']) || {}
  );

  const collapseHeader = useMemo(() => {
    return `${sourceProjectNum}-${sourceProjectName}`;
  }, [sourceProjectNum, sourceProjectName])

  return (
    <div className={Style['scux-technical-documents-content-base-info-collapse']}>
      <Collapse
        defaultActiveKey={["SCUX_BID_PLAN_BASE_INFO"]}
        expandIconPosition="text-right"
        ghost
      >
        <Collapse.Panel
          header={collapseHeader}
          key="SCUX_BID_PLAN_BASE_INFO"
        >
          <Form
            dataSet={baseInfoDs}
            columns={3}
            useWidthPercent
            labelLayout={LabelLayout.vertical}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="companyName" />
            <Output name="sourceProjectName" />
            <Output name="attributeVarchar18" />
            <Output name="manager" />
          </Form>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default BaseInfo;