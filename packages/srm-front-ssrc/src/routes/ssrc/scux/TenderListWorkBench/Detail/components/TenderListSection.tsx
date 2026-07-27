import React, { useMemo, useRef } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { isEmpty } from 'lodash';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { useStore } from '../store/StoreProvider';
import DetailMaintenance from './DetailMaintenance';
import { tenderListBillCommonApi } from '../../api';

const TenderListSection = () => {

  const {
    commonDs: { baseInfoDs, tenderListSectionDs } = {},
    editorFlag,
    initData = () => {},
  } = useStore();

  if (!tenderListSectionDs) return null;

  const detailRef = useRef<any>(null);

  // 打开明细维护弹框
  const handleOpenDetail = (record) => {
    const bidCatalogSectionId = record.get('bidCatalogSectionId');
    const sectionName = record.get('sectionName');
    if (!baseInfoDs) return;
    const modal = Modal.open({
      title: editorFlag ? intl.get('ssrc.tenderDetail.view.title.detailEdit').d('明细维护') : intl.get('ssrc.tenderDetail.view.title.viewDetail').d('明细查看'),
      drawer: true,
      destroyOnClose: true,
      closable: true,
      style: {
        width: 850,
      },
      footer: (okBtn: any, cancelBtn: any) => (
        <>
          <Button
            color={ButtonColor.primary}
            onClick={async () => {
              await detailRef.current?.save();
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.ok').d('确认')}
          </Button>
          {cancelBtn}
        </>
      ),
      children: <DetailMaintenance ref={detailRef} baseInfoDs={baseInfoDs} bidCatalogSectionId={bidCatalogSectionId} editorFlag={editorFlag} sectionName={sectionName} />,
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

  const catalogStatus = baseInfoDs?.current?.get('catalogStatus');

  const handleSave = async () => {
    if (!tenderListSectionDs?.length) {
      notification.warning({
        message: intl.get('scux.tenderDetail.view.tip.sectionRequired').d('至少维护一条标段数据'),
      });
      return;
    }
    const res = await tenderListBillCommonApi({
      operationType: 'SAVE_CATALOG',
      catalogHeader: baseInfoDs?.current?.toData() || {},
      sectionList: tenderListSectionDs?.toData(),
    });
    if (getResponse(res)) {
      notification.success({});
      initData();
    }
  };

  const buttons : any[] = useMemo(() => {
    if (!editorFlag || catalogStatus === 'SOURCE_CHANGING') return [];
    return [
      'add',
      ['delete', {
        icon: 'delete_sweep',
        onClick: handleDelete,
      }],
      ['save', {
        icon: 'save',
        onClick: handleSave,
      }],
    ];
  }, [editorFlag, catalogStatus]);

  return (
    <>
      {catalogStatus === 'SOURCE_CHANGING' && (
        <Alert
          type="info"
          message="提示: 招标文件已创建，不允许进行标段的增减!"
          style={{ marginBottom: 8 }}
        />
      )}
      <Table
        dataSet={tenderListSectionDs}
        columns={columns}
        buttons={buttons}
        customizable
        customizedCode="'SCUX_TWNF_TENDER_LIST_DETAIL_TENDER_LIST"
      />
    </>
  );
};

export default TenderListSection;
