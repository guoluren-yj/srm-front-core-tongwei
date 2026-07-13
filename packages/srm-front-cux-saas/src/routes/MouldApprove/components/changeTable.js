/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-03-08 15:32:32
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-09 17:06:22
 */
import React, { useRef, useLayoutEffect, useState } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import { Content } from 'components/Page';
import { Table, Button } from 'choerodon-ui/pro';

import styles from '../index.less';

const TableButton = observer(({ dataSet }) => {
  const { selected } = dataSet;

  const handleCreate = () => {
    dataSet.create({}, 0);
  };

  const handleLineDelete = () => {
    dataSet.remove(selected);
  };

  return (
    <>
      <Button
        key="create"
        funcType="flat"
        icon="playlist_add"
        color="primary"
        onClick={() => handleCreate()}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>
      <Button
        key="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        onClick={() => handleLineDelete()}
        disabled={selected.length === 0}
      >
        {intl.get('hzero.common.btn.delete').d('删除')}
      </Button>
    </>
  );
});

const ChangeTable = ({ dataSet, disabled, customizeTable }) => {
  const [showTable, setShowTable] = useState(true);

  const tableRef = useRef({});

  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
      editor: disabled,
    },
    {
      name: 'itemName',
      width: 150,
      editor: disabled,
    },
    {
      name: 'categoryId',
      width: 300,
      editor: disabled,
    },
    {
      name: 'uomId',
      width: 150,
      editor: disabled,
    },
    {
      name: 'quantity',
      width: 150,
      editor: disabled,
    },
    {
      name: 'modelSpecs',
      width: 150,
      editor: disabled,
    },
  ];

  const table = customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
      dataSet,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      ref={tableRef}
      buttons={disabled ? [<TableButton dataSet={dataSet} />] : null}
    />
  );

  useLayoutEffect(() => {
    if (!tableRef?.current?.props?.columns?.length) {
      setShowTable(false);
    }
  }, []);

  return (
    showTable && (
      <Content className={`${styles['custom-page-content']} ${styles.modifyItemContent}`}>
        <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
          {intl.get('siec.mould.common.materialChangeContent').d('物料变更内容')}
        </h3>
        {table}
      </Content>
    )
  );
};

export default observer(ChangeTable);
