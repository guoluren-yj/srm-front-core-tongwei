import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { SRM_SSRC } from "srm-front-boot/lib/utils/config";
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess } from '../utils/fun';

function getQueryFields(): any[] {
  return [
    {
      name: 'attributeVarchar15',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingManager').d('招标经理'),
      display: true,
    },
    {
      name: 'creationDate_range',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.creationDateScope').d('创建日期'),
      display: true,
      multiple: ',',
      type: FieldType.date,
    },
    {
      name: 'attributeVarchar13',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
      lookupCode: 'SCUX_TWNF_TENDER_PLAN_STATUS',
      display: true,
    },
    {
      name: 'sourceProjectName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectName').d('招标名称'),
    },
    {
      name: 'attributeVarchar18',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
    },
    {
      name: 'companyName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.companyName').d('公司'),
    },
    {
      name: 'createdByName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
    },
  ];
}

export const tableDataSet = ({ tab }): DataSetProps => {
  return {
    primaryKey: 'sourceProjectId',
    autoQuery: false,
    selection: DataSetSelection.multiple,
    pageSize: 50,
    fields: [
      {
        name: 'attributeVarchar13',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
        lookupCode: 'SCUX_TWNF_TENDER_PLAN_STATUS',
      },
      {
        name: 'sourceProjectNum',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectNum').d('招标计划单号'),
      },
      {
        name: 'sourceProjectName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectName').d('招标名称'),
      },
      {
        name: 'attributeVarchar18',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
      },
      {
        name: 'companyName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.companyName').d('公司'),
      },
      {
        name: 'attributeVarchar15Meaning',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingManager').d('招标经理'),
      },
      {
        name: 'createdByName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.creationDate').d('创建时间'),
      },
    ],
    queryFields: getQueryFields(),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: tab === 'toBeReleased' ? `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/un-release` : `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/all`,
          data: {
            ...params,
            ...timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'creationDateFrom',
              endName: 'creationDateTo',
            }]),
            customSql: 'cuxBidPlan',
          },
        };
      },
    },
  };
};

export const sourcingTemplateDS = (record) => ({
  autoCreate: true,
  fields: [
    {
      name: 'templateId',
      label: intl.get(`scux.bidPlanWorkBench.model.projectSetup.sourcingTemplate`).d('寻源模板'),
      required: true,
      type: FieldType.object,
      lovCode: 'SSRC.TEMPLATE_NAME',
      lovPara: {
        secondarySourceCategory: 'NEW_BID',
        sourceProjectId: record.get('sourceProjectId'),
      },
    },
  ],
});