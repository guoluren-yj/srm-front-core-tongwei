/**
 * 通威二开 - 中标公告【供应商列表】的 DataSet 定义
 * 数据由中标公告详情接口一次性下发（winBidNoticeInfo.supplierList），故不配置 transport，直接 loadData
 * @date: 2025-9-17
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const modelName = 'ssrc.scux.bidAcceptanceNotice.';

// 中标附件的桶目录（后端生成与前端手工上传共用，如需调整只改这里）
export const BID_NOTICE_BUCKET_DIRECTORY = 'ssrc-tendernotice-detail';

// 中标附件手工上传的类型限制：仅允许 doc 类型
export const BID_NOTICE_ATTACHMENT_ACCEPT = ['.doc', '.docx'];

const bidSupplierListDS = () => ({
  autoQuery: false,
  paging: false,
  // 支持多选，勾选的行由头部【发布】使用
  selection: 'multiple',
  primaryKey: 'suggestNoticeId',
  dataToJSON: 'all',
  fields: [
    {
      name: 'supplierCompanyId',
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`${modelName}supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${modelName}supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'suggestFlag',
      label: intl.get(`${modelName}suggestFlag`).d('是否中标'),
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      name: 'totalSuggestAmount',
      label: intl.get(`${modelName}totalSuggestAmount`).d('中标金额（元）'),
      type: 'number',
      precision: 2,
      numberGrouping: true,
    },
    {
      // 中标附件
      name: 'uuid',
      label: intl.get(`${modelName}uuid`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BID_NOTICE_BUCKET_DIRECTORY,
      ...(ChunkUploadProps || {}),
    },
    {
      // 中标附件在线编辑用
      name: 'attachmentLineId',
    },
    {
      // 1 表示该行允许在线编辑
      name: 'editFlag',
      label: intl.get(`${modelName}editFlagNew`).d('在线编辑'),
    },
    {
      name: 'esignStatus',
      label: intl.get(`${modelName}esignStatus`).d('电签状态'),
      lookupCode: 'SCUX.TWNF_EC_STATUS',
    },
    {
      // 签章附件：由电签回调写入，也允许前端手工上传/删除
      name: 'signUuid',
      label: intl.get(`${modelName}signUuid`).d('签章附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BID_NOTICE_BUCKET_DIRECTORY,
      ...(ChunkUploadProps || {}),
    },
    {
      name: 'noticeFlag',
      label: intl.get(`${modelName}noticeFlag`).d('通知是否已发送'),
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      name: 'objectVersionNumber',
    },
  ],
});

export { bidSupplierListDS };
