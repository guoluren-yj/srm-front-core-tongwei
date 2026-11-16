import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const prefix = 'scux.bidOpeningAnomalyManagement';

// 头信息ds
const baseInfoDS = ({ abnormalHeaderId }): DataSetProps => {
  return {
    autoQuery: false,
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'exceptionType',
        label: intl.get(`${prefix}.model.twnf.exceptionType`).d('异常类型'),
        lookupCode: 'SCUX.TWNF_BID_EXCEPT_TYPE',
        required: true,
      },
      {
        name: 'rfxNum',
        label: intl.get(`${prefix}.model.twnf.bidFileNo`).d('招标文件编号'),
        type: FieldType.object,
        lovCode: 'SCUX.TWNF_OPEN_BID_LIST_LOV',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            const exceptionType = record?.get('exceptionType');
            if (!exceptionType) return true;
          },
          lovPara: ({ record }) => {
            return {
              exceptionType: record?.get('exceptionType'),
            };
          },
        },
        transformRequest: (value) => value ? value.rfxNum : null,
        transformResponse(value, object) {
          if (value) {
            return {
              rfxHeaderId: object.rfxHeaderId,
              rfxNum: value,
            };
          };
          return null;
        },
      },
      {
        name: 'rfxHeaderId',
        bind: 'rfxNum.rfxHeaderId',
      },
      {
        name: 'rfxTitle',
        label: intl.get(`${prefix}.model.twnf.rfxTitle`).d('项目名称'),
        disabled: true,
        bind: 'rfxNum.rfxTitle',
      },
      {
        name: 'positionId',
        label: intl.get(`${prefix}.model.twnf.positionName`).d('岗位'),
        type: FieldType.object,
        required: true,
        lovCode: 'SCUX_TWNF_LOV_POSITION',
        transformRequest: (value) => value ? value.positionId : null,
        transformResponse: (value, object) => {
          return value ? { positionId: value, positionName: object.positionName } : null;
        },
      },
      {
        label: intl.get(`${prefix}.model.twnf.positionName`).d('岗位'),
        name: 'positionName',
        bind: 'positionId.positionName',
      },
      {
        name: 'createUnitId',
        label: intl.get('scux.clearTenderManagement.model.twnf.createDepartment').d('创建部门'),
        required: true,
        type: FieldType.object,
        lovCode: 'SCUX_TWNF_USER_UNIT',
        transformRequest: (value) => value ? value.unitId : null,
        transformResponse: (value, data) => {
          return value ? {
            unitId: value,
            unitName: data.createdUnitName,
          } : null;
        },
      },
      {
        label: intl.get('scux.clearTenderManagement.model.twnf.createDepartment').d('创建部门'),
        name: 'createUnitName',
        bind: 'createUnitId.unitName',
      },
      {
        name: 'companyId',
        label: intl.get('scux.clearTenderManagement.model.twnf.createCompany').d('创建公司'),
        required: true,
        type: FieldType.object,
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        transformRequest: (value) => value ? value.companyId : null,
        transformResponse: (value, object) => {
          return value ? { companyId: value, companyName: object.companyName } : null;
        },
      },
      {
        label: intl.get('scux.clearTenderManagement.model.twnf.createCompany').d('创建公司'),
        name: 'companyName',
        bind: 'companyId.companyName'
      },
      {
        name: 'creationDate',
        label: intl.get(`${prefix}.model.twnf.creationDate`).d('创建时间'),
        disabled: true,
      },
      {
        name: 'abnormalNum',
        label: intl.get(`${prefix}.model.twnf.openAbnormalNum`).d('开标异常编号'),
        disabled: true,
      },
      {
        name: 'abnormalStatus',
        label: intl.get(`${prefix}.model.twnf.abnormalStatus`).d('状态'),
        disabled: true,
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_EXCEPT_STATUS',
      },
      {
        name: 'createdByName',
        label: intl.get(`${prefix}.model.twnf.createdByName`).d('创建人'),
        disabled: true,
      },
      {
        name: 'exceptionContent',
        label: intl.get(`${prefix}.model.twnf.exceptionContent`).d('异常内容'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            const exceptionType = record?.get('exceptionType');
            if (!exceptionType) return true;
          },
          lookupCode: ({ record }) => {
            const exceptionType = record.get('exceptionType');
            if (exceptionType === '0') { // 开标前
              return 'SCUX.TWNF_BID_EXCEPT_CONT';
            };
            return 'SCUX.TWNF_BID_EXCEPT_CONT2'; // 开标后
          },
        },
      },
      {
        name: 'exceptionReason',
        label: intl.get(`${prefix}.model.twnf.exceptionReason`).d('异常原因'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            const exceptionType = record?.get('exceptionType');
            if (!exceptionType) return true;
          },
          lookupCode: ({ record }) => {
            const exceptionType = record.get('exceptionType');
            if (exceptionType === '0') { // 开标前
              return 'SCUX.TWNF_BID_EXCEPT_REASON';
            };
            return 'SCUX.TWNF_BID_EXCEPT_REASON2'; // 开标后
          },
        },
      },
      {
        name: 'handlingOpinion',
        label: intl.get(`${prefix}.model.twnf.handlingOpinion`).d('处理意见'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            const exceptionType = record?.get('exceptionType');
            if (!exceptionType) return true;
          },
          lookupCode: ({ record }) => {
            const exceptionType = record.get('exceptionType');
            if (exceptionType === '0') { // 开标前
              return 'SCUX.TWNF_BID_EXCEPT_SUG';
            };
            return 'SCUX.TWNF_BID_EXCEPT_SUG2'; // 开标后
          },
        },
      },
      {
        name: 'approvalResult',
        label: intl.get(`${prefix}.model.twnf.approvalResult`).d('审批结果'),
        disabled: true,
      },
      {
        name: 'rejectReason',
        label: intl.get(`${prefix}.model.twnf.rejectReason`).d('拒绝原因'),
        disabled: true,
      },
      {
        name: 'attachmentUuid',
        label: intl.get(`${prefix}.model.twnf.attachmentUuid`).d('附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      {
        name: 'totalControlPrice',
        label: intl.get(`${prefix}.model.twnf.totalControlPrice`).d('总控制价'),
        type: FieldType.number,
        disabled: true,
      },
      {
        name: 'overBudgetPercent',
        label: intl.get(`${prefix}.model.twnf.overBudgetPercent`).d('超概算百分比'),
        type: FieldType.number,
        disabled: true,
      },
      {
        name: 'detailedDesc',
        label: intl.get(`${prefix}.model.twnf.detailedDesc`).d('详细说明'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Whp5I6ibYR3RISvVWASBLy5kxE31zLdYERias7rDSFzwI`,
          method: 'GET',
          data: {
            abnormalHeaderId,
            opreationType: 'HEADER',
          },
        };
      },
    },
  };
};

// 行信息ds
const lineInfoDS = ({ abnormalHeaderId }): DataSetProps => {
  return {
    primaryKey: 'abnormalLineId',
    autoQuery: false,
    selection: false,
    paging: true,
    forceValidate: true,
    fields: [
      {
        name: 'prNum',
        label: intl.get(`${prefix}.model.twnf.prNum`).d('采购申请编号'),
      },
      {
        name: 'itemName',
        label: intl.get(`${prefix}.model.twnf.itemName`).d('标的名称'),
      },
      {
        name: 'prUserName',
        label: intl.get(`${prefix}.model.twnf.prUserName`).d('申请人名称'),
      },
      {
        name: 'attributeVarchar14',
        label: intl.get(`${prefix}.model.twnf.attributeVarchar14`).d('部门名称'),
      },
      {
        name: 'attributeVarchar13',
        label: intl.get(`${prefix}.model.twnf.attributeVarchar13`).d('申请公司'),
      },
      {
        name: 'techUsers',
        label: intl.get(`${prefix}.model.twnf.techUsers`).d('技术负责人'),
      },
      {
        name: 'budgetAmount',
        label: intl.get(`${prefix}.model.twnf.budgetAmount`).d('概算行金额'),
        type: FieldType.number,
      },
      {
        name: 'prDisplayLineNum',
        label: intl.get(`${prefix}.model.twnf.prDisplayLineNum`).d('行号'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Whp5I6ibYR3RISvVWASBLy5kxE31zLdYERias7rDSFzwI`,
          method: 'GET',
          data: {
            abnormalHeaderId,
            opreationType: 'PR',
          },
        };
      },
    },
  };
};

export {
  baseInfoDS,
  lineInfoDS,
};