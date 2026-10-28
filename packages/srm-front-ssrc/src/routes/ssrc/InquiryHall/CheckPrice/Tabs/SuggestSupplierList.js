/**
 * 招标核价 - 清单内容（供应商清单）表格
 * - 头部接口 sourceFrom === 'PROJECT' 时替换「物品明细」页签内容
 * - 数据来自 marmot 查询接口
 * - 可编辑：选用（勾选框）、选用理由（文本框）；分配申请点击弹框维护
 */
import React, { useEffect, useRef } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import AllocateRequestModal from './AllocateRequestModal';
import getSuggestSupplierListColumns, { openBidDetailTab } from './suggestSupplierListColumns';
import { isSuggested } from '../store/suggestSupplierDS';

const SuggestSupplierList = (props) => {
  const { dataSet, rfxHeaderId, sourceKey = 'NEW_BID', customizeTable } = props;
  const allocateRequestModalRef = useRef(null);

  useEffect(() => {
    if (dataSet) {
      dataSet.query();
    }
  }, [dataSet]);

  // 取消选用时清空选用理由
  useEffect(() => {
    if (!dataSet) {
      return undefined;
    }
    const handleUpdate = ({ record, name }) => {
      if (name === 'suggestedFlag' && !isSuggested(record)) {
        record.set('suggestedRemark', null);
      }
    };
    dataSet.addEventListener('update', handleUpdate);
    return () => dataSet.removeEventListener('update', handleUpdate);
  }, [dataSet]);

  // 分配申请：按「招标单 + 供应商 + 标段」查询分配申请明细
  const handleOpenAllocateModal = (record) => {
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.allocateRequest').d('分配申请'),
      drawer: true,
      style: { width: 800 },
      children: (
        <AllocateRequestModal
          rfxHeaderId={rfxHeaderId}
          supplierCompanyId={record.get('supplierCompanyId')}
          attributeLongtext8={record.get('attributeLongtext8')}
          ref={allocateRequestModalRef}
        />
      ),
      onOk: async () => {
        const saved = await allocateRequestModalRef.current?.handleSave?.();
        // 分配申请保存成功后刷新清单
        if (saved) {
          dataSet.query();
        }
        return saved;
      },
    });
  };

  // 投标详情：跳转该供应商的投标详情页
  const handleOpenBidDetail = (record) => {
    openBidDetailTab(record?.toData(), rfxHeaderId);
  };

  const columns = getSuggestSupplierListColumns({
    dataSet,
    onOpenAllocate: handleOpenAllocateModal,
    onOpenBidDetail: handleOpenBidDetail,
  });

  const tableProps = {
    columns,
    dataSet,
    style: { maxHeight: '70vh' },
    virtual: true,
    virtualCell: true,
  };

  const table = <Table {...tableProps} />;

  if (!customizeTable) {
    return table;
  }
  return customizeTable(
    {
      code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUGGEST_SUPPLIER_LIST`,
    },
    table
  );
};

export default observer(SuggestSupplierList);
