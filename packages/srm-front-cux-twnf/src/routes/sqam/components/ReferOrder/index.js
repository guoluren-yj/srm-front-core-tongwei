import React, { useMemo, useState, useEffect } from 'react';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
// import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import intl from 'hzero-front/lib/utils/intl';
import { isNaN } from 'lodash';
import { dateRender, numberRender } from 'utils/renderer';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import { getSearchBarCache } from '_components/SearchBarTable/util/cache';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_SSLM } from '_utils/config';
import { DataSet } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';

import notification from 'utils/notification';
import { intlPrompt, tableDS } from './initDs';
import {
  renderStatus,
  queryCommonDoubleUomConfig,
  countDecimals,
  fetchCreateReferOrderApi,
} from './utils';

const organizationId = getUserOrganizationId();
const tenantId = getCurrentOrganizationId();

const ReferOrder = props => {
  const { modal } = props;
  const dataSet = new DataSet(tableDS());
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);

  useEffect(() => {
    fetchDoubleUnitFlag(); // 获取业务规则配置的双单位数据
    updateModal();
  }, [dataSet]);

  const fetchDoubleUnitFlag = async () => {
    const res = await queryCommonDoubleUomConfig();
    setDoubleUnitEnabled(res);
    dataSet.setState({ doubleUnitEnabled: res });
  };

  const handleOk = async () => {
    const params = dataSet.selected.map(item => item.toData());
    const result = await fetchCreateReferOrderApi(params);
    if (getResponse(result)) {
      notification.success();
      const { dispatch } = window.dvaApp._store;
      dispatch(
        routerRedux.push({
          pathname: `/sqam/createClaim/detail/${result.formHeaderId}`,
        })
      );
    }
  };

  const updateModal = () => {
   if(modal) {
      modal.handleOk(handleOk);
    }
  };

  const columns = useMemo(
    () => [
      {
        label: intl.get(`hzero.common.status`).d('状态'),
        name: 'displayStatusMeaning',
        width: 120,
        renderer: ({ record }) =>
          renderStatus(record.get('displayStatusCode'), record.get('displayStatusCodeMeaning')),
      },
      {
        label: intl.get('ssta.purchaseSettle.common.poNums').d('采购订单编号-行号'),
        name: 'displayPoNum',
        width: 150,
        renderer: ({ value, record }) => `${value}-${record.get('displayLineNum')}`,
      },
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCode',
        width: 150,
        renderer: ({ record }) =>
          record.get('supplierCode') || record.get('supplierCompanyCode') || record.get('supplierCompanyNum') || '-',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierName',
        fixed: 'left',
        width: 150,
        renderer: ({ record }) =>
          record.get('supplierName') || record.get('supplierCompanyName') || '-',
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.quantity`).d('数量'),
        name: 'quantity',
        width: 120,
        align: 'right',
      },
      doubleUnitEnabled && {
        label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        name: 'secondaryQuantity',
        width: 120,
        align: 'right',
      },
      {
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        name: 'uomId',
        width: 60,
        renderer: ({ record }) => record.get('uomCode') ? `${record.get('uomCode') }/${ record.get('uomName')}` : '-',
      },
      doubleUnitEnabled && {
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        name: 'secondaryUomId',
        width: 120,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      {
        label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
        name: 'itemCode',
        width: 130,
      },
      {
        label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
        name: 'itemName',
        width: 150,
      },
      {
        label: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
        name: 'categoryId',
        width: 150,
        renderer: ({ record }) => record.get('categoryName'),
      },
      {
        label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
        name: 'enteredTaxIncludedPrice',
        align: 'right',
        width: 150,
        renderer: ({ value, record }) => {
          const count = countDecimals(value);
          return record.get('priceSensitiveFlag')
            ? '****'
            : !isNaN(value)
            ? numberRender(value, count <= 2 ? 2 : count)
            : '';
        },
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
        name: 'taxCode',
        width: 60,
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
        name: 'currencyCode',
        width: 60,
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
        name: 'needByDate',
        width: 150,
        renderer: ({ value }) => dateRender(value),
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
        name: 'promiseDeliveryDate',
        width: 150,
        renderer: ({ value }) => dateRender(value),
      },
      {
        label: intl.get(`entity.company.tag`).d('公司'),
        name: 'companyName',
        width: 150,
      },
      {
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        name: 'purchaseOrgId',
        width: 180,
        renderer: ({ record }) => record.get('organizationName'),
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
        name: 'purchaseAgentId',
        width: 120,
        renderer: ({ record }) => record.get('purchaseAgentName'),
      },
      {
        label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
        name: 'erpCreatedName',
        width: 120,
      },
      {
        label: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
        name: 'poSourcePlatform',
        renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
      },
    ],
    []
  );

  const onQuery = ({ filter: { unitCode }, params, dataSet: tabaleDataSet }, ds) => {
    // 获取 searchCode 对应的筛选器缓存
    const queryArr = [
      'needByDateStart',
      'needByDateEnd',
      'releasedDateStart',
      'releasedDateEnd',
      'erpCreationDateStart',
      'erpCreationDateEnd',
      'urgentDateStart',
      'urgentDateEnd',
      'promiseDeliveryDateStart',
      'promiseDeliveryDateEnd',
    ];
    const queryDsData = getSearchBarCache(unitCode)?.queryDsData || {};
    const { supplierId } = queryDsData.supplierCompanyId || {};
    const { supplierCompanyId } = params || {};
    const otherParams = supplierCompanyId ? tabaleDataSet.getState('params') : null;
    queryArr.forEach(item => {
      if (params[item]) {
        // eslint-disable-next-line no-param-reassign
        params[item] = moment(params[item]).format(DATETIME_MIN);
      }
    });
    const allParams = {
      ...params,
      multiSelectHeaderAndLineNums: params?.multiSelectHeaderAndLineNums?.toString(),
    };
    if (!ds?.queryDataSet) return;
    ds.queryDataSet.loadData([{ ...allParams, supplierId, supplierCompanyId, ...otherParams }]);
    ds.query();
  };

  // 应该是供应商特别的LOV造成的，需要做特别的处理
  const onFieldChange = ({ name, value, dataSet: ds }) => {
    if (name === 'tempKey') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      ds.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
    if (name === 'supplierCompanyId') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      ds.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
  };

  return (
    <SearchBarTable
      // cacheState
      searchCode="SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER.FILTER"
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 'calc(100% - 22px)' }}
      searchBarConfig={{
        onQuery: e => onQuery(e, dataSet),
        onFieldChange,
        editorProps: {},
        fieldProps: {
          itemCode: {
            lovPara: { tenantId },
          },
          tempKey: {
            lovPara: { tenantId },
          },
          itemCodes: {
            lovPara: { tenantId, organizationId },
          },
          executedByName: {
            lovPara: {
              tenantId,
            },
          },
          companyId: {
            lovPara: {
              tenantId,
            },
          },
          supplierSiteId: {
            lovQueryAxiosConfig: (code, config, { data: { supplierId } }) => {
              return {
                url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/${supplierId}`,
                method: 'GET',
              };
            },
            dynamicProps: {
              lovPara: ({ record }) => ({
                tenantId,
                supplierId: record.get('tempKey')?.supplierId,
              }),
              disabled: ({ record }) => !record.get('tempKey')?.supplierId,
            },
          },
        },
      }}
    />
    // <FilterBarTable
    //   border={false}
    //   dataSet={dataSet}
    //   columns={columns}
    //   customizable
    //   customizedCode="referOrderCustomized"
    //   style={{ maxHeight: 'calc(100vh - 226px)' }}
    // />
  );
};

export default React.memo(
  formatterCollections({
    code: [
      intlPrompt,
      'hzero.common',
      'spcm.workspace',
      'spcm.common',
      'ssta.purchaseSettle',
      'sodr.workspace',
      'spcm.contractMaintain',
      'entity.supplier',
      'sodr.sendOrder',
      'sodr.common',
      'sprm.common',
      'entity.business',
    ],
  })(ReferOrder)
);
