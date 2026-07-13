import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.complaintWorkbench'; // 多语言前缀

const queryField = (): FieldProps[] => {
  return [
    {
      name: 'complaintReqNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.complaintNumber`).d('单据编号'),
      display: true,
    },
    {
      name: 'complainRealName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.complaintUserName`).d('投诉人'),
      display: true,
    },
    {
      name: 'preOperateRealName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.pendingReplyUserName`).d('待回复人'),
      display: true,
    },
    {
      name: 'operatedRealName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.replyUserName`).d('回复人'),
      display: true,
    },
    {
      name: 'status',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.status`).d('状态'),
      lookupCode: 'TWNF_TSZT',
      display: true,
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.companyName`).d('公司'),
      display: true,
    },
    {
      name: 'ouName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.businessEntityName`).d('业务实体'),
      display: true,
    },
    {
      name: 'complainContent',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.complaintRemark`).d('投诉说明'),
      display: true,
    },
    {
      name: 'creationDateRange',
      type: FieldType.dateTime,
      label: intl.get(`${intlPrompt}.search.creationDate`).d('创建日期'),
      display: true,
      range: true,
    },
  ].filter(Boolean);
};

const columnField = (): FieldProps[] => {
  return [
    {
      name: 'statusMeaning',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.status`).d('状态'),
    },
    {
      name: 'complaintReqNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.complaintNumber`).d('单据编号'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.businessEntityName`).d('业务实体'),
    },
    {
      name: 'complainRealName',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.complaintUserName`).d('投诉人'),
    },
    {
      name: 'complainMobile',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.complaintUserContact`).d('联系方式'),
    },
    {
      name: 'complainTypeMeaning',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.complaintQuestion`).d('投诉问题'),
    },
    {
      name: 'reqNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.purchaseRequisitionNumber`).d('关联采购申请'),
    },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      label: intl.get(`${intlPrompt}.table.creationDate`).d('创建日期'),
    },
    {
      name: 'complainContent',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.complaintRemark`).d('投诉说明'),
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
      name: 'operationRecord',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.operationRecord`).d('操作记录'),
    },
  ];
};

// 列表ds
const tableDataSet = (): DataSetProps => {
  return {
    primaryKey: 'complaintReqId',
    autoQuery: true,
    pageSize: 20,
    queryFields: queryField(),
    fields: columnField(),
    queryParameter: { methodCode: 'page' },
    transport: {
      read: () => {
        return {
          url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/2TSQwG8AA3OnXvD77gIUo39BCSYAMngfO3YDgibKIsDE`,
          method: 'GET',
        };
      },
    },
  };
};

const allocationDataSet = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'replyUser',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.label.replyUser`).d('待回复人'),
        lovCode: 'HIAM.TENANT.USER',
        required: true,
      },
      {
        name: 'preOperateBy',
        bind: 'replyUser.id',
      },
    ],
  };
};

const replyDataSet = (): DataSetProps => {
  return {
    autoQuery: true,
    forceValidate: true,
    fields: [
      {
        name: 'replyRemark',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.label.replyRemark`).d('回复说明'),
        required: true,
      },
      {
        name: 'replyUnitLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.label.replyUnit`).d('回复部门'),
        lovCode: 'SPFM.USER_EMPLOYEE_UNIT_D',
      },
      {
        name: 'unitName',
        bind: 'replyUnitLov.unitName',
      },
      {
        name: 'unitId',
        bind: 'replyUnitLov.unitId',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/zVXNV9QyW5yBoNom2sOzgau3fLeib0zaVU2N18JFjzx0`,
          method: 'GET',
        };
      },
    },
  };
};

export { tableDataSet, intlPrompt, allocationDataSet, replyDataSet };
