import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import EvaluationDetailModal from './EvaluationDetailModal';

const SupplierList = (props) => {
  const { evaluationSupplierDs, prefix } = props;

  const columns = useMemo(
    () => [
      {
        name: 'number',
        width: 80,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'evaluationDetail',
        header: intl.get(`${prefix}.model.twnf.summary.evaluationDetail`).d('评标明细'),
        renderer: ({ record }) => <EvaluationDetailModal record={record} />,
      },
      {
        name: 'techSum',
      },
      {
        name: 'businessSum',
      },
      {
        name: 'priceSum',
      },
    ],
    []
  );

  return evaluationSupplierDs ? <Table dataSet={evaluationSupplierDs} columns={columns} /> : null;
};

export default SupplierList;
