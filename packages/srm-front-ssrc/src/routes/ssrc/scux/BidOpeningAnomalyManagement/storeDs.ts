import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess, handleDealQueryData } from '../utils/fun';

const prefix = 'scux.clearTenderManagement';

function getQueryFields(): any[] {
  return [
    {
      name: 'abnormalStatus',
      label: intl.get(`${prefix}.model.twnf.abnormalStatus`).d('状态'),
      type: FieldType.string,
      lookupCode: 'SCUX.TWNF_BID_EXCEPT_STATUS',
      display: true,
    },
    {
      name: 'companyId',
      label: intl.get(`${prefix}.model.twnf.createdCompanyName`).d('创建公司'),
      type: FieldType.object,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      display: true,
    },
    {
      name: 'createdBy',
      label: intl.get(`${prefix}.model.twnf.createdByName`).d('创建人'),
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
      display: true,
    },
    {
      name: 'exceptionType',
      label: intl.get(`${prefix}.model.twnf.exceptionType`).d('异常类型'),
      lookupCode: 'SCUX.TWNF_BID_EXCEPT_TYPE',
      display: true,
    },
    {
      name: 'creationDate_range',
      label: intl.get(`${prefix}.model.twnf.createdDate`).d('创建时间'),
      display: true,
      multiple: ',',
      type: FieldType.date,
      defaultValue: [moment().subtract(12, 'months').startOf('day'), moment().endOf('day')],
    },
    {
      name: 'rfxNum',
      label: intl.get(`${prefix}.model.twnf.bidFileNo`).d('招标文件编号'),
      display: true,
    },
    {
      name: 'rfxTitle',
      label: intl.get(`${prefix}.model.twnf.rfxTitle`).d('项目名称'),
      display: true,
    },
    {
      name: 'createdUnitName',
      label: intl.get('scux.clearTenderManagement.model.twnf.createDepartment').d('创建部门'),
    },
    {
      name: 'exceptionContent',
      label: intl.get(`${prefix}.model.twnf.exceptionContent`).d('异常内容'),
    },
    {
      name: 'exceptionReason',
      label: intl.get(`${prefix}.model.twnf.exceptionReason`).d('异常原因'),
    },
    {
      name: 'handlingOpinion',
      label: intl.get(`${prefix}.model.twnf.handlingOpinion`).d('处理意见'),
    },
  ];
}

const tableDataSet = (): DataSetProps => {
  return {
    primaryKey: 'abnormalHeaderId',
    autoQuery: false,
    selection: false,
    pageSize: 50,
    fields: [
      {
        name: 'abnormalStatus',
        label: intl.get(`${prefix}.model.twnf.abnormalStatus`).d('状态'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_EXCEPT_STATUS',
      },
      {
        name: 'abnormalNum',
        label: intl.get(`${prefix}.model.twnf.abnormalNum`).d('异常处理单号'),
      },
      {
        name: 'rfxNum',
        label: intl.get(`${prefix}.model.twnf.bidFileNo`).d('招标文件编号'),
      },
      {
        name: 'rfxTitle',
        label: intl.get(`${prefix}.model.twnf.rfxTitle`).d('项目名称'),
      },
      {
        name: 'companyName',
        label: intl.get(`${prefix}.model.twnf.companyName`).d('公司'),
      },
      {
        name: 'exceptionType',
        label: intl.get(`${prefix}.model.twnf.exceptionType`).d('异常类型'),
        lookupCode: 'SCUX.TWNF_BID_EXCEPT_TYPE',
      },
      {
        name: 'createdByName',
        label: intl.get(`${prefix}.model.twnf.createdByName`).d('创建人'),
      },
      {
        name: 'approvalResult',
        label: intl.get(`${prefix}.model.twnf.approvalResult`).d('审批结果'),
      },
      {
        name: 'creationDate',
        label: intl.get(`${prefix}.model.twnf.creationDate`).d('创建时间'),
      },
    ],
    queryFields: getQueryFields(),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Whp5I6ibYR3RISvVWASBLy9D2HZicic21pvtv2vTdV37GM`,
          data: {
            ...params,
            ...handleDealQueryData(timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'createStartDate',
              endName: 'createEndDate',
            }])),
          },
        };
      },
    },
  };
};

export { tableDataSet };