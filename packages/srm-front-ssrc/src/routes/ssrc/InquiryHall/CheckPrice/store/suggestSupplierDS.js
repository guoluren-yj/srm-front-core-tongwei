/**
 * 招标核价 - 清单内容（供应商清单）数据源
 * 数据来自 marmot 查询接口，按 rfxHeaderId 查询
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const SUGGEST_SUPPLIER_LIST_URL = `/marmot/v1/${organizationId}/marmot-api/jnGiaAPr0vns7KB9wic7ODC8E5pQHXoyqIkmzWnibncFm4`;

/**
 * suggestedFlag 为 boolean 字段（trueValue: '1' / falseValue: '0'）,
 * record.get 返回的是原始存储值，不能直接用真值判断
 */
export const isSuggested = (record) => {
  const value = record?.get('suggestedFlag');
  return value === true || value === 1 || value === '1' || value === 'true';
};

const suggestSupplierListDS = ({ rfxHeaderId }) => ({
  autoQuery: false,
  paging: false,
  selection: false,
  primaryKey: 'id',
  fields: [
    {
      name: 'index',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.serialNumber`).d('序号'),
    },
    {
      // 中标标识（勾选框），保存/提交时映射为 suggestedFlag
      name: 'suggestedFlag',
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
    },
    {
      // 分配数量（数字输入框），列名按业务要求展示为「分配申请」
      name: 'allottedQuantity',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allocateRequest`).d('分配申请'),
    },
    {
      name: 'attributeLongtext8',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
    },
    {
      name: 'supplierCompanyId',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyId`).d('供应商ID'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商名称'),
    },
    {
      // 虚列，仅用于承接「投标详情」跳转
      name: 'bidDetail',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bidDetail`).d('投标详情'),
    },
    {
      name: 'quotationHeaderId',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationHeaderId`).d('报价单ID'),
    },
    {
      name: 'awardAmount',
      type: 'number',
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.awardAmount`).d('中标金额'),
    },
    {
      name: 'quotationAmount',
      type: 'number',
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationAmount`).d('投标价'),
    },
    {
      name: 'finalAmount',
      type: 'number',
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.finalAmount`).d('最终价'),
    },
    {
      name: 'attributeLongtext22',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remark`).d('备注'),
    },
    {
      name: 'suggestedRemark',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
      dynamicProps: {
        // 勾选「选用」后，选用理由必填
        required: ({ record }) => isSuggested(record),
      },
    },
  ],
  transport: {
    read: () => ({
      url: SUGGEST_SUPPLIER_LIST_URL,
      method: 'GET',
      params: {
        rfxHeaderId,
      },
    }),
  },
});

export default suggestSupplierListDS;
