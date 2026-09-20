// 电签状态 值集 SCUX.TWNF_EC_STATUS
export const EC_STATUS = {
  SUCC: 'ED_SUCCESS', // 成功
  FAILED: 'ED_FAIL_TIMEOUT', // 失败
  VOID: 'ED_FAIL_INVALIDATE', // 作废
};

// 是否电签（attributeVarchar1）为「是」
export const isElectronicSignature = (record) => Number(record?.get('attributeVarchar1')) === 1;

/**
 * 行上操作列的按钮类型，与列渲染、提交校验共用同一套判断，避免两边逻辑走偏
 * @returns {String|null} sign:【电签】按钮（是否电签为「是」，电签状态为空/失败/作废）
 *                        cancel:【作废】按钮（是否电签为「是」，电签状态为成功）
 *                        null: 无按钮（是否电签为「否」，或电签状态为其它值）
 */
export const getElectronicSignAction = (record) => {
  if (!record || !isElectronicSignature(record)) {
    return null;
  }

  const electronicSignatureStatus = record.get('attributeVarchar5');
  if (electronicSignatureStatus === EC_STATUS.SUCC) {
    return 'cancel';
  }
  if (
    !electronicSignatureStatus ||
    electronicSignatureStatus === EC_STATUS.FAILED ||
    electronicSignatureStatus === EC_STATUS.VOID
  ) {
    return 'sign';
  }
  return null;
};
