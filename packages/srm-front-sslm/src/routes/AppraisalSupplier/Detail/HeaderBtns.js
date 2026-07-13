/*
 * @Date: 2023-11-03 09:09:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
// import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = observer(({ basicDs, loading, onSave, onConfirm }) => {
  const { allowPublishedFlag } = basicDs?.current?.get(['allowPublishedFlag']) || {};
  const buttons = [
    {
      child: intl.get('hzero.common.button.confirm').d('确认'),
      hidden: !allowPublishedFlag,
      btnProps: {
        loading,
        icon: 'check',
        wait: 200,
        color: 'primary',
        waitType: 'throttle',
        onClick: onConfirm,
      },
    },
    {
      child: intl.get('hzero.common.button.save').d('保存'),
      hidden: !allowPublishedFlag,
      btnProps: {
        loading,
        icon: 'save',
        wait: 200,
        waitType: 'throttle',
        funcType: 'flat',
        onClick: onSave,
      },
    },
    // {
    //   name: 'exportPro',
    //   btnComp: ExcelExportPro,
    //   btnProps: {
    //     requestUrl: '',
    //     queryParams: () => this.handleParams(),
    //     buttonText: intl.get('hzero.common.button.export').d('导出'),
    //     templateCode: '',
    //     otherButtonProps: {
    //       loading,
    //       type: 'c7n-pro',
    //       funcType: 'flat',
    //     },
    //   },
    // },
  ];
  return <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />;
});

export default HeaderBtns;
