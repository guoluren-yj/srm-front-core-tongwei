import React, { useMemo } from "react";
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import intl from 'utils/intl';

export default function ReferenceDocument(props) {
  const { tableDs } = props;

  const columns: ColumnProps[] = useMemo(() => [
    {
      name: 'rfxNum',
    },
    {
      name: 'rfxTitle',
    },
    {
      name: 'checkedByName',
    },
    {
      name: 'suggestAmount',
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'attributeVarchar12Meaning',
    },
  ], []);

  return (
    <FilterBarTable
      columns={columns}
      dataSet={tableDs}
      border={false}
      cacheState
      filterBarConfig={{
        cacheKey: 'referenceDocumentList',
        autoQuery: true,
        left: {
          render: (ds) => {
            if (ds && (!ds.getField('multiProjectNumOrTitle') || !ds.getField('multiProjectNumOrTitle')?.get('transformRequest'))) {
              ds.addField('multiProjectNumOrTitle', {
                transformRequest: (value) => {
                  if (value) {
                    return value.join(',');
                  }
                  return '';
                },
              });
            };
            return (
              <MultipleTextSplitInput
                name="multiProjectNumOrTitle"
                dataSet={ds}
                placeholder={intl
                  .get('scux.clearTenderManagement.view.placeholder.referenceDocNumAndName')
                  .d('招标单号，项目名称')}
                style={{ width: '3rem' }}
              />
            );
          },
        },
      }}
      customizable
      customizedCode="SCUX_TWNF_CLEAR_TENDER_WORK_BENCH_ADD_REFERENCE_DOCUMENT_LIST"
    />
  );
};
