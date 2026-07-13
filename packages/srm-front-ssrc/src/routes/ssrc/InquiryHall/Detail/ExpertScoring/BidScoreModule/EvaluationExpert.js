import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

const EvaluationExpert = (props) => {
  const { evaluationExpertDs } = props;

  const columns = useMemo(
    () => [
      {
        name: 'expertName',
      },
      {
        name: 'evaluateLeaderFlag',
      },
      {
        name: 'attributeVarchar1',
      },
      {
        name: 'scoreStatus',
      },
      {
        name: 'attributeLongtext1',
      },
    ],
    []
  );

  return evaluationExpertDs ? <Table dataSet={evaluationExpertDs} columns={columns} /> : null;
};

export default EvaluationExpert;
