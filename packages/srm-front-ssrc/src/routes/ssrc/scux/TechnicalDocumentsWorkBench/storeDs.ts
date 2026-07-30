import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldProps } from 'choerodon-ui/dataset/data-set/Field';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess } from '../utils/fun';

function getQueryFields({ queryTab = '' } = {}) {
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
      name: 'manager',
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
      name: 'techFileStatus',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
      lookupCode: 'SCUX_TWNF_TECHNICAL_DOCUMENTATION',
    },
    queryTab !== 'NEW' && {
      name: 'techFileNum',
      label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.techFileNum').d('技术文件编号'),
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
      name: 'userInChargeMeaning',
      label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.userInChargeMeaning').d('技术负责人'),
    },
    {
      name: 'createdByName',
      label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
    },
  ].filter(field => field !== false) as FieldProps[];
}

const tableDataSet = ({ queryTab }): DataSetProps => {
  return {
    primaryKey: 'sourceProjectId',
    autoQuery: true,
    selection: DataSetSelection.multiple,
    pageSize: 50,
    fields: [
      {
        name: 'techFileStatus',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
        type: FieldType.string,
        lookupCode: 'SCUX_TWNF_TECHNICAL_DOCUMENTATION',
      },
      {
        name: 'techFileNum',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.techFileNum').d('技术文件编码'),
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
        name: 'manager',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingManager').d('招标经理'),
      },
      {
        name: 'userInChargeMeaning',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.userInChargeMeaning').d('技术负责人'),
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
    queryFields: getQueryFields({ queryTab }),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeGrW1pFNgGbII6Bd8gicRons`,
          data: {
            ...(params || {}),
            ...timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'creationDateFrom',
              endName: 'creationDateTo',
            }]),
            queryTab,
          },
        };
      },
    },
  };
};

export { tableDataSet };