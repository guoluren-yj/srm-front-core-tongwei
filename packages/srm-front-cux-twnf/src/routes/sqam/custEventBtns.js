import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import ReferOrder from './components/ReferOrder/index';
import ReferProtocol from './components/ReferProtocol/index';

async function handleReferOrder() {
  Modal.open({
    title: '引用订单新建',
    children: <ReferOrder />,
    drawer: true,
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: 1090 },
    okText: '新建',
    cancelText: '取消',
  });
}

async function handleReferProtocol() {
  Modal.open({
    title: '引用协议新建',
    children: <ReferProtocol />,
    drawer: true,
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: 1090 },
    okText: '新建',
    cancelText: '取消',
  });
}

export default {
  'SQAM.CREATE_CLAIM_LIST.BTNS': [
    {
      eventCode: 'cuxReferOrder',
      callback: handleReferOrder,
    },
    {
      eventCode: 'cuxReferProtocol',
      callback: handleReferProtocol,
    },
  ],
};