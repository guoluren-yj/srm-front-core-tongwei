import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_MARMOT } from '_utils/config';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export const tableData = () => ({
  autoQuery: false,
  queryFields: [
    {
      name: 'enterpriseName',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.customerManagement.model.enterpriseName`)
        .d('企业名称'),
    },
    {
      name: 'contacts',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.customerManagement.model.contacts`)
        .d('联系人'),
    },
    {
      name: 'phone',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.customerManagement.model.phone`)
        .d('联系电话'),
    },
  ],
  fields: [
    {
      name: 'enterpriseName',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.enterpriseName`)
        .d('企业名称'),
    },
    {
      name: 'contacts',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.contacts`)
        .d('联系人'),
    },
    {
      name: 'phone',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.phone`)
        .d('联系电话'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.creationDate`)
        .d('提交时间'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.lastUpdatedBy`)
        .d('更新时间'),
    },
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'ZHENYUN.CUSTOMER_MANAGEMENT_STATUS',
      label: intl
        .get(`scux.customerManagement.model.status`)
        .d('状态'),
    },
    {
      name: 'record',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.record`)
        .d('跟进记录'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ZdR5r2ibpw05PTvMk6kxIicicVQ9NMoLlvCDssy6Nb1ia5s`,
        method: 'GET',
      };
    },
  },
});

export const headerData = () => ({
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'enterpriseName',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.customerManagement.model.enterpriseName`)
        .d('企业名称'),
    },
    {
      name: 'contacts',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.customerManagement.model.contacts`)
        .d('联系人'),
    },
    {
      name: 'phone',
      type: FieldType.string,
      lookupCode: 'DYYL_BMDBGLX',
      label: intl
        .get(`scux.customerManagement.model.phone`)
        .d('联系电话'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.creationDate`)
        .d('提交时间'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.lastUpdatedBy`)
        .d('更新时间'),
    },
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'ZHENYUN.CUSTOMER_MANAGEMENT_STATUS',
      required: true,
      label: intl
        .get(`scux.customerManagement.model.status`)
        .d('状态'),
    },
    {
      name: 'record',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.record`)
        .d('跟进记录'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ZdR5r2ibpw05PTvMk6kxIicicVQ9NMoLlvCDssy6Nb1ia5s`,
        method: 'GET',
      };
    },
  },
});

export const lineData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'communicationTime',
      type: FieldType.dateTime,
      required: true,
      label: intl
        .get(`scux.customerManagement.model.communicationTime`)
        .d('沟通时间'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl
        .get(`scux.customerManagement.model.remark`)
        .d('内容'),
    },
  ],
});

/**
 *
 * @param {*} params
 * @param {*} type
 */
export async function fetchRecord(params, type) {
  return request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ZdR5r2ibpw05PTvMk6kxIicicVQ9NMoLlvCDssy6Nb1ia5s`,
    {
      method: 'POST',
      query: { type },
      body: params,
    }
  );
}