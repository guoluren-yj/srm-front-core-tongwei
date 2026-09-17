/**
 * 通威二开 - 中标公告【供应商列表】接口
 * 对应后端接口：SCUX_TWNF_SSRC_BID_ACCEPTANCE_NOTICE_NEW
 * 约定：同一个 marmot 网关地址，action 放在 body 里（与 BidSupAttachmentEdit 一致）
 * @date: 2025-9-17
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const getMarmotApi = () =>
  `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/jZoeulGJdNM2nQic9Xk8vxFqA38wCRH4tIFfmr9QqBz7doiaWTzxRyk5kjm336gmhA`;

/**
 * 生成中标附件
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function generateBidNoticeAttachment(params) {
  return request(getMarmotApi(), {
    method: 'POST',
    body: {
      action: 'generatefile',
      ...params,
    },
  });
}

/**
 * 发起电签
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function esignBidNoticeAttachment(params) {
  return request(getMarmotApi(), {
    method: 'POST',
    body: {
      action: 'esign',
      ...params,
    },
  });
}

/**
 * 发送中标通知（站内信 + 邮件，邮件带签章附件）
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function sendBidNoticeMessage(params) {
  return request(getMarmotApi(), {
    method: 'POST',
    body: {
      action: 'sendMsg',
      ...params,
    },
  });
}

/**
 * 发布
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function publishBidAcceptanceNotice(params) {
  return request(getMarmotApi(), {
    method: 'POST',
    body: {
      action: 'publish',
      ...params,
    },
  });
}
