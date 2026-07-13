import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.materialPackInfoMaintenance'; // 多语言前缀

// 基础信息ds
const formDataSet = (id): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'complaintReqNum',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.complaintNumber`).d('单据编号'),
      },
      {
        name: 'complainRealName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.complaintUserName`).d('投诉人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get(`${intlPrompt}.form.createdTime`).d('创建时间'),
      },
      {
        name: 'companyLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.form.companyName`).d('公司'),
        required: true,
        lovCode: 'SMCT.USER_AUTH.COMPANY',
        ignore: FieldIgnore.always,
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'companyId',
        type: FieldType.string,
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: 'companyLov.companyName',
      },
      {
        name: 'ouLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.form.businessEntityName`).d('业务实体'),
        required: true,
        lovCode: 'SPFM.USER_AUTH.OU_CODE',
        ignore: FieldIgnore.always,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            companyId: record.get('companyId'),
          }),
        },
      },
      {
        name: 'ouId',
        type: FieldType.string,
        bind: 'ouLov.ouId',
      },
      {
        name: 'ouName',
        type: FieldType.string,
        bind: 'ouLov.ouName',
      },
      {
        name: 'complainMobile',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.contactPhone`).d('联系方式'),
        required: true,
      },
      {
        name: 'complaintSubType',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.complaintSubType1`).d('投诉对象'),
        required: true,
        lookupCode: 'TWNF_TSDX',
      },
      {
        name: 'employeeLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.form.employeeLov`).d('员工'),
        lovCode: 'SCUX.POSITION.USER.REL',
        ignore: FieldIgnore.always,
        dynamicProps: {
          required: ({ record }) => record.get('complaintSubType') === '1',
        },
      },
      {
        name: 'complaintUserId',
        type: FieldType.string,
        bind: 'employeeLov.userId',
      },
      {
        name: 'complaintUserName',
        type: FieldType.string,
        bind: 'employeeLov.userName',
      },
      {
        name: 'supplierLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.form.supplierLov`).d('供应商'),
        lovCode: 'SPC.EXTERNAL_SUPPLIER_NEW',
        ignore: FieldIgnore.always,
        dynamicProps: {
          required: ({ record }) => record.get('complaintSubType') === '2',
        },
      },
      {
        name: 'complaintSupplierCompanyId',
        type: FieldType.string,
        bind: 'supplierLov.supplierId',
      },
      {
        name: 'complaintSupplierCompanyName',
        type: FieldType.string,
        bind: 'supplierLov.supplierName',
      },
      {
        name: 'complainType',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.complaintQuestion`).d('投诉问题'),
        required: true,
        lookupCode: 'TWNF_TSWT',
      },
      {
        name: 'reqNum',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.purchaseRequisitionNumber`).d('关联采购申请'),
      },
      {
        name: 'status',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.status`).d('状态'),
        lookupCode: 'TWNF_TSZT',
      },
      {
        name: 'complainContent',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.form.complaintRemark`).d('投诉说明'),
        required: true,
      },
      {
        name: 'preOperateRealName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.pendingReplyUserName`).d('待回复人'),
      },
      {
        name: 'distributeTime',
        type: FieldType.dateTime,
        label: intl.get(`${intlPrompt}.table.allocationTime`).d('分配时间'),
      },
      {
        name: 'operatedRealName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.replyUserName`).d('回复人'),
      },
      {
        name: 'unitName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.replyUnitName`).d('回复部门'),
      },
      {
        name: 'operatedMobile',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.replyUserContact`).d('回复人联系方式'),
      },
      {
        name: 'operatedTime',
        type: FieldType.dateTime,
        label: intl.get(`${intlPrompt}.table.replyTime`).d('回复时间'),
      },
      {
        name: 'operatedContent',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.replyRemark`).d('回复说明'),
      },
      {
        name: 'complaintDemand',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.table.appeal`).d('诉求'),
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: '',
        label: intl.get(`${intlPrompt}.table.uploadAttachment`).d('上传附件'),
      },
    ],
    queryParameter: { complaintReqId: id, methodCode: 'detail' },
    transport: {
      read: () => {
        return {
          url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/2TSQwG8AA3OnXvD77gIUo39BCSYAMngfO3YDgibKIsDE`,
          method: 'GET',
        };
      },
    },
    events: {
      update: ({ value, record, name }) => {
        if (name === 'companyLov') {
          const { ouId, ouCode, ouName } = value || {};
          record.set(
            'ouLov',
            ouId
              ? {
                  ouId,
                  ouCode,
                  ouName,
                }
              : null
          );
        }
      },
    },
  };
};

export { formDataSet, intlPrompt };
