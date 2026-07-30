import React, { useMemo, useEffect, } from 'react';
import { Table, Button, useDataSet, Modal, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse } from 'utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { isEmpty } from 'lodash';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';

import { detailMaintenanceDS, quotationLovDS } from '../store/storeDS';
import BidQuotationTemplate from './BidQuotationTemplate/Content';
import { tenderListBillCommonApi } from '../../api';

interface DetailMaintenanceProps {
  bidCatalogSectionId: string;
  baseInfoDs: DataSet;
  editorFlag: boolean;
};

const DetailMaintenance: React.FC<DetailMaintenanceProps> = (props) => {

  const { bidCatalogSectionId, baseInfoDs, editorFlag } = props;
  // 明细维护 ds
  const detailMaintenanceDs = useDataSet(() => detailMaintenanceDS({ baseInfoDs }), []);

  useEffect(() => {
    detailMaintenanceDs.setQueryParameter('bidCatalogSectionId', bidCatalogSectionId);
    detailMaintenanceDs.query();
  }, [bidCatalogSectionId]);

  useEffect(() => {
    if (!editorFlag && detailMaintenanceDs) {
      detailMaintenanceDs.selection = false;
    };
    if (editorFlag && detailMaintenanceDs) {
      detailMaintenanceDs.selection = DataSetSelection.multiple;
    };
  }, [editorFlag, detailMaintenanceDs]);

  // 处理清单维护
  const handleOpenDetail = (record) => {
    const quotationTemplateId = record.get('quotationTemplateId');
    const lovDs = new DataSet(quotationLovDS());
    const templateProps = {
      quotationTemplateId,
      lovDs,
      editorFlag,
    };
    if (quotationTemplateId && lovDs.current) {
      lovDs.current.set('quotationTemplateId', quotationTemplateId);
    };
    return Modal.open({
      destroyOnClose: true,
      drawer: true,
      title: editorFlag ? intl.get('scux.tenderDetail.model.twnf.tenderDetail.inventoryEdit').d('清单维护') : intl.get('scux.tenderDetail.model.twnf.tenderDetail.viewDetailList').d('清单查看'),
      style: { width: 1000 },
      children: <BidQuotationTemplate {...(templateProps as any)} />,
      onOk: () => {
        if (!lovDs.current) return true;
        const newQuotationTemplateId = lovDs.current.get('quotationTemplateId');
        if (lovDs && lovDs.current && newQuotationTemplateId && newQuotationTemplateId !== quotationTemplateId) {
          record.set('quotationTemplateId', newQuotationTemplateId);
        }
      },
    });
  };

  // 表格列定义
  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'lineNum',
      },
      {
        name: 'itemName',
        editor: editorFlag,
        width: 130,
      },
      {
        name: 'uomId',
        editor: editorFlag,
      },
      {
        name: 'quantity',
        editor: editorFlag,
      },
      {
        name: 'taxId',
        editor: editorFlag,
      },
      {
        name: 'detail',
        header: intl.get('scux.tenderDetail.model.twnf.tenderDetail.detailList').d('明细清单'),
        renderer: ({ record }) => (
          <Button funcType={FuncType.link} wait={1000} onClick={() => handleOpenDetail(record)}>
            {editorFlag ? intl.get('scux.tenderDetail.model.twnf.tenderDetail.inventoryEdit').d('清单维护') : intl.get('scux.tenderDetail.model.twnf.tenderDetail.viewDetailList').d('清单查看')}
          </Button>
        ),
      },
      {
        name: 'remark',
        editor: editorFlag,
      },
    ];
  }, [editorFlag]);

  // 保存
  const handleSaveLine = () => {
    return tenderListBillCommonApi({
      operationType: 'SAVE_LINE',
      catalogHeader: baseInfoDs?.current?.toData() || {},
      bidCatalogSectionId,
      catalogLineList: detailMaintenanceDs.toData(),
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        detailMaintenanceDs.query();
      };
    });
  };

  // batch delete
  const handleDelete = () => {
    const selectedRecords = detailMaintenanceDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('bidCatalogLineId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      detailMaintenanceDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      detailMaintenanceDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // 表格按钮
  const buttons: any[] = useMemo(() => {
    return editorFlag ? [
      'add',
      ['delete', {
        icon: 'delete_sweep',
        onClick: handleDelete,
      }],
      <Button funcType={FuncType.link} wait={1000} onClick={handleSaveLine}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ] : [];
  }, [handleDelete, handleSaveLine]);

  return (
    <Table
      dataSet={detailMaintenanceDs}
      columns={columns}
      buttons={buttons}
      pagination={false}
    />
  );
};

export default DetailMaintenance;
