import React, { useMemo } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { useStore } from '../store/StoreProvider';
import AdjustRecordModal from './AdjustRecordModal';

const BidPlanNode = () => {

  const {
    commonDs: { bidPlanNodeDs } = {},
    editorFlag,
    changeFlag,
  } = useStore();

  if (!bidPlanNodeDs) return null;

  // 获取变更可编辑标识
  const getChangeEditorFlag = (record) => {
    return changeFlag && !record.get('finishedDate');
  };

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

  const columns: ColumnProps[] = useMemo(() => {
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
        editor: (record) => editorFlag || getChangeEditorFlag(record),
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
        editor: (record) => editorFlag || getChangeEditorFlag(record),
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
        editor: (record) => editorFlag || getChangeEditorFlag(record),
      },
    ];
  }, [editorFlag, getChangeEditorFlag]);

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
