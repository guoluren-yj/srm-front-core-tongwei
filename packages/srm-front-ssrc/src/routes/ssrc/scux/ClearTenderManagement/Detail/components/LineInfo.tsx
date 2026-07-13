import React, { useMemo } from "react";
import { Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import { useStore } from '../store/StoreProvider';

const LineInfo: React.FC<any> = () => {

  const {
    commonDs: { lineInfoDs } = {},
    editorFlag,
  } = useStore();

  if (!lineInfoDs) {
    return null;
  };

  const columns: ColumnProps[] = useMemo(() => [
    {
      name: 'qbLineNum',
    },
    {
      name: 'rfxLineItemName',
    },
    {
      name: 'sectionName',
    },
    {
      name: 'suggestedAmount',
    },
    {
      name: 'qbAmount',
      editor: editorFlag,

    },
    {
      name: 'deviation',
      editor: editorFlag,
    },
    {
      name: 'lineRemark',
      editor: editorFlag,
    },
    {
      name: 'lineAttachmentUuid',
      editor: editorFlag,
    },
  ], [editorFlag]);
  return (
    <Table
      dataSet={lineInfoDs}
      columns={columns}
    />
  );
};

export default LineInfo;