
import React, { memo, useEffect, useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import indexDataSet, {lineDataColumns} from "@/components/CustomWrapperDs";
import { fetchLineChange, columns } from './methods';

interface IProps {
  fromPoLineLocationId?: string;
  nodeConfigId?: string;
  campKey?: string;
}

const ModalTable = ({ fromPoLineLocationId, nodeConfigId, campKey }:IProps) => {
  const indexDs = useMemo(() => new DataSet(indexDataSet({
    componentData: columns,
    read: fetchLineChange,
    selection: false,
    pageSize: 20,
    paging: true,
  })), [nodeConfigId]);

  useEffect(() => {
    indexDs.setQueryParameter('params', {
      nodeConfigId: nodeConfigId || null,
      fromPoLineLocationId,
      campKey,
    });
    indexDs.query();
  }, [nodeConfigId]);

  return (
    <div style={{ height: 'calc(100vh - 160px)' }}>
      <Table
        virtual
        virtualCell
        columns={lineDataColumns(columns)}
        dataSet={indexDs}
        boxSizing={TableBoxSizing.wrapper}
        style={{ maxHeight: `calc(100% - 25px)` }}
        customizable
        customizedCode="new-strategy-receiptManageConfig-workbench"
      />
    </div>
  );
};

export default memo(ModalTable);