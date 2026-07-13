/*
 * @Autor: wenjia.hong@going-link.com
 * @Date: 2021-06-01 21:19:35
 * @LastEditTime: 2021-08-12 15:23:44
 * @Description:
 * @Version: 2.0
 */

import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getTableDs = () => ({
  autoQuery: true, // 初始化后自动查询
  autoCreate: true, // 初始化时，如果没有记录且 autoQuery 为 false，则自动创建记录
  queryFields: [
    {
      name: 'typeCode',
      type: 'string',
      label: intl.get('siec.pcnType.model.pcnType.typeCode').d('变更类型编码'),
    },
    {
      name: 'typeName',
      type: 'string',
      label: intl.get('siec.pcnType.model.pcnType.typeName').d('变更类型名称'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('siec.pcnType.model.pcnType.enabledFlag').d('是否启用'),
      lookupCode: 'HPFM.FLAG',
    },
  ],
  fields: [
    {
      name: 'typeCode',
      type: 'string',
      required: true,
      label: intl.get('siec.pcnType.model.pcnType.typeCode').d('变更类型编码'),
    },
    {
      name: 'typeName',
      type: 'intl',
      required: true,
      label: intl.get('siec.pcnType.model.pcnType.typeName').d('变更类型名称'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('siec.pcnType.model.pcnType.attachmentUuid').d('变更附件模板'),
    },
    {
      name: 'changeCategory',
      label: intl.get('siec.pcnType.model.pcnType.attachmentUuids').d('所属大类'),
      lookupCode: 'SIEC.CHANGE_CATEGORY',
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('siec.pcnType.model.pcnType.enabledFlag').d('启用'),
      lookupCode: 'HPFM.FLAG',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-change-types`,
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-change-types/save`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

const editFormDS = () => ({
  fields: [
    {
      name: 'typeCode',
      type: 'string',
      required: true,
      label: intl.get('siec.pcnType.model.pcnType.typeCode').d('变更类型编码'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('typeCode'))) {
          return intl
            .get('siec.pcnType.typeCode.validation.notChinese')
            .d('变更类型编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'typeName',
      type: 'intl',
      required: true,
      label: intl.get('siec.pcnType.model.pcnType.typeName').d('变更类型名称'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('siec.pcnType.model.pcnType.attachmentUuid').d('变更附件模板'),
    },
    {
      name: 'changeCategory',
      label: intl.get('siec.pcnType.model.pcnType.attachmentUuids').d('所属大类'),
      lookupCode: 'SIEC.CHANGE_CATEGORY',
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('siec.pcnType.model.pcnType.enabledFlag').d('开启'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-change-types/save`,
        method: 'POST',
        data: data[0],
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, { status: 'update' });
      });
    },
  },
});

export { getTableDs, editFormDS };
