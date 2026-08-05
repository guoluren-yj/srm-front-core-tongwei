import React, { useCallback, useEffect, useState } from 'react';
import { Button, Menu, Dropdown } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';
import { refreshTab } from 'utils/menuTab';

/**
 * 技术文件 - 历史版本下拉按钮
 * 无数据时不展示按钮
 */
const HistoryVersionListBtn = ({ techFileId, history, buttonProps = {} }) => {
  const [versionList, setVersionList] = useState([]);

  // 查询技术文件版本历史（不传 techVersion 获取历史列表）
  const queryHistoryVersions = useCallback(async () => {
    if (!techFileId) return;
    const res = getResponse(
      await request(
        `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeDZVuxxhCyc5UMK4IbqKu9o`,
        {
          method: 'POST',
          body: {
            postType: 'GET_HISTORY',
            techFileId,
          },
        }
      )
    );
    setVersionList(Array.isArray(res) ? res : []);
  }, [techFileId]);

  useEffect(() => {
    queryHistoryVersions();
  }, [queryHistoryVersions]);

  // 跳转历史版本详情
  const skipHistoryVersion = (versionRecord) => {
    const { techVersion } = versionRecord || {};
    if (!techVersion || !history) return;
    const currentSearch = history.location.search
      ? querystring.parse(history.location.search.substr(1))
      : {};
    history.push({
      pathname: history.location.pathname,
      search: querystring.stringify({ ...currentSearch, techVersion }),
    });
    // 刷新当前 tab，强制组件重新挂载并重新查询头/文件接口
    refreshTab();
  };

  // 无数据不展示按钮
  if (isEmpty(versionList)) {
    return null;
  }

  const menuList = (
    <Menu>
      {versionList.map((versionRecord, index) => (
        <Menu.Item
          key={versionRecord.techFileHistoryId || index}
          onClick={() => skipHistoryVersion(versionRecord)}
        >
          <div>
            {`${intl.get('ssrc.projectSetup.view.menuItem.version').d('版本')}v${
              versionRecord.techVersion
            }`}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menuList} trigger={['hover']} {...(buttonProps || {})}>
      <Button icon="history">
        {intl.get('ssrc.projectSetup.view.button.historyMode').d('查看版本')}
      </Button>
    </Dropdown>
  );
};

export default observer(HistoryVersionListBtn);
