import React, { useMemo } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { isEmpty } from 'lodash';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { useStore } from '../store/StoreProvider';
import DetailMaintenance from './DetailMaintenance';

const TenderListSection = () => {

  const {
    commonDs: { baseInfoDs, tenderListSectionDs } = {},
    editorFlag,
  } = useStore();

  if (!tenderListSectionDs) return null;

  // 打开明细维护弹框
  const handleOpenDetail = (record) => {
    const bidCatalogSectionId = record.get('bidCatalogSectionId');
    const sectionName = record.get('sectionName');
    if (!baseInfoDs) return;
    Modal.open({
      title: editorFlag ? intl.get('ssrc.tenderDetail.view.title.detailEdit').d('明细维护') : intl.get('ssrc.tenderDetail.view.title.viewDetail').d('明细查看'),
      drawer: true,
      destroyOnClose: true,
      closable: true,
      style: {
        width: 850,
      },
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      children: <DetailMaintenance baseInfoDs={baseInfoDs} bidCatalogSectionId={bidCatalogSectionId} editorFlag={editorFlag} sectionName={sectionName} />,
    });
  };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'sectionNum',
        width: 100,
      },
      {
        name: 'sectionName',
        editor: editorFlag,
      },
      {
        name: 'itemName',
        editor: editorFlag,
      },
      {
        name: 'remark',
        editor: editorFlag,
      },
      {
        name: 'detailRender',
        header: intl.get('scux.tenderDetail.modal.tenderDetail.detailRender').d('明细维护'),
        renderer: ({ record }) => {
          return record?.get('bidCatalogSectionId') ? (
            <Button funcType={FuncType.link} wait={500} onClick={() => handleOpenDetail(record)}>
              {editorFlag ? intl.get('hzero.common.button.edit').d('编辑') : intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      },
    ];
  }, [editorFlag]);

  // batch delete
  const handleDelete = () => {
    const selectedRecords = tenderListSectionDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('bidCatalogSectionId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      tenderListSectionDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      tenderListSectionDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  const buttons : any[] = useMemo(() => {
    return editorFlag ? [
      'add',
      ['delete', {
        icon: 'delete_sweep',
        onClick: handleDelete,
      }],
    ] : [];
  }, [editorFlag]);

  return (
    <Table
      dataSet={tenderListSectionDs}
      columns={columns}
      buttons={buttons}
      customizable
      customizedCode="'SCUX_TWNF_TENDER_LIST_DETAIL_TENDER_LIST"
    />
  );
};

export default TenderListSection;
