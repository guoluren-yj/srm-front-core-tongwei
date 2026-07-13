import React, { useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import qs from 'querystring';
import { DataSet, Table } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import InformationDataSet from './ds';

const Index = (props) => {
  const { href = '' } = props;
  const search = href.substr(href.indexOf('?'), href.length);
  const { fromPoLineId, fromPcSubjectId } = qs.parse(search.substr(1));
  const InformationDS = new DataSet(InformationDataSet());

  useEffect(() => {
    const params = {
      poLineId: fromPoLineId,
      pcSubjectId: fromPcSubjectId,
    };
    InformationDS.status = 'submitting';
    request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/DAzGnmfSnVlqbyNicFStjIIfQEFg0EjT9ByEHI0qx5iaznfRv4d7zldwyoGUEuPGLM`,
      {
        method: 'POST',
        body: [params],
      }
    ).then((res) => {
      if (res.length && res[0].prLineInfos) {
        InformationDS.loadData(res[0].prLineInfos);
      }
      InformationDS.status = 'ready';
    });
  }, []);

  const Columns = [
    {
      width: 120,
      name: 'displayPrNum',
    },
    {
      width: 120,
      name: 'displayLineNum',
    },
    {
      width: 120,
      name: 'itemName',
    },
    {
      width: 120,
      name: 'quantity',
    },
    {
      width: 120,
      name: 'taxIncludedLineAmount',
    },
    {
      width: 120,
      name: 'currencyCode',
    },
    {
      width: 120,
      name: 'governmentProjectName',
    },
    {
      width: 120,
      name: 'governmentProjectNum',
    },
    {
      width: 120,
      name: 'gpBudgetSubject',
    },
    {
      width: 120,
      name: 'gpBudgetNum',
    },
    {
      width: 120,
      name: 'pcNumAndLine',
    },
    {
      width: 120,
      name: 'poNumAndLine',
    },
  ];

  return (
    <>
      <Table dataSet={InformationDS} columns={Columns} />
    </>
  );
};

export default formatterCollections({
  code: ['sinv.receiptWorkbench'],
})(Index);
