import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import ReferenceContract from './index';

type Props = {
  onCreated?: (inspHeaderId?: number | string) => void;
};

const OpenReferenceContractDrawer = (props?: Props) => {
  const referenceModal = Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.workspace.view.title.referenceDocument').d('引用单据创建'),
    children: (
      <ReferenceContract
        onClose={() => referenceModal.close()}
        onCreated={props?.onCreated}
      />
    ),
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: 1090 },
  });
};

export default OpenReferenceContractDrawer;

