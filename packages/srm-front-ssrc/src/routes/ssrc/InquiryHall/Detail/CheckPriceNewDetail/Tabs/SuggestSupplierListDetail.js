/**
 * 招标核价详情 - 清单内容（只读）
 * - 仅招标 & 头部 sourceFrom === 'PROJECT' 时展示
 * - 数据与核价页一致，来自 marmot 查询接口
 * - 全部字段只读：选用/选用理由不可修改，分配申请明细也只能查看
 */
import React, { useEffect, useMemo } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import AllocateRequestModal from '../../../CheckPrice/Tabs/AllocateRequestModal';
import getSuggestSupplierListColumns, {
  openBidDetailTab,
} from '../../../CheckPrice/Tabs/suggestSupplierListColumns';
import suggestSupplierListDS from '../../../CheckPrice/store/suggestSupplierDS';

const SuggestSupplierListDetail = (props) => {
  const { rfxHeaderId } = props;

  const dataSet = useMemo(() => new DataSet(suggestSupplierListDS({ rfxHeaderId })), [rfxHeaderId]);

  useEffect(() => {
    dataSet.query();
    return () => dataSet.destroy();
  }, [dataSet]);

  // 分配申请：只读查看明细
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
          readOnly
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 投标详情：跳转该供应商的投标详情页
  const handleOpenBidDetail = (record) => {
    openBidDetailTab(record?.toData(), rfxHeaderId);
  };

  const columns = getSuggestSupplierListColumns({
    dataSet,
    readOnly: true,
    onOpenAllocate: handleOpenAllocateModal,
    onOpenBidDetail: handleOpenBidDetail,
  });

  return (
    <Table dataSet={dataSet} columns={columns} virtual virtualCell style={{ maxHeight: '60vh' }} />
  );
};

export default observer(SuggestSupplierListDetail);
