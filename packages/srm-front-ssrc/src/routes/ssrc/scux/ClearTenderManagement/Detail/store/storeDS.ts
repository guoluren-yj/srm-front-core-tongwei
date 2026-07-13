import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';


// 清标管理 - 头信息ds
const baseInfoDS = ({ qbHeaderId, supplierFlag }): DataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'qbNum',
        label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderMangeNum').d('清标单号'),
        disabled: true,
      },
      {
        name: 'qbTitle',
        label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderMangeTitle').d('清标标题'),
        type: FieldType.intl,
        dynamicProps: {
          required: ({ dataSet }) => !supplierFlag && dataSet.getState('editorFlag'),
          disabled: () => supplierFlag,
        },
      },
      {
        name: 'qbStatus',
        label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderMangeStatus').d('清标状态'),
        lookupCode: 'SCUX.TWNF_BID_CHECK_STATUS',
        disabled: true,
      },
      {
        name: 'rfxNum',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxNum').d('招标编号'),
        disabled: true,
      },
      {
        name: 'rfxTitle',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxTitle').d('项目名称'),
        disabled: true,
      },
      {
        name: 'companyName',
        label: intl.get('scux.clearTenderManagement.model.twnf.companyName').d('公司'),
        disabled: true,
      },
      {
        name: 'ouId',
        label: intl.get('scux.clearTenderManagement.model.twnf.ouName').d('业务实体'),
        type: FieldType.object,
        lovCode: 'SPFM.USER_AUTH.OU',
        transformRequest: (value) => value ? value.ouId : null,
        transformResponse: (value, data) => {
          return value ? {
            ouId: value,
            ouName: data.ouName,
          } : null;
        },
        disabled: supplierFlag,
      },
      {
        name: 'purOrganizationName',
        label: intl.get('scux.clearTenderManagement.model.twnf.organizationName').d('采购组织'),
        disabled: true,
      },
      {
        name: 'checkedByName',
        label: intl.get('scux.clearTenderManagement.model.twnf.checkedByName').d('招标经理'),
        disabled: true,
      },
      {
        name: 'createdByName',
        label: intl.get('scux.clearTenderManagement.model.twnf.createdByName').d('创建人'),
        disabled: true,
      },
      {
        name: 'createdUnitId',
        label: intl.get('scux.clearTenderManagement.model.twnf.createDepartment').d('创建部门'),
        type: FieldType.object,
        lovCode: 'SPRM.USER_UNIT',
        transformRequest: (value) => value ? value.unitId : null,
        transformResponse: (value, data) => {
          return value ? {
            unitId: value,
            unitName: data.createdUnitName,
          } : null;
        },
        dynamicProps: {
          required: ({ dataSet }) => !supplierFlag && dataSet.getState('editorFlag'),
          disabled: () => supplierFlag,
        },
      },
      {
        name: 'createdUnitName',
        bind: 'createdUnitId.unitName',
      },
      {
        name: 'creationDate',
        label: intl.get('scux.clearTenderManagement.model.twnf.createTime').d('创建时间'),
        type: FieldType.date,
        disabled: true,
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('scux.clearTenderManagement.model.twnf.supplierCompanyName').d('供应商'),
        disabled: true,
      },
      {
        name: 'qbDetail',
        label: intl.get('scux.clearTenderManagement.model.twnf.headerRemark').d('清标说明'),
        dynamicProps: {
          required: ({ dataSet }) => !supplierFlag && dataSet.getState('editorFlag'),
          disabled: () => supplierFlag,
        },
      },
      {
        name: 'purAttachmentUuid',
        label: intl.get('scux.clearTenderManagement.model.twnf.purClearTenderAttachment').d('采购方清标附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        dynamicProps: {
          required: ({ dataSet }) => !supplierFlag && dataSet.getState('editorFlag'),
          readOnly: () => supplierFlag,
        },
      },
      {
        name: 'supAttachmentUuid',
        label: intl.get('scux.clearTenderManagement.model.twnf.supConfirmAttachment').d('供应商方附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      // {
      //   name: 'supConfirmAttachmentUuid',
      //   label: intl.get('scux.clearTenderManagement.model.twnf.supConfirmAttachment').d('供应商确认附件'),
      //   type: FieldType.attachment,
      //   bucketName: PRIVATE_BUCKET,
      //   bucketDirectory: 'ssrc-rfx-rfxheader',
      // },
      {
        name: 'supplierFeedback',
        label: supplierFlag ? intl.get('scux.clearTenderManagement.model.twnf.supConfirmMessage').d('清标确认') : intl.get('scux.clearTenderManagement.model.twnf.supFeedback').d('供应商反馈意见'),
      },
      {
        name: 'supplierFeedbackDate',
        label: intl.get('scux.clearTenderManagement.model.twnf.supFeedbackDate').d('供应商反馈日期'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq5l4Kj5vbnNLLATEufJ01Xw`,
          method: 'GET',
          data: {
            qbHeaderId,
            queryType: 'HEADER',
            queryRole: supplierFlag ? 'SUPPLIER' : 'PURCHASE',
          },
        };
      },
    },
  };
};

// 清标管理 - 行信息ds
const lineInfoDS = ({ supplierFlag, qbHeaderId }): DataSetProps => {
  return {
    primaryKey: 'qbLineId',
    autoQuery: false,
    selection: false,
    paging: true,
    forceValidate: true,
    fields: [
      {
        name: 'qbLineNum',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.lineReq`).d('序号'),
      },
      {
        name: 'rfxLineItemName',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.itemName`).d('标的名称'),
      },
      {
        name: 'sectionName',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.sectionName`).d('标段名称'),
      },
      {
        name: 'suggestedAmount',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.bidAmount`).d('中标金额'),
        type: FieldType.number,
      },
      {
        name: 'qbAmount',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.clearTenderAmount`).d('清标金额'),
        type: FieldType.number,
        required: !supplierFlag,
        min: 0,
        disabled: supplierFlag,
      },
      {
        name: 'deviation',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.deviationPercent`).d('偏离%'),
        type: FieldType.number,
        required: !supplierFlag,
        min: 0,
        disabled: supplierFlag,
      },
      {
        name: 'lineRemark',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.lineRemark`).d('备注'),
        disabled: supplierFlag,
      },
      {
        name: 'lineAttachmentUuid',
        label: intl.get(`scux.clearTenderManagement.model.twnf.lineInfo.lineAttachmentUuid`).d('附件上传'),
        required: !supplierFlag,
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        readOnly: supplierFlag,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq5l4Kj5vbnNLLATEufJ01Xw`,
          method: 'GET',
          data: {
            qbHeaderId,
            queryType: 'LINE',
            queryRole: supplierFlag ? 'SUPPLIER' : 'PURCHASE',
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
