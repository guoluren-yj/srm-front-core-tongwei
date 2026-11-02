/**
 * 中标确认详情 - 清标表格数据源
 * - 仅招标业务类型 attributeVarchar12 = 30（建筑类）且来源为项目时展示
 * - 数据来自 marmot 查询接口，按 rfxHeaderId 查询
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const model = 'scux.clearTenderManagement.model.twnf';

export const CLEAR_TENDER_DETAIL_URL = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/qlogVH3k0dlbYibAFAgptI7qbnlzgazaL5HYWyv9ScGg`;

const clearTenderDetailDS = ({ rfxHeaderId }) => ({
  autoQuery: false,
  paging: false,
  selection: false,
  fields: [
    {
      name: 'qbNum',
      label: intl.get(`${model}.clearTenderMangeNum`).d('清标单号'),
    },
    {
      name: 'qbStatus',
      label: intl.get(`${model}.clearTenderMangeStatus`).d('清标状态'),
      // 与清标详情页一致，通过值集翻译状态
      lookupCode: 'SCUX.TWNF_BID_CHECK_STATUS',
    },
    {
      name: 'processDate',
      label: intl.get(`${model}.processDate`).d('完成时间'),
      type: 'date',
    },
    {
      name: 'qbDetail',
      label: intl.get(`${model}.headerRemark`).d('清标说明'),
    },
    {
      name: 'qbAmount',
      label: intl.get(`${model}.lineInfo.clearTenderAmount`).d('清标金额'),
      type: 'number',
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
    },
    {
      name: 'purAttachmentUuid',
      label: intl.get(`${model}.purClearTenderAttachment`).d('清标附件'),
    },
    {
      name: 'lineRemark',
      label: intl.get(`${model}.lineInfo.lineRemark`).d('备注'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${model}.supplierCompanyName`).d('供应商'),
    },
    {
      name: 'supplierFeedback',
      label: intl.get(`${model}.supFeedbackReply`).d('供应商回复'),
    },
    {
      name: 'supplierFeedbackDate',
      label: intl.get(`${model}.supFeedbackDate`).d('反馈日期'),
      type: 'date',
    },
  ],
  transport: {
    read: () => ({
      url: CLEAR_TENDER_DETAIL_URL,
      method: 'GET',
      // c7n DataSet 会把 GET 的 data 合并到 query 参数中
      data: { rfxHeaderId },
    }),
  },
});

export default clearTenderDetailDS;
