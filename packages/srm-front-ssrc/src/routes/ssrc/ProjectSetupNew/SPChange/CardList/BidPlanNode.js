import React, { useEffect, useMemo, useContext } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { querySourceProjects } from '@/services/projectSetupService';

import intl from 'utils/intl';

import AdjustRecordModal from './AdjustRecordModal';

import { StoreContext } from '../store/StoreProvider';

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
        editor: (record) => getChangeEditorFlag(record),
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
  }, []);

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
