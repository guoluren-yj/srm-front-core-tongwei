import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Expose } from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { isNil } from 'lodash';
import intl from 'utils/intl';

import CorrectionModal from './components/CorrectionModal';
import AddItemModal from './components/AddItemModal';
import NewItemModal from './components/NewItemModal';
import ToMallOrderModal from './components/ToMallOrderModal';
import PrSplitModal from './components/PrSplitModal';

const validateSelected = (selected, type, validates) => {
  const record = selected?.[0] || {};
  const validateMap = validates || [
    {
      flag: selected.length !== 1 && type !== 'toMallOrder',
      message: '只能单选进行，请重新选择数据！',
    },
    {
      flag: ['CATALOGUE', 'E-COMMERCE'].includes(record?.get('prSourcePlatform')) && type === 'addItem',
      message: '电商或目录化来源不支持补充物料信息！',
    },
    {
      flag: ['CATALOGUE', 'E-COMMERCE'].includes(record?.get('prSourcePlatform')) && type === 'correction',
      message: '电商或目录化来源不支持纠偏！',
    },
    {
      flag: !['UNASSIGNED', 'ASSIGNED', 'SOURCE_PRO', 'SOURCE_RFX', 'SOURCE_BID', undefined].includes(record.get('executionStatusCode')) && type === 'addItem',
      message: '只有[待分配]或[已分配]或[已转寻源立项]或[已转询报价]或[已转招投标]的数据才能补充物料信息，请重新选择数据！',
    },
    {
      flag: !['UNASSIGNED', 'ASSIGNED', 'SOURCE_PRO', 'SOURCE_RFX', 'SOURCE_BID', undefined].includes(record.get('executionStatusCode')) && type === 'correction',
      message: '只有[待分配]或[已分配]或[已转寻源立项]或[已转询报价]或[已转招投标]的数据才能纠偏，请重新选择数据！',
    },
    {
      flag: selected.some(r=> !r.get('productNum')) && type === 'toMallOrder',
      message: '商品编码为空，不能转商城订单',
    },
    {
      flag: selected.some(r=> +r.get('attributeVarchar12') === 1) && type === 'toMallOrder',
      message: '即采即用的需求不能转商城订单！',
    },
    {
      flag: !(record?.get('attributeVarchar18') === '自采' || ((record?.get('attributeVarchar18') === '集采' || isNil(record?.get('attributeVarchar18'))) && +record?.get('attributeVarchar3') === 1)) && type === 'addItem',
      message: '非自采或集采需补充物料不为是，不支持补充物料信息，请重新选择数据！',
    },
    {
      flag: +record?.get('attributeVarchar7') === '1' && type === 'addItem',
      message: '已有物料新增数据，不能重复新增！',
    },
    {
      flag: !!record?.get('itemId') && type === 'prSplit',
      message: '有物料编码的需求不可拆分! ',
    },
    {
      flag: +record?.get('attributeVarchar9') === 1 && !record?.get('attributeLongtext17') && ['correction', 'newItem', 'addItem', 'toMallOrder'].includes(type), // 被拆分行，不可操作
      message: '需求已拆分，不能进行其他操作！',
    },
  ];
  return validateMap.every(item => {
    if (item.flag) {
      notification.warning({
        message: item.message,
      });
    }
    return !item.flag;
  });
};

const openModal = (title, children) => {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    closable: true,
    destroyOnClose: true,
    style: { width: 1180 },
    title,
    children,
  });
};

const handleCorrection = (currentDs) => async () => {
  const { selected } = currentDs;
  if(validateSelected(selected, 'correction')){
    openModal('需求纠偏', <CorrectionModal record={selected[0]} dataSet={currentDs} />);
  }
};

const handleAddItem = (currentDs) => async () => {
  const { selected } = currentDs;
  if(validateSelected(selected, 'addItem')){
    openModal('物料补充', <AddItemModal record={selected[0]} dataSet={currentDs} />);
  }
};

const handleNewItem = (currentDs) => async () => {
  const { selected } = currentDs;
  if(validateSelected(selected, 'newItem')){
    openModal('物料新增', <NewItemModal pageData={{ record: selected[0], dataSet: currentDs }} fromPage="purchaseExecution" />);
  }
};

const handleToMallOrder = (currentDs) => async () => {
  const { selected } = currentDs;
  if(validateSelected(selected, 'toMallOrder')){
    openModal('生成商城采购申请', <ToMallOrderModal pageData={{ selected, dataSet: currentDs }} />);
  }
};

