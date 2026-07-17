import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import FormPro from '../../../../components/FormPro';
import { useComputed, observer } from 'mobx-react-lite';

interface EvaluationInfoProps {
  dataSet: DataSet;
  type: string;
}

const EvaluationInfo: React.FC<EvaluationInfoProps> = ({ dataSet, type }) => {
  const showApprovalNote = useComputed(() => {
    const { current } = dataSet;
    if (current) {
      return current.get('nominationStatus') === 'TO_BE_RELEASED';
    }
    return false;
  }, [dataSet]);
  const readOnly = type !== 'edit';
  const allReadOnly = ['readOnly', 'pendingReview'].includes(type);

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
      showApprovalNote && { name: 'submitDesc', _type: 'TextArea', disabled: !showApprovalNote, colSpan: 3 },
      { name: 'caseRequirementCount', _type: 'NumberField', disabled: readOnly },
      { name: 'warrantyPolicy', _type: 'TextArea', colSpan: 2, disabled: readOnly },
      { name: 'nominationAttachmentUuid', disabled: readOnly, _type: 'Attachment' }
    ].filter(Boolean);
    return baseFields;
  }, [readOnly, showApprovalNote]);

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
