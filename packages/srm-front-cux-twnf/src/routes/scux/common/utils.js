// import { numberRender } from 'utils/renderer'; // yesOrNoRender
import React, { createElement } from 'react';
import { Icon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { getCurrentLanguage } from 'utils/utils/user';
import { NumberField } from 'choerodon-ui/pro';
import { defaults } from 'lodash';
import { Tag } from 'hzero-ui';
import intl from 'utils/intl';
import CF from './cf';

const language = getCurrentLanguage().split('_').join('-');
const cf = new CF({
  locales: language,
});

export function thousandBitSeparator(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (oldLength >= precision) {
    return NumberField.format(num, language, {
      maximumFractionDigits: oldLength > 20 ? 20 : oldLength,
    });
  }
  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return num
    ? NumberField.format(num, language, {
        maximumFractionDigits: (precision > 20 ? 20 : precision) || 20,
        minimumFractionDigits: (precision > 20 ? 20 : precision) || 0,
      })
    : num;
}

// inputNumber的调整
export const precisionParams = (precision = 2, bool) => {
  return bool
    ? {
        // allowThousandth: true,
        formatter: (value) => {
          return cf.format(value);
        },
        parser: (value) => {
          return cf.unformat(value);
        },
      }
    : {
        precision,
        formatter: (value) => {
          // console.log('formatter', value, cf.format(value));
          return cf.format(value);
        },
        parser: (value) => {
          // console.log('parser', value, cf.unformat(value));
          return cf.unformat(value);
        },
      };
};

// // inputNumber的调整
export const precisionNum = (val, record, meaning) => {
  if (math.isNaN(val)) return record.amountPrecision;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.amountPrecision
    ? record.amountPrecision
    : oldLength;
};

export const precisionNumPrice = (val, record, meaning) => {
  if (math.isNaN(val)) return val;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.pricePrecision
    ? record.pricePrecision
    : oldLength;
};

export function decimalPointAccuracy(num, precision, bools) {
  if (math.isNaN(num)) return num;
  if (
    (typeof num === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    return num;
  }
  const oldLength = math.dp(num);
  const arr = math.toFixed(num, oldLength).split('.');

  if (oldLength >= precision) {
    // 四舍五入
    if (bools && bools.rounding) {
      return NumberField.format(num, language, {
        maximumFractionDigits: precision > 20 ? 20 : precision,
      });
    } else {
      return precision !== 0 ? `${arr[0]}.${arr[1].slice(0, precision)}` : arr[0];
    }
  }

  // 补零
  if (bools && bools.repair) {
    return num
      ? NumberField.format(num, language, {
          maximumFractionDigits: (precision > 20 ? 20 : precision) || 20,
          minimumFractionDigits: (precision > 20 ? 20 : precision) || 0,
        })
      : num;
  } else {
    return `${num}`;
  }
}

export function btnsFormat(btns = []) {
  const showBtns = [];
  let foldBtns = [];
  btns
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  foldBtns = foldBtns.map((item) => {
    const { btnProps } = item;
    if (btnProps && btnProps.buttonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          buttonProps: {
            ...btnProps.buttonProps,
            icon: '',
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
          },
        },
      };
    } else if (btnProps && btnProps.otherButtonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          otherButtonProps: {
            ...btnProps.otherButtonProps,
            icon: '',
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
          },
        },
      };
    } else {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          icon: '',
        },
      };
    }
  });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 配置平台组件 maxNum 属性后使用
export function formatDynamicBtns(btns = []) {
  return btns
    .filter((item) => item)
    .map((item, index) => {
      const { btnComp, btnProps = {} } = item;
      if (!btnComp) {
        const defaultBtnProps =
          index > 0
            ? { funcType: 'flat', color: 'default' }
            : { funcType: 'raised', color: 'primary' };
        Object.assign(item, {
          btnProps: defaults(btnProps, defaultBtnProps),
        });
      }
      return item;
    });
}

export function approveNameRender(action) {
  const { actionText, actionColor } = approveNameRenderTemp(action);
  return actionText ? <Tag color={actionColor}>{actionText}</Tag> : null;
}

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#2C3E50';
        actionText = intl.get('hzero.common.text.startEvent').d('开始');
        break;
      case 'endevent':
        actionText = intl.get('hzero.common.text.endEvent').d('结束');
        break;
      case 'approved':
        actionColor = '#87d068';
        actionText = intl.get('hzero.common.status.agree').d('同意');
        break;
      case 'rejected':
        actionColor = '#f50';
        actionText = intl.get('hzero.common.status.reject').d('拒绝');
        break;
      case 'addsign':
        actionColor = 'cyan';
        actionText = intl.get('hzero.common.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        actionColor = 'green';
        actionText = intl.get('hzero.common.status.ApproveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        actionColor = '#108ee9';
        actionText = intl.get('hzero.common.status.delegate').d('转交');
        break;
      case 'jump':
        actionColor = 'red';
        actionText = intl.get('hzero.common.status.jump').d('驳回');
        break;
      case 'recall':
        actionColor = 'orange';
        actionText = intl.get('hzero.common.status.recall').d('撤回');
        break;
      case 'revoke':
        actionColor = 'gold';
        actionText = intl.get('hzero.common.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        actionColor = '#2db7f5';
        actionText = intl.get('hzero.common.status.autoDelegate').d('自动转交');
        break;
      case 'carboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'autocarboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.autocarboncopy').d('自动抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('hzero.common.status.specify').d('指定');
        break;
      case 'stop':
        actionText = intl.get('hzero.common.status.stop').d('终止');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}