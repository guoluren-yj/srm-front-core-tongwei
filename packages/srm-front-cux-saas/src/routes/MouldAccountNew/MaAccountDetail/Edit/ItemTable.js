import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { SRM_SIEC } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { Table } from 'choerodon-ui/pro';
import CommonImport from 'hzero-front/lib/components/Import';
import { Store } from '../store';

const ItemTable = function ItemTable() {
  const { customizeTable, itemTableDs, headerDs, commonUpdate } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
      editor: true,
    },
    {
      name: 'itemName',
      width: 150,
      editor: true,
    },
    {
      name: 'categoryId',
      width: 300,
      editor: true,
    },
    {
      name: 'uomId',
      width: 150,
      editor: true,
    },
    {
      name: 'quantity',
      width: 150,
      editor: true,
    },
    {
      name: 'modelSpecs',
      width: 150,
      editor: true,
    },
  ];

  const deleteLine = () => {
    const { selected } = itemTableDs;
    const unSelectedLines = [];
    itemTableDs.delete(selected, false);
    const selectRecordId = selected.map(ele => ele.id);
    itemTableDs.forEach(record => {
      if (!selectRecordId.includes(record.id)) {
        unSelectedLines.push(record);
      }
    });
    itemTableDs.loadData(unSelectedLines);
  };

  const maHeaderId = headerDs?.current?.get('maHeaderId');

  const otherBtns = useMemo(() => {
    if (['PENDING'].includes(headerDs?.current?.get('maStatus'))) {
      return [
        <CommonImport
          prefixPatch={`${SRM_SIEC}`}
          name="importNew"
          buttonProps={{
            funcType: 'flat',
            color: 'primary',
            permissionList: [
              {
                code: `srm.pcn-admin.mould-manager.mould-accounts-purchaser.button.lineImport`,
                type: 'button',
                meaning: '模具台账行导入',
              },
            ],
          }}
          args={{
            tenantId: getCurrentOrganizationId(),
            templateCode: 'SIEC_MOULD_ACCOUNT_LINE_IMPORT',
            maHeaderId,
          }}
          businessObjectTemplateCode="SIEC_MOULD_ACCOUNT_LINE_IMPORT"
          buttonText={intl.get('siec.mould.model.common.lineImport').d('模具台账行导入')}
          successCallBack={() => {
            notification.success();
            commonUpdate();
          }}
        />,
      ];
    } else {
      return [];
    }
  }, [maHeaderId]);

  const btns = [
    'add',
    ['delete', { onClick: () => deleteLine('expand'), icon: 'delete_sweep' }],
    ...otherBtns,
  ];
  return customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      dataSet: itemTableDs,
    },
    <Table dataSet={itemTableDs} buttons={btns} columns={columns} style={{ maxHeight: '435px' }} />
  );
};

export default ItemTable;
