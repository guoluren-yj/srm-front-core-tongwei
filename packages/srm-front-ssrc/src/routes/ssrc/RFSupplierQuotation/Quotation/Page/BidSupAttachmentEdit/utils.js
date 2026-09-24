// 电签状态 值集 SCUX.TWNF_EC_STATUS
export const EC_STATUS = {
  SUCC: 'ED_SUCCESS', // 成功
  FAILED: 'ED_FAIL_TIMEOUT', // 失败
  VOID: 'ED_FAIL_INVALIDATE', // 作废
};

// 电签状态为这几个值时，不允许再发起电签
export const SIGN_HIDDEN_STATUS = [
  EC_STATUS.SUCC, // 成功，此时的操作是【作废】
  'ING_SENT_DILIVER', // 已发出待签署
  'ING_SENT_WAIT_FILLOUT', // 待填写
];

// 是否电签（attributeVarchar1）为「是」
export const isElectronicSignature = (record) => Number(record?.get('attributeVarchar1')) === 1;

// 【附件是否必输】（requiredFlag）为「是」。提交校验和签章附件列的必填都以此为准
export const isAttachmentRequired = (record) => Number(record?.get('requiredFlag')) === 1;

/**
 * 行上操作列的按钮类型，与列渲染、提交校验共用同一套判断，避免两边逻辑走偏
 * @returns {String|null} sign:【电签】按钮（是否电签为「是」，电签状态不在 SIGN_HIDDEN_STATUS 内）
 *                        cancel:【作废】按钮（是否电签为「是」，电签状态为成功）
 *                        null: 无按钮（是否电签为「否」，或电签状态为已发出待签署/待填写）
 */
export const getElectronicSignAction = (record) => {
  if (!record || !isElectronicSignature(record)) {
    return null;
  }

  const electronicSignatureStatus = record.get('attributeVarchar5');
  // 电签成功后只能作废
  if (electronicSignatureStatus === EC_STATUS.SUCC) {
    return 'cancel';
  }
  // 黑名单之外的状态（空、超时失败、拒签、撤销、作废等）都允许重新发起电签
  if (SIGN_HIDDEN_STATUS.includes(electronicSignatureStatus)) {
    return null;
  }
  return 'sign';
};
