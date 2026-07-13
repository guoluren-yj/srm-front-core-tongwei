import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess, handleDealQueryData } from '../utils/fun';

function getQueryFields({ supplierFlag }): any[] {
  return [
    {
      name: 'qbNums',
      label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderNum').d('清标单号'),
      display: true,
      multiple: true,
    },
    {
      name: 'rfxNum',
      label: intl.get('scux.clearTenderManagement.model.twnf.rfxNum').d('招标编号'),
      display: supplierFlag,
    },
    {
      name: 'rfxTitle',
      label: intl.get('scux.clearTenderManagement.model.twnf.rfxTitle').d('项目名称'),
      display: supplierFlag,
    },
    {
      name: 'creationDate_range',
      label: intl.get('scux.clearTenderManagement.model.twnf.creationDateScope').d('创建时间'),
      display: true,
      multiple: ',',
      type: FieldType.date,
      defaultValue: [moment().subtract(12, 'months').startOf('day'), moment().endOf('day')],
    },
    {
      name: 'createdBy',
      label: intl.get('scux.clearTenderManagement.model.twnf.createName').d('创建人'),
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
    },
    {
      name: 'qbStatus',
      label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderStatus').d('状态'),
      type: FieldType.string,
      lookupCode: 'SCUX.TWNF_BID_CHECK_STATUS',
    },
    {
      name: 'peSuppliers',
      label: intl.get('scux.clearTenderManagement.model.twnf.supplierCompanyName').d('供应商'),
      type: FieldType.object,
      lovCode: 'SSLM.SUPPLIER_CHOOSE',
    },
  ];
}

const tableDataSet = ({ supplierFlag }): DataSetProps => {
  return {
    primaryKey: 'qbHeaderId',
    autoQuery: false,
    selection: DataSetSelection.multiple,
    pageSize: 50,
    fields: [
      {
        name: 'qbStatus',
        label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderStatus').d('状态'),
        lookupCode: 'SCUX.TWNF_BID_CHECK_STATUS',
      },
      {
        name: 'qbNum',
        label: intl.get('scux.clearTenderManagement.model.twnf.clearTenderNum').d('清标单号'),
      },
      {
        name: 'qbTitle',
        label: intl.get('scux.clearTenderManagement.model.twnf.qbTitle').d('清标标题'),
      },
      {
        name: 'rfxNum',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxNum').d('招标编号'),
      },
      {
        name: 'rfxTitle',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxTitle').d('项目名称'),
      },
      {
        name: 'companyName',
        label: intl.get('scux.clearTenderManagement.model.twnf.companyName').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('scux.clearTenderManagement.model.twnf.supplierCompanyName').d('供应商'),
      },
      {
        name: 'createdByName',
        label: intl.get('scux.clearTenderManagement.model.twnf.createdByName').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('scux.clearTenderManagement.model.twnf.creationDate').d('创建时间'),
        type: FieldType.date,
      },
    ],
    queryFields: getQueryFields({ supplierFlag }),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/CdaLJAaaJSfOLPb55Fjmx8wAKFubFiacUNoVMcZ9dwKM`,
          data: {
            ...params,
            ...handleDealQueryData(timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'createStartDate',
              endName: 'createEndDate',
            }])),
            queryRole: supplierFlag ? 'SUPPLIER' : 'PURCHASE',
          },
        };
      },
    },
  };
};

function getReferenceDocQueryFields(): any[] {
  return [
    {
      name: 'rfxNum',
      label: intl.get('scux.clearTenderManagement.model.twnf.rfxNum').d('招标编号'),
      type: FieldType.string,
      display: true,
    },
    {
      name: 'rfxTitle',
      label: intl.get('scux.clearTenderManagement.model.twnf.rfxTitle').d('项目名称'),
      type: FieldType.string,
    },
    {
      name: 'checkedByName',
      label: intl.get('scux.clearTenderManagement.model.twnf.checkedByName').d('招标经理'),
      type: FieldType.string,
    },
    {
      name: 'totalPrice',
      label: intl.get('scux.clearTenderManagement.model.twnf.totalPrice').d('中标金额'),
      type: FieldType.string,
    },
    {
      name: 'attributeVarchar12',
      label: intl.get('scux.clearTenderManagement.model.twnf.bidType').d('招标类型'),
      type: FieldType.string,
      // lookupCode: 'SCUX.TWNF_BID_BUS_TYPE',
    },
  ];
}
// 引用单据创建ds
const referenceDocumentCreateDS = (): DataSetProps => {
  return {
    autoQuery: true,
    selection: DataSetSelection.single,
    primaryKey: 'rfxHeaderId',
    fields: [
      {
        name: 'rfxNum',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxNum').d('招标编号'),
        type: FieldType.string,
      },
      {
        name: 'rfxTitle',
        label: intl.get('scux.clearTenderManagement.model.twnf.rfxTitle').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'checkedByName',
        label: intl.get('scux.clearTenderManagement.model.twnf.checkedByName').d('招标经理'),
        type: FieldType.string,
      },
      {
        name: 'suggestAmount',
        label: intl.get('scux.clearTenderManagement.model.twnf.totalPrice').d('中标金额'),
        type: FieldType.string,
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('scux.clearTenderManagement.model.twnf.suggestSupplierCompanyName').d('中标供应商'),
        type: FieldType.string,
      },
      {
        name: 'attributeVarchar12Meaning',
        label: intl.get('scux.clearTenderManagement.model.twnf.bidType').d('招标类型'),
        type: FieldType.string,
      },
    ],
    queryFields: getReferenceDocQueryFields(),
    transport: {
      read: ({ params, data }) => ({
        url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/jCVvAIa8oGURPxHHp8A0Uia3F4aicbvrNThLDCniaT5icEE`,
        method: 'GET',
        data: {
          ...params,
          ...data,
        },
      }),
    },
  };
};

export { tableDataSet, referenceDocumentCreateDS };
