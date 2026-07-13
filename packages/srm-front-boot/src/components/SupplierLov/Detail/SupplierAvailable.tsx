import React, { useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { yesOrNoRender } from 'utils/renderer';

export default function SupplierAvailable({ dataSet }: { dataSet: DataSet }) {
  // 供货能力
  const columns: ColumnProps[] = useMemo(
    () => [
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'itemCategoryCode' },
      { name: 'itemCategoryName' },
      { name: 'supplyFlag', renderer: ({ value }) => yesOrNoRender(value) },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} />;
}
