/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext, useMemo } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../store';

const LinkTable = function LinkTable() {
  const { customizeTable, linkTableDs } = useContext(Store);
  const allColsRender = useMemo(() => {
    const cols = [
      {
        name: 'lineNum',
        width: 80,
      },
    ]
    return cols.map(e => ({
      ...e,
      renderer: ({ record, name, text }) => {
        if (record.get('mouldAccountLineExpandId') && record.get('modifyItem') && text !== record.get('modifyItem')[name]) {
          return <Tooltip
            title={intl
              .get(`sprm.common.model.common.beforeChanged`, {
                value: text,
              })
              .d(`变更前：${text}`)}
          >
            <span style={{ color: 'red' }}> {record.get('modifyItem')[name] || '-'} </span>
          </Tooltip>
        } else if (!record.get('mouldAccountLineExpandId')) {
          return <span style={{ color: 'red' }}>{text}</span>
        } else {
          return text
        }
      },
    }))
  }, [linkTableDs])


  return customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.APPROVE.EXPAND_LINE',
      dataSet: linkTableDs,
    },
    <Table
      style={{ maxHeight: '435px' }}
      dataSet={linkTableDs}
      selectionMode="none"
      columns={allColsRender}
    />
  );
};

export default LinkTable;
