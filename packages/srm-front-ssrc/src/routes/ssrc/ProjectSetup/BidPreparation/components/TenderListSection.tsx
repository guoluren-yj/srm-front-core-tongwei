import React, { useMemo } from 'react';
import { Table, Button, Modal, DataSet, Form, Output } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import DetailMaintenance from '@/routes/ssrc/scux/TenderListWorkBench/Detail/components/DetailMaintenance';

interface TenderListSectionProps {
  tenderHeaderDs: DataSet;
  tenderListSectionDs: DataSet;
}
const TenderListSection:React.FC<TenderListSectionProps> = (props) => {

  const { tenderHeaderDs, tenderListSectionDs } = props;

  // 打开明细维护弹框
  const handleOpenDetail = (record) => {
    const bidCatalogSectionId = record.get('bidCatalogSectionId');
    Modal.open({
      title: intl.get('ssrc.tenderDetail.view.title.viewDetail').d('明细查看'),
      drawer: true,
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      children: <DetailMaintenance baseInfoDs={tenderHeaderDs} bidCatalogSectionId={bidCatalogSectionId} editorFlag={false} />,
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
      },
      {
        name: 'detailRender',
        header: intl.get('scux.tenderDetail.modal.tenderDetail.detailRender').d('明细'),
        renderer: ({ record }) => {
          return record?.get('bidCatalogSectionId') ? (
            <Button funcType={FuncType.link} wait={500} onClick={() => handleOpenDetail(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      },
    ];
  }, [handleOpenDetail]);

  return (
    <>
      <Form dataSet={tenderHeaderDs} columns={3}>
        <Output name="catalogStatus" />
        <Output name="catelogNum" />
      </Form>
      <Table
        dataSet={tenderListSectionDs}
        columns={columns}
        customizable
        customizedCode="'SCUX_TWNF_TENDER_LIST_DETAIL_TENDER_LIST"
      />
    </>
  );
};

export default observer(TenderListSection);
