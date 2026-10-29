import React, { useCallback, useEffect, useState } from 'react';
import { Button, Dropdown, Menu } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { queryNominationHistoryApi } from '../../../../services/scux/supplierEvaluationServices';

interface HistoryVersionListBtnProps {
  nominationHeaderId?: string | null;
  history?: any;
  buttonProps?: any;
}

/**
 * 入围单 - 历史版本下拉按钮
 * 点击版本号后把 nominationVersion 写入 URL，详情页据此按版本号查询历史数据并整体只读
 * 无版本数据时不展示按钮
 */
const HistoryVersionListBtn: React.FC<HistoryVersionListBtnProps> = ({
  nominationHeaderId,
  history,
  buttonProps = {},
}) => {
  const [versionList, setVersionList] = useState<any[]>([]);

  // 查询入围单版本列表
  const queryHistoryVersions = useCallback(async () => {
    if (!nominationHeaderId) {
      return;
    }
    const res = getResponse(await queryNominationHistoryApi(nominationHeaderId));
    // marmot 接口部分场景返回 JSON 字符串，这里兼容两种形态
    let list = res;
    if (typeof res === 'string') {
      try {
        list = JSON.parse(res);
      } catch (e) {
        list = [];
      }
    }
    setVersionList(Array.isArray(list) ? list : []);
  }, [nominationHeaderId]);

  useEffect(() => {
    queryHistoryVersions();
  }, [queryHistoryVersions]);

  // 跳转历史版本详情
  const skipHistoryVersion = (versionRecord: any) => {
    const version = versionRecord?.nominationVersion || versionRecord?.version;
    if (!version || !history) {
      return;
    }
    const currentSearch = history.location.search
      ? querystring.parse(history.location.search.substr(1))
      : {};
    // URL 变化后详情页的 DataSet 会按新的版本参数重新查询
    history.push({
      pathname: history.location.pathname,
      search: querystring.stringify({ ...currentSearch, nominationVersion: version }),
    });
  };

  // 无数据不展示按钮
  if (isEmpty(versionList)) {
    return null;
  }

  const menu = (
    <Menu>
      {versionList.map((versionRecord, index) => (
        <Menu.Item
          key={versionRecord?.nominationVersion || index}
          onClick={() => skipHistoryVersion(versionRecord)}
        >
          <div>
            {`${intl.get('scux.supplierEvaluation.view.menuItem.version').d('版本')}v${
              versionRecord?.nominationVersion || versionRecord?.version
            }`}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['hover']} {...(buttonProps || {})}>
      <Button icon="history">
        {intl.get('scux.supplierEvaluation.view.button.historyMode').d('查看版本')}
      </Button>
    </Dropdown>
  );
};

export default observer(HistoryVersionListBtn);
