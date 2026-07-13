import React from 'react';
import { Steps } from 'choerodon-ui';
import { useObserver } from 'mobx-react-lite';

const { Step } = Steps;

import { useStore } from '../store/StoreProvider';

const PageSteps: React.FC<any> = () => {

  const {
    commonDs: { baseInfoDs } = {},
  } = useStore();
  if (!baseInfoDs) {
    return null;
  };

  const steps = useObserver(
    () => (baseInfoDs.current?.get('nodeStatusList') || []).map(item => {
      return {
        ...item,
        title: item.nodeStatusMeaning,
      };
    })
  );
  return (
    <Steps current={0}>
      {steps.map(item => (
        <Step key={item.title} title={item.title} />
      ))}
    </Steps>
  );
};

export default PageSteps;