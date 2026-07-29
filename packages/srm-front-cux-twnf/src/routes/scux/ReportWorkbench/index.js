import React, { useEffect, useState } from 'react';

import { Tabs } from 'choerodon-ui/pro';

import { Content } from 'components/Page';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import List from './list';

import { fetchTabs } from './server.js';

const organizationId = getCurrentOrganizationId();

const ReportWorkbench = () => {
  const [tabList, setTabList] = useState([]);

  const [currentActiveKey, setCurrentActiveKey] = useState();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const tabs = getResponse(await fetchTabs());

    if (!tabs) return;

    setTabList(tabs);

    setCurrentActiveKey(tabs[0]?.defaultNum || '');
  };

  return (
    <Content>
      <Tabs
        activeKey={currentActiveKey}
        onChange={setCurrentActiveKey}
      >
        {tabList.map((item) => (
          <Tabs.TabPane tab={item.headerName} key={item.headerNum}>
            <List {...item} organizationId={organizationId} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Content>
  );
};

export default ReportWorkbench;
