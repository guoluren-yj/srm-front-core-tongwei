import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess, handleDealQueryData } from '../utils/fun';

const formDataSet = (): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'companyName',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.companyName').d('公司'),
      },
      {
        name: 'rfxTitle',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.rfxTitle').d('招标名称'),
      },
      {
        name: 'createdByName',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.createdByName').d('招标经理'),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { rfxHeaderId } = dataSet?.queryParameter as { rfxHeaderId?: string };
        return {
          method: 'GET',
          url: `/ssrc/v1/${getCurrentOrganizationId()}/rfx/simple/${rfxHeaderId}`,
        };
      },
    }
  };
}

const tableDataSet = (): DataSetProps => {
  return {
    primaryKey: 'rfxLineSupplierId',
    autoQuery: false,
    selection: false,
    pageSize: 20,
    forceValidate: true,
    fields: [
      {
        name: 'sequence',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.sequence').d('序号'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.supplierCompanyName').d('供应商名称'),
      },
      {
        name: 'contactName',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.contactName').d('联系人'),
      },
      {
        name: 'contactMobilephone',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.contactMobilephone').d('联系电话'),
      },
      {
        name: 'repeatIpFlag',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.repeatIpFlag').d('IP是否重合'),
      },
      {
        name: 'attributeVarchar11',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.validCheck').d('有效性检查'),
        required: true,
        lookupCode: 'SCUX.TWNF_BID_STA_CON',
      },
      {
        name: 'attributeLongtext11',
        label: intl.get('scux.confirmationOfBiddingStatus.model.twnf.lineRemark').d('备注'),
        dynamicProps: ({ record }) => ({
          required: record.get('attributeVarchar11') === '0',
        }),
      }
    ],
    transport: {
      read: ({ params, dataSet }) => {
        const { rfxHeaderId } = dataSet?.queryParameter as { rfxHeaderId?: string };
        return {
          method: 'POST',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqcuXpZzya7cR6tqLeyib6RhkTiahDph05Jw6ZvrFaHxk0u`,
          data: {
            ...params,
            postType: 'GET', // GET（查询）/SAVE（保存）/SUBMIT（提交）,
            rfxHeaderId,
          },
        };
      },
    },
  };
};

export { formDataSet, tableDataSet };