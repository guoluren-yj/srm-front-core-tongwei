import React, { useEffect, useState } from 'react';

import { Table, DataSet } from 'choerodon-ui/pro';

import { notification } from 'choerodon-ui';

import intl from 'utils/intl';

import { getResponse, filterNullValueObject } from 'utils/utils';

import { fetchFieldList } from './server';

import { queryListApi, exportApi } from './constant';

import ExcelExportPro from './ExcelExportPro';

const List = ({ headerNum, organizationId, autoQuery, queryFieldsLimit, exportFlag }) => {
  const [Ds, setDs] = useState(null);

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!headerNum) return;

    init();
  }, []);

  const init = async () => {
    const fieldList = getResponse(await fetchFieldList({ headerNum }));

    if (!fieldList) return;

    const { fields, dataSet } = getSetDataList(fieldList);

    setDs(new DataSet(dataSet));

    setColumns(fields);
  };

  const getSetDataList = ({ filedDisplayList, filedQueryList }) => {
    const fields = filedDisplayList.map(({ fieldNum, fieldName, fieldLength }) => ({
      name: fieldNum,
      label: fieldName,
      type: 'string',
      width: Number(fieldLength || 100),
    }));

    const queryFields = filedQueryList.map(
      ({ fieldNum, fieldName, fieldType, lovView, selectCode, selectMoreFlag, lovField }) => {
        let data = {
          name: fieldNum,
          label: fieldName,
          type: 'string',
        };
        const isMultiple = [1, '1'].includes(selectMoreFlag);
        if (fieldType === 'SELECT') {
          data = { ...data, lookupCode: selectCode, multiple: isMultiple ? ',' : false };
        } else if (fieldType === 'LOV') {
          data = {
            ...data,
            type: 'object',
            lovCode: lovView,
            lovPara: { tenantId: organizationId },
            multiple: isMultiple,
            transformRequest: value => {
              if (!value) return null;

              if (!lovField) {
                notification.warning({
                  message: '警告',
                  description: `${fieldName}字段缺少valueField配置,请去配置表配置该字段属性`,
                });
                return null;
              }
              if (isMultiple) return value.map(res => res[lovField]).join(',');
              else return value[lovField];
            },
          };
        } else if (fieldType === 'DATE_PICKER') {
          data = { ...data, type: 'date' };
        }
        return data;
      }
    );

    const dataSet = {
      autoQuery: ['1', 1].includes(autoQuery),
      selection: false,
      fields,
      queryFields,
      transport: {
        read: () => {
          return {
            url: `/marmot/v1/${organizationId}/marmot-api/${queryListApi}?headerNum=${headerNum}`,
            method: 'GET',
          };
        },
      },
    };

    return { fields, dataSet };
  };

  return Ds ? (
    <Table
      queryFieldsLimit={Number(queryFieldsLimit || 0)}
      buttons={[
        exportFlag === "1" && (
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            method="POST"
            exportAsync
            requestUrl={`/marmot/v1/${organizationId}/marmot-api/${exportApi}?headerNum=${headerNum}`}
            otherButtonProps={{
              funcType: 'flat',
              type: 'c7n-pro',
              icon: '',
            }}
            queryParams={() => ({
              headerNum,
              ...filterNullValueObject(Ds.queryDataSet.toJSONData()[0]),
            })}
          />
        ),
      ]}
      dataSet={Ds}
      columns={columns}
    />
  ) : (
    <></>
  );
};

export default List;
