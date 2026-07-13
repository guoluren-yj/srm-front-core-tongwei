import React from 'react';
import { Expose } from 'utils/remote';
import { getResponse, getUserOrganizationId, filterNullValueObject } from 'utils/utils';
import { Lov, DataSet, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { confirmItemAndShelfApi, batchEditECInfo } from '@/services/smpc/skuWorkbenchServices';
import openLabels from 'srm-front-smpc/lib/routes/product/SkuWorkbench/drawers/label';
import intl from 'utils/intl';
import QueryField from '../components/QueryField';
import qs from 'querystring';

const organizationId = getUserOrganizationId();

const isWorkflowApprove = (record) => {
  const { purSkuStatus, approveStatus, approveType } = record.get([
    'purSkuStatus',
    'approveStatus',
    'approveType',
  ]);
  return (
    approveStatus === 'REVERTED' ||
    (approveType === 'UPDATE' && (purSkuStatus === 12 || approveStatus === 'WORKFLOW_WAITING'))
  );
};

const skuEditParams = { // 商品编辑前置条件
  // 请求方式｜请求参数
  req: ({ record, tabStatus }) => {
    const { approveStatus, receiveFlag } = record.get(['approveStatus', 'receiveFlag']);
    // 更新商品工作流审批
    if (isWorkflowApprove(record)) return 'workflowApprove';
    // 领用
    if (receiveFlag === 1) return 'receive';
    // 审批拒绝
    if (tabStatus === '6' && approveStatus === 'REJECT') return 'reject';
    // 默认查new
    return 'new';
  },
  // 已上架商品查看旧版本
  lastVersion: ({ record }) => (record.get('purSkuStatus') === 1 ? 'y' : null),
};

const getUrlParams = (record, tabStatus, defaultParams = {}, dynamicParams = {}) => {
  const urlParams = {
    ...defaultParams,
  };
  Object.keys(dynamicParams).forEach((key) => {
    if (typeof dynamicParams[key] === 'function') {
      urlParams[key] = dynamicParams[key]({ record, tabStatus });
    } else {
      urlParams[key] = dynamicParams[key];
    }
  });
  return filterNullValueObject(urlParams);
};

const relatedItemRenderer = ({ record, dataSet }) => {
  const lovDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'item',
        type: 'object',
        lovCode: 'SMAL.CUSTOMER_ITEM',
        lovPara: {
          tenantId: organizationId,
        },
      },
    ],
  });
  return (
    <Lov
      name="item"
      mode="button"
      funcType="link"
      color="primary"
      clearButton={false}
      dataSet={lovDs}
      modalProps={{
        okText: '确定并上架',
      }}
      onChange={async (value) => {
        if (value) {
          const result = await confirmItemAndShelfApi({
            ...(record.toData() || {}),
            mappingItemId: value.itemId,
          });
          if (getResponse(result)) {
            notification.success();
            dataSet.clearCachedSelected();
            dataSet.unSelectAll();
            dataSet.query();
          }
        }
        lovDs.current.reset();
      }}
    >
      关联物料
    </Lov>
  );
};

const ecSkuEditRenderer = ({ record, dataSet }) => {
  const { supplierCompanyId, supplierCompanyName, supplierTenantId } = record.get([
    'skuId',
    'supplierCompanyId',
    'supplierCompanyName',
    'supplierTenantId',
  ]);
  const multipleSuppliers = {
    supplierCompanyId,
    supplierCompanyName,
    supplierTenantId,
  };
  return (
    <Button
      color="primary"
      funcType="link"
      onClick={() => {
        openLabels({
          isSup: true,
          multipleSuppliers,
          onSave: async (formData) => {
            const skuData = [{ ...record.toData(), ...formData[0] }];
            const res = await batchEditECInfo(skuData);
            if (getResponse(res)) {
              notification.success();
              dataSet.query();
            } else {
              return false;
            }
          },
        });
      }}
    >
      编辑商品信息
    </Button>
  );
};

const maintainSaleRegionRenderer =
  (status, push) =>
  ({ record }) => {
    return (
      <Button
        color="primary"
        funcType="link"
        disabled={
          (status === '4' && record.get('purSkuStatus') === 8) ||
          (status === '6' && record.get('approveType') === 'INVALID')
        }
        onClick={() => {
          const { spuId, skuTemporaryId, skuId } = record.toData();
          const prefixPath = window.location.pathname.split('/list')[0];
          const urlParams = getUrlParams(
            record,
            status,
            {
              spuId,
              skuTemporaryId,
              skuId,
              showQuickEditFlag: 1,  
            },
            skuEditParams
          );

          push({
            pathname: `${prefixPath.includes('/app') ? prefixPath.replace('/app', '')  : prefixPath}/create`,
            search: qs.stringify(urlParams),
          });
        }}
      >
        维护销售区域
      </Button>
    );
  };

export default new Expose({
  process: {
    SMPC_SKU_WORKBENCH_PROCESS_TABLE_COLUMNS: (columns, otherProps) => {
      const { status, skuType, push } = otherProps || {};

      const cuxColumns = [
        {
          show: skuType === 'EC' && ['4', '3', '1'].includes(status),
          name: 'attributeLongtext8',
          header: '关联物料',
          width: 100,
          renderer: relatedItemRenderer,
        },
        {
          show: skuType === 'EC' && ['4', '3', '1'].includes(status),
          name: 'ecSkuEdit',
          header: '编辑商品信息',
          width: 120,
          renderer: ecSkuEditRenderer,
        },
        {
          show: skuType === 'CATA' && ['6', '4', '3', '2', '1'].includes(status),
          name: 'attributeLongtext9',
          header: '维护销售区域',
          width: 120,
          renderer: maintainSaleRegionRenderer(status, push),
        },
      ];
      return [...columns, ...cuxColumns];
    },
    SMPC_SKU_WORKBENCH_PROCESS_SEARCHBAR_LEFT: (_, otherProps) => {
      const { ds, remoteThis } = otherProps || {};
      return {
        render: () => (
          <QueryField
            name="skuName"
            dataSet={ds.table}
            onRef={(ref) => {
              remoteThis.queryRef = ref;
            }}
            placeholder={intl.get('smpc.product.twnf.queryMsg.skuName').d('请输入商品名称查询')}
          />
        ),
      };
    },
  },
});
