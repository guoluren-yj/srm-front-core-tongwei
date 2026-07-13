import { getCurrentOrganizationId, getResponse, getCurrentLanguage } from 'utils/utils';
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { isNil, isNumber } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { NumberField } from 'choerodon-ui/pro';

export function useAmountRender(header, options = {}) {
  return ({ record, value }) => {
    const { bySourceCode = true } = options;
    if (record.get('priceShieldFlag') === 1) return '******';
    const { poSourcePlatform, sourceBillTypeCode, sourceCode } = (header || record).get([
      'poSourcePlatform',
      'sourceBillTypeCode',
      'sourceCode',
    ]);
    if (
      (['CATALOGUE', 'E-COMMERCE'].includes(poSourcePlatform) &&
        sourceBillTypeCode === 'PURCHASE_REQUEST') ||
      (bySourceCode && sourceCode && sourceCode !== 'SRM')
    ) {
      return formatAumont(value);
    }
    const precision = record.get('financialPrecision');
    const text = !isNil(precision) ? formatAumont(value, precision, true) : formatAumont(value);
    return text ? String(text) : null;
  };
}

export function usePriceRender(header, options = {}) {
  return ({ record, value }) => {
    const { bySourceCode = true } = options;
    const sourceCode = (header || record)?.get('sourceCode');
    const usePrecision = bySourceCode && sourceCode ? sourceCode === 'SRM' : true;
    if (record.get('priceShieldFlag') === 1) return '******';
    const precision = record.get('defaultPrecision');
    const text =
      !isNil(precision) && usePrecision ? formatAumont(value, precision) : formatAumont(value);
    return text ? String(text) : null;
  };
}

export function formatAumont(aumont, precision, isSupplement, useGrouping = true) {
  let newPrecision = Number(precision);
  if (isNil(newPrecision) || isNaN(newPrecision) || newPrecision > 20) newPrecision = 20;
  const language = getCurrentLanguage().split('_').join('-');
  const options = Object.assign(
    { useGrouping },
    { maximumFractionDigits: newPrecision },
    isSupplement ? { minimumFractionDigits: newPrecision } : {}
  );
  if (isNumber(aumont)) {
    return aumont.toLocaleString(language, options);
  }
  if (math.isBigNumber(aumont)) {
    return NumberField.format(aumont, language, options);
  }
  return aumont;
}

// 公用获取双单位配置
export const queryCommonDoubleUomConfig = async (params) => {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
};

export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

export function getDynamicLabel(config = 0, field = 'quantity') {
  const basicUomLabel = intl.get(`sodr.common.view.message.basicUomName`).d('基本单位');
  const basicQuanLabel = intl.get(`sodr.common.view.message.basicQuantity`).d('基本数量');
  const originUomLabel = intl.get(`sodr.common.model.common.uomCodeAndName`).d('单位');
  const originQuanLabel = intl.get(`sodr.common.model.common.newQuantity`).d('数量');
  if (field === 'quantity') {
    return !config ? originQuanLabel : basicQuanLabel;
  } else {
    return !config ? originUomLabel : basicUomLabel;
  }
}

export function getPrecision(precision) {
  const _default = 10;
  const _precision = !isNil(precision) ? Number(precision) : _default;
  return _precision;
}

export const fetchCreateReferOrderApi = (params) => {
  return request(`/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia9s92uQWUmgI9QicEic0QRTqs`, {
    method: 'POST',
    body: params,
  });
};