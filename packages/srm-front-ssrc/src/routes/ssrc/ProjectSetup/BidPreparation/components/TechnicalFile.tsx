import React, { useMemo } from 'react';
import { Table, DataSet, Form, Output } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

interface TechnicalFileProps {
  technicalFileHeaderDs: DataSet;
  technicalFileDs: DataSet;
}
const TechnicalFile:React.FC<TechnicalFileProps> = (props) => {
  const { technicalFileHeaderDs, technicalFileDs } = props;

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'fileName',
        width: 140,
      },
      {
        name: 'fileType',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 100,
      },
      {
        name: 'submittedByName',
        width: 120,
      },
      {
        name: 'submittedDate',
        width: 130,
      },
      {
        name: 'remark',
      },
    ];
  }, []);

  return (
    <>
      <Form dataSet={technicalFileHeaderDs} columns={3}>
        <Output name="techFileNum" />
        <Output name="techFileStatus" />
      </Form>
      <Table
        dataSet={technicalFileDs}
        columns={columns}
        customizable
        customizedCode="'SCUX_TWNF_TECHNICAL_DOCUMENTS_DETAIL_TECH_FILE_LIST"
      />
    </>
  );
};

export default TechnicalFile;