import React, { useMemo } from "react";
import { Table, useDataSet } from "choerodon-ui/pro";

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MARMOT } from "srm-front-boot/lib/utils/config";

const BidPlanNodeAdjustRecord = (props) => {
  const { nodeId } = props;
  if (!nodeId) return null;
  const tableDs = useDataSet(() => {
    return {
      autoQuery: true,
      selection: false,
      paging: false,
      fields: [
        {
          name: 'versionNumber',
          label: intl.get('ssrc.bidPlanDetail.model.adjustModal.twnf.version').d('版本'),
        },
        {
          name: 'oldPlanFinishDate',
          label: intl.get('ssrc.bidPlanDetail.model.adjustModal.twnf.originFinishedDate').d('原计划完成时间'),
        },
        {
          name: 'oldRemark',
          label: intl.get('ssrc.bidPlanDetail.model.adjustModal.twnf.originRemark').d('原备注'),
        },
      ],
      transport: {
        read: () => {
          return {
            url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/OsvaptiagX4D9d74DKiaia8HcwQs4rMb68njyD39cvkhDA`,
            method: 'GET',
            data: {
              nodeId,
              postType: 'QUERY',
            },
          };
        },
      },
    };
  }, [nodeId]);

  const columns = useMemo(() => [
    {
      name: 'versionNumber',
      width: 80,
    },
    {
      name: 'oldPlanFinishDate',
      width: 130,
    },
    {
      name: 'oldRemark',
    },
  ], []);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
    />
  );
};

export default BidPlanNodeAdjustRecord;
