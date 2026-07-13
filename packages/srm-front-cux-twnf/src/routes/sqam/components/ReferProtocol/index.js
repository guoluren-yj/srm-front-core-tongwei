import React, { useMemo, useState, useEffect } from 'react';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
// import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { isArray } from 'lodash';
import { toJS } from 'mobx';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';

import { intlPrompt, tableDS } from './initDs';
import { usePriceRender, queryCommonDoubleUomConfig, fetchCreateReferOrderApi } from './utils';
import { MutlTextFieldSearch } from '../MultipleSearch';

const tenantId = getCurrentOrganizationId();

const ReferProtocol = props => {
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

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        name: 'pcNum',
        width: 150,
      },
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'pcName',
        width: 150,
      },
      // {
      //   name: 'supplierCompanyNum',
      //   width: 150,
      // },
      {
        name: 'supplierCompanyName',
        width: 150,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'uomCodeAndName',
        width: 150,
      },
      // {
      //   name: 'neededDate',
      //   width: 150,
      // },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: usePriceRender(),
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      // {
      //   name: 'ladderInquiry',
      //   width: 150,
      // },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'purchaseOrgName',
        width: 150,
      },
      {
        name: 'agentName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'createdByName',
        width: 150,
      },
    ].filter((i) => i);
    // 区分新增行逻辑
    return defaultColumns;
  }, [doubleUnitEnabled]);

    const onQuery = ({ params }) => {
    const { tempKey = '' } = params;
    if (!tempKey.includes(':')) {
      const supplierId = [];
      const supplierCompanyId = [];
      tempKey.split(',').forEach((i) => {
        const [localId, platformId] = i.split('-');
        if (localId) supplierId.push(localId);
        if (platformId) supplierCompanyId.push(platformId);
      });
      Object.assign(params, {
        supplierId: String(supplierId),
        supplierCompanyId: String(supplierCompanyId),
      });
    }
    dataSet.queryDataSet.loadData([
      {
        ...params,
        multiPcNum: params.multiPcNum?.toString(),
      },
    ]);
    dataSet.query();
  };

  const searchBarTableProps = {
    cacheState: true,
    searchCode: 'SODR.WORKSPACE_PURCHASEAGREEMENT.SEARCH',
    dataSet,
    columns,
    pagination: { pageSizeOptions: ['10', '20', '50', '100', '200'] },
    style: { maxHeight: 'calc(100% - 22px)' },
    virtual: true,
    virtualCell: true,
    searchBarConfig: {
      onQuery,
      editorProps: {
        pendingFlag: {
          clearButton: false,
        },
      },
      fieldProps: {
        tempKey: {
          lovPara: { tenantId },
        },
        itemCode: {
          transformValue: (value, record) => {
            if (record) {
              const val = record.get('itemCode');
              return isArray(toJS(val)) ? String(val.map((i) => i.itemCode)) : val?.itemCode;
            }
          },
          lovPara: { tenantId },
        },
      },
      left: {
        render: (_, ds) => (
          <MutlTextFieldSearch
            name="multiPcNum"
            dataSet={ds}
            placeholder={intl
              .get('sodr.common.model.common.purchaseAgreement')
              .d('请输入采购协议编号查询')}
          />
        ),
      },
    },
  };

  return (
    <SearchBarTable
      {...searchBarTableProps}
    />
    // <FilterBarTable
    //   border={false}
    //   dataSet={dataSet}
    //   columns={columns}
    //   customizable
    //   customizedCode="referProtocolCustomized"
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
      'sodr.workspace',
      'sodr.common',
    ],
  })(ReferProtocol)
);
