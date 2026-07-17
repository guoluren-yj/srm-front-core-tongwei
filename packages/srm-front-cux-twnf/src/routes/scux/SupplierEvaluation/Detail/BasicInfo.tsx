import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import FormPro from '../../../../components/FormPro';
import { prefix } from './initialDs';

interface BasicInfoProps {
  dataSet: DataSet;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ dataSet }) => {
  return (
    <FormPro
      dataSet={dataSet}
      columns={3}
      readOnly
      fields={[
        { name: 'companyName' },
        { name: 'sourceProjectName' },
        { name: 'bidDirectorName' },
        { name: 'reviewType', label: '标的类型' },
      ]}
    />
  );
};

export default BasicInfo;
