import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';

import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import intl from 'hzero-front/lib/utils/intl';

import { referenceContractDs, prefix } from './store/referenceContractDs';
import { createInspectionFromContracts } from '@/services/scux/inspectionManagementService';
import { getResponse } from 'hzero-front/lib/utils/utils';

type Props = {
  onClose?: () => void;
  onCreated?: (inspHeaderId?: number | string) => void;
  modal?: any;
};

const ReferenceContract = ({ onClose, onCreated, modal }: Props) => {
  const tableDS = useMemo(() => new DataSet(referenceContractDs()), []);

  useEffect(() => {
    tableDS.query();
    updateModal();
  }, [tableDS]);

  const updateModal = () => {
    if (modal) {
      modal.update({
        onOk: handleCreate,
        okText: intl.get(`${prefix}.button.createInspection`).d('新建'),
      });
    }
  };

  const handleCreate = async () => {
    if (tableDS.selected.length === 0) {
      notification.warning({ message: intl.get('hzero.common.message.validation.selectRecord').d('请先选择数据') });
      return false;
    }
    const params = tableDS.selected.map(r => r.toData());
    const res = await createInspectionFromContracts(params);
    if(getResponse(res)){
      if (res?.inspHeaderId && onCreated && onClose) {
        onCreated(res.inspHeaderId);
        onClose();
        return true;
      }
    }
    return false;
  };

  const columns: any[] = useMemo(
    () => [
      { name: 'pcNum' },
      { name: 'pcName' },
      { name: 'taxIncludeAmount' },
      { name: 'pcStatusCodeMeaning' },
      { name: 'createdName' },
      { name: 'companyName' },
      { name: 'creationDate' },
      { name: 'attributeVarchar18Meaning' },
      { name: 'attributeVarchar10' },
      { name: 'attributeVarchar4Meaning' },
    ],
    []
  );

  return (
    <FilterBarTable
      virtual
      virtualCell
      columns={columns}
      dataSet={tableDS as any}
      filterBarConfig={{ autoQuery: false }}
      customizable
      customizedCode="SCUX.INSPECTION_CREATE_LIST"
      searchCode="SCUX.INSPECTION_CREATE_LIST.SEARCH"
    />
  );
};

export default ReferenceContract;

