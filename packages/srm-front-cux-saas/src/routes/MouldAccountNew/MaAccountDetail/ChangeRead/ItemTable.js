/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { Table, Tooltip } from 'choerodon-ui/pro';

import { Store } from '../store';

const ItemTable = function ItemTable() {
  const { customizeTable, itemTableDs } = useContext(Store);

  const allColsRender = useMemo(() => {
    const cols = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemLov',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryId',
        width: 300,
      },
      {
        name: 'uomId',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'modelSpecs',
        width: 150,
      },
    ];
    return cols.map(e => ({
      ...e,
      renderer: ({ record, name, text, value }) => {
        const nameKey = {
          itemLov: 'itemCode',
          categoryId: 'categoryName',
          uomId: 'uomName',
        };
        const trueNameKey = nameKey[name] || name;
        if (
          record.get('maLineId') &&
          record.get('modifyItem') &&
          value !== record.get('modifyItem')[name]
        ) {
          return (
            <Tooltip
              title={intl
                .get(`sprm.common.model.common.beforeChanged`, {
                  value: text,
                })
                .d(`变更前：${text}`)}
            >
              <span style={{ color: 'red' }}> {record.get('modifyItem')[trueNameKey] || '-'} </span>
            </Tooltip>
          );
        } else if (!record.get('maLineId')) {
          return <span style={{ color: 'red' }}>{text}</span>;
        } else {
          return text;
        }
      },
    }));
  }, []);

  return customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      dataSet: itemTableDs,
    },
    <Table
      dataSet={itemTableDs}
      selectionMode="none"
      columns={allColsRender}
      style={{ maxHeight: '435px' }}
    />
  );
};

export default ItemTable;
