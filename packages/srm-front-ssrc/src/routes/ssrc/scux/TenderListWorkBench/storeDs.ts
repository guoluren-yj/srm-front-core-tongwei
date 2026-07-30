import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess } from '../utils/fun';

function getQueryFields({ queryType = '' } = {}): any[] {
  return [
    {
      name: 'sourceProjectNum',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectNum').d('招标计划单号'),
      display: true,
    },
    {
      name: 'sourceProjectName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectName').d('招标名称'),
      display: true,
    },
    {
      name: 'bidDirector',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingManager').d('招标经理'),
      display: true,
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
    },
    {
      name: 'creationDate_range',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.creationDateScope').d('创建日期'),
      display: true,
      multiple: ',',
      type: FieldType.date,
    },
    {
      name: 'catalogStatus',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
      lookupCode: ' SCUX_TWNF_LIST_STATUS',
    },
    queryType !== 'NEW' && {
      name: 'catelogNum',
      label: intl.get(`scux.tenderListWorkbench.model.twnf.tenderListNum`).d('招标清单编号'),
    },
    {
      name: 'templateName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
    },
    {
      name: 'companyId',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.companyName').d('公司'),
      type: FieldType.object,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
    },
    {
      name: 'createdBy',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
    },
  ];
};

const tableDataSet = ({ queryType }): DataSetProps => {
  return {
    primaryKey: 'bidCatalogId',
    autoQuery: true,
    selection: DataSetSelection.multiple,
    pageSize: 50,
    fields: [
      {
        name: 'catalogStatus',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
        type: FieldType.string,
        lookupCode: 'SCUX_TWNF_NOMINATION_STATUS',
      },
      {
        name: 'catelogNum',
        label: intl.get(`scux.tenderListWorkbench.model.twnf.tenderListNum`).d('招标清单编号'),
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
        name: 'templateName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
      },
      {
        name: 'companyName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.companyName').d('公司'),
      },
      {
        name: 'bidDirectorName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingManager').d('招标经理'),
      },
      {
        name: 'createdByName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.creationDate').d('创建日期'),
      },
    ],
    queryFields: getQueryFields({ queryType }),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LGWxblLsib0aVQo70yAlD1uM`,
          data: {
            ...(params || {}),
            ...timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'creationDateFrom',
              endName: 'creationDateTo',
            }]),
            queryType,
          },
        };
      },
    },
  };
};

export { tableDataSet };
