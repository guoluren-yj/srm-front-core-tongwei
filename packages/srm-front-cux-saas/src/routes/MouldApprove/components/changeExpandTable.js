/*
 * @Descripttion:
 * @version:
 * @Author: wuhepeng
 * @Date: 2022-08-12 11:32:32
 * @LastEditors: wuhepeng
 * @LastEditTime: 2022-08-12 11:32:22
 */
import React, { useRef, useLayoutEffect, useState } from 'react';
import intl from 'utils/intl';
import { isArray } from 'lodash';
import { observer } from 'mobx-react-lite';

import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import { Table, Button } from 'choerodon-ui/pro';

import styles from '../index.less';

import { fetchPermissions } from '@/services/mouldAccountService';

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

const ChangeExpandTable = ({ dataSet, disabled, customizeTable, isSupplier }) => {
  const [showExpandTable, setShowExpandTable] = useState(false);
  fetchPermissions([
    isSupplier
      ? 'srm.pcn-admin.mould-manager.mould-accounts.ps.maexpend_content'
      : 'srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.maexpend_content',
  ]).then(res => {
    if (getResponse(res) && isArray(res)) {
      setShowExpandTable(res[0]?.approve);
    }
  });

  const tableRef = useRef({});

  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  const lineExpandTable = customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE_EXPAND',
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
      setShowExpandTable(false);
    }
  }, []);

  return (
    showExpandTable && (
      <Content className={`${styles['custom-page-content']} ${styles.modifyItemContent}`}>
        <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
          {intl.get('siec.mould.common.materialExpand.changeContent').d('关联子模具信息变更内容')}
        </h3>
        {lineExpandTable}
      </Content>
    )
  );
};

export default observer(ChangeExpandTable);
