import { isArray } from 'lodash';

import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from "srm-front-boot/lib/utils/config";
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

// 招标计划 - 基础信息ds
const baseInfoDS = ({ sourceProjectId }): DataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'sourceProjectNum',
        label: intl.get('scux.bidPlanDetail.model.twnf.sourceProjectNum').d('招标编号'),
        disabled: true,
      },
      {
        name: 'sourceProjectName',
        label: intl.get('scux.bidPlanDetail.model.twnf.sourceProjectName').d('招标名称'),
        required: true,
        type: FieldType.intl,
      },
      {
        name: 'attributeVarchar10',
        label: intl.get('scux.bidPlanDetail.model.twnf.templateName').d('招标模板'),
        lovCode: 'SSRC.TEMPLATE_NAME',
        textField: 'templateName',
        valueField: 'templateId',
        type: FieldType.object,
        required: true,
        lovPara: {
          sourceCategory: 'RFX',
          secondarySourceCategory: 'NEW_BID',
          sourceProjectId,
        },
        transformRequest: (value) => value ? value.templateId : null,
        transformResponse(value, object) {
          return value ? { templateId: value, templateName: object.attributeVarchar10Meaning } : null;
        },
        dynamicProps: {
          // help: ({ record }) => {
          //   const flag = record.get('latestFlag');
          //   if (flag === 'N') {
          //     return intl
          //       .get(`ssrc.inquiryHall.model.validation.sourceTemplate`)
          //       .d('非最新版本，你可以重新选择');
          //   }
          // },
        },
      },
      {
        name: 'attributeVarchar10Meaning',
        bind: 'attributeVarchar10.templateName',
        label: intl.get('scux.bidPlanDetail.model.twnf.templateName').d('招标模板'),
      },
      {
        name: 'attributeDecimal10',
        label: intl.get('scux.bidPlanDetail.model.twnf.estimatedAmount').d('概算金额'),
        type: FieldType.number,
        disabled: true,
      },
      {
        name: 'attributeVarchar11',
        label: intl.get('scux.bidPlanDetail.model.twnf.itemType').d('标的类型'),
        type: FieldType.string,
        lookupCode: 'SUBJECT_TYPE',
        required: true,
      },
      {
        name: 'createdByName',
        label: intl.get('scux.bidPlanDetail.model.twnf.createdByName').d('创建人'),
        disabled: true,
      },
      {
        name: 'attributeVarchar12',
        label: intl.get('scux.bidPlanDetail.model.twnf.station').d('岗位'),
        type: FieldType.object,
        lovCode: 'SSTA.QUERY_UNIT_POSITION',
        required: true,
        valueField: 'positionCode',
        textField: 'positionName',
        transformRequest: (value) => value ? value.positionCode : null,
        transformResponse(value, object) {
          return value ? { positionCode: value, positionName: object.attributeVarchar12Meaning } : null;
        },
      },
      {
        name: 'attributeVarchar12Meaning',
        bind: 'attributeVarchar12.positionName',
        label: intl.get('scux.bidPlanDetail.model.twnf.station').d('岗位'),
      },
      {
        name: 'attributeVarchar14',
        label: intl.get('scux.bidPlanDetail.model.twnf.coSignatoryPersonnel').d('会签人员'),
        type: FieldType.object,
        lovCode: 'HIAM.TENANT.ACCOUNT',
        required: true,
        multiple: true,
        valueField: 'userId',
        textField: 'userName',
        transformRequest: (value) => (isArray(value) ? value.map(v => v.userId).join(',') : value),
        transformResponse(value, object) {
          const valueArr = value ? value.split(',') : null;
          const valueMeaningArr = value ? (object.attributeVarchar14Meaning || '').split(',') : null;
          return valueArr ? valueArr.map((v, i) => ({
            userId: Number(v),
            userName: valueMeaningArr[i] || v,
          })) : null;
        },
      },
      {
        name: 'attributeVarchar14Meaning',
        bind: 'attributeVarchar14.userName',
        label: intl.get('scux.bidPlanDetail.model.twnf.coSignatoryPersonnel').d('会签人员'),
      },
      {
        name: 'sourceProjectRemark',
        label: intl.get('scux.bidPlanDetail.model.twnf.sourceProjectRemark').d('项目说明'),
      },
    ],
    transport: {
      read: ({ params, data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}`,
          method: 'GET',
          data: {
            ...(params || {}),
            ...(data || {}),
          },
        };
      },
    },
  };
};

// 招标计划 - 招标节点
const bidPlanNodeDS = (): DataSetProps => {
  return {
    primaryKey: 'nodeId',
    autoQuery: false,
    selection: false,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'nodeName',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.nodeName`).d('节点名称'),
      },
      {
        name: 'nodeOrder',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.nodeOrder`).d('节点顺序'),
        lookupCode: 'NODE_ORDER',
      },
      {
        name: 'userInCharge',
        label: intl.get(`scux.bidPlanDetail.model.twnf.processNode.userInCharge`).d('负责人'),
        type: FieldType.object,
        lovCode: 'HIAM.TENANT.ACCOUNT',
        required: true,
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value.map(v => v.userId).join(',') : value),
        transformResponse(value, object) {
          const valueArr = value ? value.split(',') : null;
          const valueMeaningArr = value ? (object.userInChargeMeaning || '').split(',') : null;
          return valueArr ? valueArr.map((v, i) => ({
            userId: Number(v),
            userName: valueMeaningArr[i] || v,
          })) : null;
        },
      },
      {
        name: 'planFinishDate',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.planFinishDate').d('计划完成时间'),
        type: FieldType.date,
        required: true,
      },
      {
        name: 'adjustFlag',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.adjustFlag').d('计划调整记录'),
      },
      {
        name: 'limitDays',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.limitDays').d('工作时限（天）'),
      },
      {
        name: 'finishedDate',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.finishedDate').d('实际完成时间'),
        type: FieldType.date,
      },
      {
        name: 'differDays',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.differDays').d('时间差异（天）'),
      },
      {
        name: 'remark',
        label: intl.get('scux.bidPlanDetail.model.twnf.processNode.remark').d('备注'),
      },
    ],
  };
};

// 招标计划 - 招标内容
const bidPlanContentDS = ({ sourceProjectId }): DataSetProps => {
  return {
    primaryKey: 'projectLineItemId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'attributeVarchar11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.FBCProcessNumber').d('FBC流程编号'),
      },
      {
        name: 'attributeVarchar12',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.theme').d('主题'),
      },
      {
        name: 'requestUserName',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.requestUserName').d('申请人姓名'),
      },
      {
        name: 'attributeVarchar13Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationCompany').d('申请公司'),
      },
      {
        name: 'attributeVarchar14Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationDepartment').d('申请部门'),
      },
      {
        name: 'attributeDatetime10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationTime').d('申请时间'),
        type: FieldType.date,
      },
      {
        name: 'attributeVarchar15',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseDemandType').d('采购需求类型'),
      },
      {
        name: 'prNum',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseApplyNum').d('采购申请单号'),
      },
      {
        name: 'prDisplayLineNum',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseApplyLineNum').d('采购申请行号'),
      },
      {
        name: 'attributeVarchar16',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectApprovalProcess').d('项目立项流程'),
      },
      {
        name: 'attributeVarchar17',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectName').d('项目名称'),
      },
      {
        name: 'attributeVarchar18Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.totalCharge').d('总负责人'),
      },
      {
        name: 'attributeDate10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.approachTime').d('进场时间'),
      },
      {
        name: 'attributeDate11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.useTime').d('投入使用时间'),
      },
      {
        name: 'attributeDecimal10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectTotal').d('项目概算总额（元）'),
      },
      {
        name: 'attributeVarchar19',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.currency').d('币种'),
      },
      {
        name: 'attributeVarchar20',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.itemNum').d('分项编号'),
      },
      {
        name: 'attributeDecimal11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.totalPrice').d('采购明细金额（元）'),
      },
      {
        name: 'attributeLongtext1',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.itemAttachment').d('概算清单附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
      },
    ],
    transport: {
      read: ({}) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
          method: 'GET',
        };
      },
    },
  };
};

export {
  baseInfoDS,
  bidPlanNodeDS,
  bidPlanContentDS,
};