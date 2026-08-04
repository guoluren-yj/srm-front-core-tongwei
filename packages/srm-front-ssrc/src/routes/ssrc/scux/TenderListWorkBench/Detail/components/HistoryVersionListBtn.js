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
 * 招标清单 - 历史版本下拉按钮
 * 无数据时不展示按钮
 */
const HistoryVersionListBtn = ({ bidCatalogId, history, buttonProps = {} }) => {
  const [versionList, setVersionList] = useState([]);

  // 查询招标清单版本历史
  const queryHistoryVersions = useCallback(async () => {
    if (!bidCatalogId) return;
    const res = getResponse(
      await request(
        `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LMuS2jN0vaD10XhDTcdxVA8TiahDph05Jw6ZvrFaHxk0u`,
        {
          method: 'GET',
          query: {
            bidCatalogId,
            asyncCountFlag: 'DEFAULT',
            queryType: 'HEADER_HISTORY',
          },
        }
      )
    );
    setVersionList(Array.isArray(res) ? res : []);
  }, [bidCatalogId]);

  useEffect(() => {
    queryHistoryVersions();
  }, [queryHistoryVersions]);

  // 跳转历史版本详情
  const skipHistoryVersion = (versionRecord) => {
    const { bidCatalogHistoryId, bidVersion } = versionRecord || {};
    if (!bidCatalogHistoryId || !history) return;
    const currentSearch = history.location.search
      ? querystring.parse(history.location.search.substr(1))
      : {};
    history.push({
      pathname: history.location.pathname,
      search: querystring.stringify({ ...currentSearch, bidCatalogHistoryId, bidVersion }),
    });
    // 刷新当前 tab，强制组件重新挂载并重新查询头/标段接口
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
          key={versionRecord.bidCatalogHistoryId || index}
          onClick={() => skipHistoryVersion(versionRecord)}
        >
          <div>
            {`${intl.get('ssrc.projectSetup.view.menuItem.version').d('版本')}v${
              versionRecord.bidVersion
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
