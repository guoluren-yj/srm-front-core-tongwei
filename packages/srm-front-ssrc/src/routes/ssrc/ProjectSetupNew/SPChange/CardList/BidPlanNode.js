import React, { useEffect, useMemo, useContext } from 'react';
import { Table, Button, Modal, DatePicker } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import moment from 'moment';

import { querySourceProjects } from '@/services/projectSetupService';

import intl from 'utils/intl';

import AdjustRecordModal from './AdjustRecordModal';

import { StoreContext } from '../store/StoreProvider';

/**
 * 计算计划完成时间的可选最小日期（限制选中逻辑）：
 * - 第一个节点（nodeOrder 最小）：不能早于今天
 * - 后续节点：不能早于上一节点所有记录中"最前面的日期"（最早的 planFinishDate）
 * 节点顺序缺失、记录自身无 nodeOrder 或上一节点未填日期时返回 null（不限制）
 */
const getPlanFinishDateMin = (dataSet, record) => {
  const allRecords = dataSet?.records || [];
  // 节点顺序归一化：优先按数值比较，非纯数值时退化为字符串比较
  const getOrderKey = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? String(v) : n;
  };
  const currentOrder = getOrderKey(record?.get('nodeOrder'));
  if (currentOrder === null) return null;
  const uniqueOrders = Array.from(
    new Set(allRecords.map((r) => getOrderKey(r.get('nodeOrder'))).filter((k) => k !== null))
  );
  if (uniqueOrders.length === 0) return null;
  const numericOnly = uniqueOrders.every((o) => typeof o === 'number');
  const sortedOrders = [...uniqueOrders].sort((a, b) =>
    numericOnly ? a - b : String(a).localeCompare(String(b))
  );
  const index = sortedOrders.findIndex((o) => o === currentOrder);
  // 第一个节点：不能早于今天
  if (index === 0) {
    return moment().startOf('day');
  }
  if (index === -1) return null;
  // 后续节点：上一节点多条数据取最前面的日期（最早）
  const prevOrder = sortedOrders[index - 1];
  const prevDates = allRecords
    .filter((r) => getOrderKey(r.get('nodeOrder')) === prevOrder)
    .map((r) => r.get('planFinishDate'))
    .filter((d) => moment(d).isValid())
    .map((d) => moment(d));
  if (prevDates.length === 0) return null;
  return prevDates.reduce((min, d) => (d.isBefore(min) ? d : min));
};

const BidPlanNode = ({ sourceProjectId }) => {

  // @ts-ignore
  const {
      commonDs: { bidPlanNodeDs } = {},
    } = useContext(StoreContext);

  useEffect(() => {
    querySourceProjects(sourceProjectId).then((res) => {
      if (res && !res.failed) {
        bidPlanNodeDs.loadData(res || []);
      }
    });
  }, []);

  // 打开调整记录弹框
  const handleOpenAdjustModal = (record) => {
    const nodeId = record.get('nodeId');
    Modal.open({
      title: intl.get('ssrc.bidPlanWorkBench.view.title.adjustRecord').d('调整记录'),
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      className: 'adjust-record-modal',
      children: <AdjustRecordModal nodeId={nodeId} />,
    });
  };

  // 获取变更可编辑标识
  const getChangeEditorFlag = (record) => {
    return !record.get('finishedDate');
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'nodeName',
        width: 120,
      },
      {
        name: 'nodeOrder',
        width: 80,
      },
      {
        header: () => (
          <div>
            <span style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle' }}>
              *{' '}
            </span>
            <span>
              {intl.get(`scux.bidPlanDetail.model.twnf.processNode.userInCharge`).d('负责人')}
            </span>
          </div>
        ),
        name: 'userInCharge',
        editor: (record) => getChangeEditorFlag(record),
        width: 160,
      },
      {
        header: () => (
          <div>
            <span style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle' }}>
              *{' '}
            </span>
            <span>
              {intl.get('scux.bidPlanDetail.model.twnf.processNode.planFinishDate').d('计划完成时间')}
            </span>
          </div>
        ),
        name: 'planFinishDate',
        editor: (record) => {
          // 已完成节点不可编辑；可编辑时限制可选日期（参考 SPUpdate 的逻辑）
          if (!getChangeEditorFlag(record)) {
            return false;
          }
          return (
            <DatePicker
              name="planFinishDate"
              record={record}
              filter={(currentDate) => {
                const minDate = getPlanFinishDateMin(bidPlanNodeDs, record);
                if (minDate) {
                  // 不能选中最小日期之前的日期
                  return !currentDate.isBefore(minDate, 'day');
                }
                return true;
              }}
            />
          );
        },
        width: 120,
      },
      {
        name: 'adjustFlag',
        width: 100,
        renderer: ({ value, record }) => {
          if (Number(value)) {
            return (
              <Button funcType={FuncType.link} wait={1000} onClick={() => handleOpenAdjustModal(record)}>
                {intl.get('scux.bidPlanDetail.model.twnf.processNode.adjustFlag').d('计划调整记录')}
              </Button>
            );
          };
          return null;
        },
      },
      {
        name: 'limitDays',
        width: 120,
      },
      {
        name: 'finishedDate',
        width: 120,
      },
      {
        name: 'differDays',
        width: 120,
      },
      {
        name: 'remark',
        editor: (record) => getChangeEditorFlag(record),
      },
    ];
  }, [bidPlanNodeDs]);

  return (
    <Table
      dataSet={bidPlanNodeDs}
      columns={columns}
      customizable
      customizedCode="SCUX_TWNF_BID_PLAN_DETAIL_BID_PLAN_NODE_LIST"
    />
  );
};

export default BidPlanNode;
