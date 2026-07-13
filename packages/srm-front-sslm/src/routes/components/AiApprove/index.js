/*
 * @Date: 2025-09-10 10:58:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import querystring from 'querystring';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';

export const openAiApproveModal = (props = {}) => {
  const { documentCode, categoryCode, bindObjFieldValue } = props;
  const params = {
    documentCode,
    categoryCode,
    bindObjFieldValue,
  };
  Modal.open({
    title: intl.get('sslm.common.model.ai.approveResult').d('AI审批结果'),
    children: <ResultForm params={params} />,
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    drawer: true,
    style: { width: 1100 },
    bodyStyle: { padding: 0 },
  });
};

export const ResultForm = ({ params = {}, ...rest }) => {
  const param = querystring.stringify(params);

  return (
    <EmbedPage
      href="/pub/smbl/check-result"
      location={{
        search: `?${param}`,
      }}
      {...rest}
    />
  );
};
