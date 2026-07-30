import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { isEmpty, omit } from 'lodash';

import { downloadFileByAxios } from 'srm-front-boot/lib/services/MarmotDownloadButtonServices';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

import { useStore } from '../store/StoreProvider';

const BidPlanNode = () => {

  const {
    commonDs: { technicalFileDs } = {},
    editorFlag,
    techFileId,
  } = useStore();

  if (!technicalFileDs) return null;

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'fileName',
        editor: editorFlag,
        width: 140,
      },
      {
        name: 'fileType',
        editor: editorFlag,
        width: 100,
      },
      {
        name: 'attachmentUuid',
        editor: editorFlag,
        width: 100,
      },
      {
        name: 'submittedByName',
        width: 120,
      },
      {
        name: 'submittedDate',
        width: 130,
      },
      {
        name: 'remark',
        editor: editorFlag,
      },
    ];
  }, []);

  // batch delete
  const handleDelete = () => {
    const selectedRecords = technicalFileDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('techFileDetailId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      technicalFileDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      technicalFileDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // 附件下载
  const handleDownloadAttachment = () => {
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeHEXRxLvctcncYvAkDh8Yzc`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'POST',
      queryData: {
        postType: "FILE_DOWNLOAD",
        techFileId,
      },
    }));
  }

  const buttons = useMemo(() => {
    return editorFlag ? [
      'add',
      ['delete', {
        icon: 'delete_sweep',
        onClick: handleDelete,
      }],
    ] : [
      <Button icon="file_download_black-o" wait={1000} onClick={handleDownloadAttachment}>
        {intl.get('scux.technicalDocumentsDetail.view.button.downloadAttachment').d('附件下载')}
      </Button>
    ]
  }, [editorFlag]);

  return (
    <Table
      dataSet={technicalFileDs}
      columns={columns}
      buttons={buttons as any[]}
      customizable
      customizedCode="'SCUX_TWNF_TECHNICAL_DOCUMENTS_DETAIL_TECH_FILE_LIST"
    />
  );
};

export default BidPlanNode;