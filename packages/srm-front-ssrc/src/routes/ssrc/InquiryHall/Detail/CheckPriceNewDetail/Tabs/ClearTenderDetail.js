/**
 * 中标确认详情 - 清标（只读）
 * - 仅招标业务类型 attributeVarchar12 = 30（建筑类）且来源为项目时展示
 * - 数据来自 marmot 查询接口，按 rfxHeaderId 查询
 */
import React, { useEffect, useMemo } from 'react';
import { Attachment, DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import clearTenderDetailDS from './clearTenderDetailDS';

const organizationId = getCurrentOrganizationId();
const ATTACHMENT_BUCKET_DIRECTORY = 'ssrc-rfx-rfxheader';

const ClearTenderDetail = (props) => {
  const { rfxHeaderId } = props;

  const dataSet = useMemo(() => new DataSet(clearTenderDetailDS({ rfxHeaderId })), [rfxHeaderId]);

  useEffect(() => {
    dataSet.query();
    return () => dataSet.destroy();
  }, [dataSet]);

  const columns = useMemo(
    () => [
      {
        name: 'qbNum',
        width: 140,
      },
      {
        name: 'qbStatus',
        width: 100,
      },
      {
        name: 'processDate',
        width: 160,
      },
      {
        name: 'qbDetail',
        width: 200,
      },
      {
        name: 'qbAmount',
        width: 140,
      },
      {
        name: 'purAttachmentUuid',
        width: 160,
        renderer: ({ value }) =>
          value ? (
            <Attachment
              readOnly
              value={value}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory={ATTACHMENT_BUCKET_DIRECTORY}
              viewMode="popup"
              funcType="link"
              data={{
                tenantId: organizationId,
              }}
            />
          ) : null,
      },
      {
        name: 'lineRemark',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'supplierFeedback',
        width: 160,
      },
      {
        name: 'supplierFeedbackDate',
        width: 160,
      },
    ],
    []
  );

  return (
    <Table dataSet={dataSet} columns={columns} virtual virtualCell style={{ maxHeight: '60vh' }} />
  );
};

export default observer(ClearTenderDetail);