const handleNeedAddItem = (currentDs) => async () => {
  const { selected } = currentDs;
  const validate = [
    {
      flag: selected.some(record => !['UNASSIGNED', 'ASSIGNED', undefined].includes(record.get('executionStatusCode'))),
      message: '只有[待分配]或[已分配]的数据才能需补充物料信息，请重新选择数据！',
    },
    {
      flag: selected.some(record => ![null, undefined, 0, '0'].includes(record.get('attributeVarchar3'))),
      message: '已通知需求申请人补充物料信息，不能重复通知补充物料信息！',
    },
    {
      flag: selected.some(record => +record?.get('attributeVarchar9') === 1 && !record?.get('attributeLongtext17')), // 被拆分行，不可操作
      message: '需求已拆分，不能进行其他操作！',
    },
  ];
  if(validateSelected(selected, '', validate)){
    const result = await request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/QoMJ3zEWTs3ZEbGZZxJHSkqad6wPXxTGvicPj5pY15cA`,
      {
        method: 'POST',
        body: selected.map(i => i.toData()),
      }
    );
    if (getResponse(result) && currentDs) {
      currentDs.query();
    };
  }
};

const handlePrSplit = (currentDs) => async () => {
  const { selected } = currentDs;
  if(validateSelected(selected, 'prSplit')){
    openModal('需求拆分', <PrSplitModal pageData={{ record: selected[0], dataSet: currentDs }} />);
  }
};

const getCuxHeaderButtons = (props) => {
  const { currentDs, tabActiveKey } = props || {};
  const cuxCorrectionBtn = {
    name: 'cuxCorrection',
    child: '纠偏',
    btnComp: PermissionButton,
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handleCorrection(currentDs),
      hidden: !['approved', 'assigned', 'all'].includes(tabActiveKey),
      permissionList: [
        {
          code: 'hzero.srm.requirement.prm.pr-execution.button.cuxCorrection',
          type: 'button',
        },
      ],
    },
  };
  const cuxAddItemBtn = {
    name: 'cuxAddItem',
    child: '补充物料信息',
    btnComp: PermissionButton,
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handleAddItem(currentDs),
      hidden: !['approved', 'assigned', 'all'].includes(tabActiveKey),
      permissionList: [
        {
          code: 'hzero.srm.requirement.prm.pr-execution.button.cuxAddItem',
          type: 'button',
        },
      ],
    },
  };
  const cuxNewItemBtn = {
    name: 'cuxNewItem',
    child: '物料新增',
    btnComp: PermissionButton,
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handleNewItem(currentDs),
      hidden: !['approved', 'assigned', 'all'].includes(tabActiveKey),
      permissionList: [
        {
          code: 'hzero.srm.requirement.prm.pr-execution.button.cuxNewItem',
          type: 'button',
        },
      ],
    },
  };
  const cuxToMallOrderBtn = {
    name: 'cuxToMallOrder',
    child: '转商城订单',
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handleToMallOrder(currentDs),
      hidden: !['order', 'allLine'].includes(tabActiveKey),
    },
  };
  const cuxNeedAddItemBtn = {
    name: 'cuxNeedAddItem',
    child: '需补充物料信息',
    btnComp: PermissionButton,
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handleNeedAddItem(currentDs),
      hidden: !['approved', 'assigned', 'all'].includes(tabActiveKey),
      permissionList: [
        {
          code: 'hzero.srm.requirement.prm.pr-execution.button.cuxNeedAddItem',
          type: 'button',
        },
      ],
    },
  };

  const cuxPrSplitBtn = {
    name: 'cuxPrSplit',
    child: '需求拆分',
    btnComp: PermissionButton,
    btnProps: {
      funcType: 'flat',
      type: 'c7n-pro',
      disabled: !currentDs?.selected?.length,
      onClick: handlePrSplit(currentDs),
      hidden: !['approved', 'assigned', 'all'].includes(tabActiveKey),
      permissionList: [
        {
          code: 'hzero.srm.requirement.prm.pr-execution.button.cuxPrSplit',
          type: 'button',
        },
      ],
    },
  };

  return [cuxCorrectionBtn, cuxNewItemBtn, cuxAddItemBtn, cuxToMallOrderBtn, cuxNeedAddItemBtn, cuxPrSplitBtn];
};

export default new Expose({
  process: {
    getCuxHeaderButtons,
  },
  events: {
    beforeCreateCheck: (eventProps) => {
      const { currentListDs, currentPage } = eventProps || {};
      const selected = currentListDs?.selected || [];
      if(['orderCheck', 'allOrderCheck'].includes(currentPage)) { // 待转订单创建前校验
        const flag = selected.some(record => !['E-COMMERCE', 'CATALOGUE'].includes(record.get('prSourcePlatform')) && +record.get('attributeVarchar12') !== 1);
        if(flag) {
          notification.warning({
            message: intl.get('sprm.common.twnf.message.beforeCreateCheck.createTip').d('即采即用才能新建采购订单！'),
          });
          return false;
        }
      }
      if(['allRfxCheck', 'rfxCheck', 'allProjectCheck', 'projectCheck', 'allBidCheck', 'bidCheck'].includes(currentPage)) { // 询报价、招投标(新)、采购计划(待转寻源立项)
        const flag = selected.some(record => record.get('attributeVarchar28') === '51' && record.get('attributeVarchar18') === '自采' && !record.get('itemCode')); // 一级分类/attributeVarchar28为"51"时，值集：TWNF_YJFL；且物资分类/attributeVarchar18为"自采"，值集：TWNF_WZFL 时，编码为空不允许下一步
        if(flag) {
          notification.warning({
            message: intl.get('sprm.common.twnf.message.beforeCreateRfx.createTip').d('请完善物料信息后再寻源'),
          });
          return false;
        }
      }
      return true;
    },
  },
});
