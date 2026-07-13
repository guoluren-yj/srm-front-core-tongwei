import React, { useEffect, useMemo } from 'react';
import { Table, Button, Modal, useDataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isArray } from 'lodash';

import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import { querySourceProjects } from '@/services/projectSetupService'; // queryProgress


import intl from 'utils/intl';

import AdjustRecordModal from './AdjustRecordModal';

// 招标计划 - 招标节点
const bidPlanNodeDS = (): DataSetProps => {
  return {
    primaryKey: 'nodeId',
    autoQuery: false,
    selection: false,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'nodeName',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.nodeName`).d('节点名称'),
      },
      {
        name: 'nodeOrder',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.nodeOrder`).d('节点顺序'),
        lookupCode: 'NODE_ORDER',
      },
      {
        name: 'userInCharge',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.userInCharge`).d('负责人'),
        type: FieldType.object,
        lovCode: 'HIAM.TENANT.ACCOUNT',
        required: true,
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value.map(v => v.userId).join(',') : value),
        transformResponse(value, object) {
          const valueArr = value ? value.split(',') : null;
          const valueMeaningArr = value ? (object.userInChargeMeaning || '').split(',') : null;
          return valueArr ? valueArr.map((v, i) => ({
            userId: Number(v),
            userName: valueMeaningArr[i] || v,
          })) : null;
        },
      },
      {
        name: 'planFinishDate',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.planFinishDate').d('计划完成时间'),
        type: FieldType.date,
        required: true,
      },
      {
        name: 'adjustFlag',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.adjustFlag').d('计划调整记录'),
      },
      {
        name: 'limitDays',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.limitDays').d('工作时限（天）'),
      },
      {
        name: 'finishedDate',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.finishedDate').d('实际完成时间'),
        type: FieldType.date,
      },
      {
        name: 'differDays',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.differDays').d('时间差异（天）'),
      },
      {
        name: 'remark',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.remark').d('备注'),
      },
    ],
  };
};

interface BidPlanNodeProps {
  sourceProjectId: string;
}

const BidPlanNode = ({ sourceProjectId }: BidPlanNodeProps) => {

  const bidPlanNodeDs = useDataSet(() => bidPlanNodeDS(), []);

  useEffect(() => {
    querySourceProjects(sourceProjectId).then((res: any) => {
      if (res && !res.failed) {
        bidPlanNodeDs.loadData(res || []);
      }
    });
  }, []);

  // 打开调整记录弹框
  const handleOpenAdjustModal = (record: any) => {
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
