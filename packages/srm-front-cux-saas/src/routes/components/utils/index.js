import React from 'react';
import { getCurrentLanguage } from 'utils/utils';
import { isNumber } from 'lodash';

import styles from '../index.less';

/**
 *来源系统 srm, erp, 目录化， 电商
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function sourceSystem() {
  const systemSource = { srm: 'SRM', erp: 'ERP', catalogMall: 'CATALOGUE', elMall: 'E-COMMERCE' };
  return systemSource;
}

/**
 *订单来源 申请转订单, 手工创建订单, 寻源转订单，协议转订单
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export function sourceBill() {
  const billSource = {
    prRequest: 'PURCHASE_REQUEST',
    prOrder: 'PURCHASE_ORDER',
    source: 'source',
    pcOrder: 'CONTRACT_ORDER',
  };
  return billSource;
}

/**
 *订单来源页面 手工创建订单 申请转订单 订单维护
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export function sourcePage() {
  const pageSource = {
    pageRequest: 'pageRequest', // 采购申请
    pageOrder: 'pageOrder', // 手工创建
    pageSource: 'pageSource', // 订单维护
    pageMaintain: 'pageMaintain', // 订单维护
    pageConract: 'pageConract', // 采购协议
  };
  return pageSource;
}

function fileReader(blob) {
  // eslint-disable-next-line
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject();
    };

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.readAsText(blob);
  });
}

export async function getJsonBlob(blob) {
  const blobText = await fileReader(blob);
  return JSON.parse(blobText);
}

/**
 * 拼接单位展示
 * @param {String} uomCode 单位编码
 * @param {String} uomName 单位名称
 * @returns uomCodeAndName
 */
export function formatUom(uomCode, uomName) {
  if (uomCode || uomName) {
    return `${uomCode || ''}/${uomName || ''}`;
  }
}

/**
 * 金额格式化
 * @param {Number} aumont 金额
 * @param {Number} precision 精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatAumont(aumont, precision, isSupplement, useGrouping = true) {
  if (isNumber(aumont)) {
    const language = getCurrentLanguage().split('_').join('-');
    const options = Object.assign(
      { useGrouping },
      { maximumFractionDigits: isNumber(precision) ? precision : 20 },
      precision && isSupplement ? { minimumFractionDigits: precision } : {}
    );
    return aumont.toLocaleString(language, options);
  }
  return aumont;
}

/**
 * InputNumber精度控制
 * @param {String} aumontStr 金额字符串
 * @param {*} precision 精度
 * @returns
 */
export function parseAumont(aumontStr, precision) {
  // const reg = /\./g;
  const arr = aumontStr.split('.');
  // const index = aumontStr.search(reg) || 0;
  // const aumont = Number(aumontStr);
  // const language = getCurrentLanguage()
  // .split('_')
  // .join('-');
  if (
    arr.length === 2 &&
    !isNaN(precision) &&
    precision !== null &&
    arr[1].length > Number(precision)
  ) {
    return `${arr[0]}.${arr[1].substr(0, Number(precision))}`;
  }
  // if (!Number.isNaN(aumont) && index !== aumontStr.length - 1 && arr.length <= 2) {
  //   const options = Object.assign(
  //     { useGrouping: false },
  //     precision ? { maximumFractionDigits: precision } : {}
  //   );
  //   return aumont.toLocaleString(language, options);
  // }
  return aumontStr;
}

/**
 * c7n Collapse expandIcon节点渲染
 * @returns expandIcon
 */
export function expandIcon() {
  return <div className={styles.expandIcon} />;
}

/**
 *  dataSets数据count
 * @param {*} ds dataSet
 * @returns dataSets数据count
 */
export function getCount(ds) {
  return isNumber(ds.totalCount) && ds.status === 'ready'
    ? ds.totalCount > 99
      ? '99+'
      : ds.totalCount
    : '';
}
