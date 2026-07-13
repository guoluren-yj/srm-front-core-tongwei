import { Expose } from 'hzero-front/lib/utils/remote';
import { isEmpty } from "lodash";
import intl from 'utils/intl';

import { openMdmModal } from "./utils";


export default new Expose({
  process: {
    cuxHeadBtns: (headerButtons, otherProps) => {
      if(isEmpty(otherProps) || isEmpty(headerButtons)){
        return headerButtons;
      }
      const { btnLoading } = otherProps;
      const cuxBtn = {
        name: 'getMdmMateriel',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'operation_service_request',
          onClick: () => openMdmModal(otherProps),
          loading: btnLoading || false,
        },
        child: intl.get('smdm.materiel.scux.button.getMdmMateriel').d('获取MDM物料'),
      };
      headerButtons.push(cuxBtn);
      return headerButtons;
    },
  },
});