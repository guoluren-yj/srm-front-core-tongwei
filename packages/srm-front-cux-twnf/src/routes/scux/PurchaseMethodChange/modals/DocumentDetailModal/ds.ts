import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();

export const documentDetailDS = (dipRequestNum: string): DataSetProps => ({
  autoQuery: true,
  paging: false,
  selection: false,
  fields: [
    { name: 'bidNum', type: FieldType.string, label: intl.get('scux.purchaseMethodChange.form.bidNum').d('招标单号') },
    { name: 'bidLineItemNum', type: FieldType.number, label: intl.get('scux.purchaseMethodChange.form.bidLineItemNum').d('行号') },
    { name: 'bidStatus', type: FieldType.string, label: intl.get('scux.purchaseMethodChange.form.bidStatus').d('状态') },
    { name: 'amount', type: FieldType.number, label: intl.get('scux.purchaseMethodChange.form.amount').d('金额') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get('scux.purchaseMethodChange.form.creationDate').d('创建时间') },
    { name: 'createdByName', type: FieldType.string, label: intl.get('scux.purchaseMethodChange.form.createdByName').d('创建人') },
  ],
  transport: {
    read: () => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/CGpGyMNByQMMvJ7ZJJZJJr5xLfhqhNlZ2EvBZ5pgA5c`,
      method: 'GET',
      params: { dipRequestNum },
    }),
  },
});
