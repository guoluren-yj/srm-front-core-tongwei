import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import FormPro from '../../../../components/FormPro';
import { useComputed, observer } from 'mobx-react-lite';

interface EvaluationInfoProps {
  dataSet: DataSet;
  type: string;
}

const EvaluationInfo: React.FC<EvaluationInfoProps> = ({ dataSet, type }) => {
  const isView = type === 'view' || type === 'readOnly' || type === 'change';
  const showApprovalNote = useComputed(() => {
    if (type === 'submit' || isView) return true;
    const { current } = dataSet;
    if (current) {
      return current.get('nominationStatus') === 'TO_BE_RELEASED';
    }
    return false;
  }, [dataSet, type]);
  const readOnly = type !== 'edit';
  const allReadOnly = ['readOnly', 'pendingReview', 'change'].includes(type);

  const fields = useMemo(() => {
    const baseFields = [
      { name: 'nominationNum', _type: 'TextField', disabled: true },
      { name: 'nominationStatusMeaning', _type: 'TextField', disabled: true },
      { name: 'creationDate', _type: 'DateTimePicker', disabled: true },
      { name: 'createdByName', _type: 'TextField', disabled: true },
      { name: 'technicalPersonName', _type: 'TextField', disabled: true },
      { name: 'financePersonLov', _type: 'Lov', disabled: readOnly },
      { name: 'supManagerPersonLov', _type: 'Lov', disabled: readOnly },
      { name: 'functionalHeadUserLov', _type: 'Lov', disabled: readOnly },
      { name: 'positionLov', _type: 'Lov', disabled: readOnly },
      { name: 'caseRequirementCount', _type: 'NumberField', disabled: readOnly },
      { name: 'warrantyPolicy', _type: 'TextArea', colSpan: 3, disabled: readOnly },
      showApprovalNote && { name: 'submitDesc', _type: 'TextArea', disabled: type !== 'submit', required: type === 'submit', colSpan: 3 },
      isView && { name: 'fbcNumber', _type: 'TextField', disabled: true, colSpan: 1,
        renderer: ({ value, dataSet: ds }: any) => {
          const url = ds?.current?.get('fbcUrl');
          if (url) return <a href={url} target="_blank" rel="noopener noreferrer">{value}</a>;
          return value;
        },
      },
      isView && { name: 'fbcUrl', _type: 'TextField', disabled: true },
      { name: 'nominationAttachmentUuid', disabled: readOnly, _type: 'Attachment', colSpan: 3 },
    ].filter(Boolean);
    return baseFields;
  }, [readOnly, showApprovalNote, isView, type]);

  return (
    <FormPro
      dataSet={dataSet}
      columns={3}
      fields={fields}
      readOnly={allReadOnly}
    />
  );
};

export default observer(EvaluationInfo);
