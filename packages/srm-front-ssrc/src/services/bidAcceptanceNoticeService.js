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
 * 解析响应体：接口可能没有返回体（如电签），
 * 此时按 JSON 解析会抛出语法错误，故解析失败时原样返回文本
 */
const parseResponse = (res) => {
  if (typeof res !== 'string' || !res) {
    return res;
  }
  try {
    return JSON.parse(res);
  } catch (error) {
    return res;
  }
};

/**
 * 统一请求：按文本接收，避免空响应体触发 JSON 解析报错
 * @param {String} action 业务动作
 * @param {Object} params 业务参数
 */
const marmotRequest = async (action, params) => {
  const res = await request(getMarmotApi(), {
    method: 'POST',
    responseType: 'text',
    body: {
      action,
      ...params,
    },
  });
  return parseResponse(res);
};

/**
 * 生成中标附件
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function generateBidNoticeAttachment(params) {
  return marmotRequest('generatefile', params);
}

/**
 * 发起电签
 * 注意：该接口成功时没有返回体，返回空字符串属于正常
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function esignBidNoticeAttachment(params) {
  return marmotRequest('esign', params);
}

/**
 * 发送中标通知（站内信 + 邮件，邮件带签章附件）
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function sendBidNoticeMessage(params) {
  return marmotRequest('sendMsg', params);
}

/**
 * 发布
 * @param {Object} params { rfxHeaderId, supplierCompanyId }
 */
export async function publishBidAcceptanceNotice(params) {
  return marmotRequest('publish', params);
}
