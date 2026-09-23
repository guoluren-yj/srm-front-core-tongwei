import { useEffect, useState } from 'react';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getCurrentRole, getResponse } from 'hzero-front/lib/utils/utils';

// 「状态」可见性所依据的值集，值集里维护的是可见的角色编码
const SUP_STATUS_VIEW_LOOKUP = 'SCUX_TWNF_SUP_STATUS_VIEW';

/**
 * 「状态」列/筛选项/表单字段是否对当前登录账号可见：
 * 值集 SCUX_TWNF_SUP_STATUS_VIEW 里维护了可见的角色编码，当前角色的角色编码命中才可见。
 * @returns null 表示值集还没查回来（此时按不可见处理）
 */
export default function useStatusVisible() {
  const [statusVisible, setStatusVisible] = useState<boolean | null>(null);

  useEffect(() => {
    let canceled = false;
    queryMapIdpValue({ supStatusView: SUP_STATUS_VIEW_LOOKUP })
      .then((res) => {
        if (canceled) return;
        const items: any[] = getResponse(res)?.supStatusView || [];
        const { code } = getCurrentRole();
        setStatusVisible(!!code && items.some((item) => String(item?.value) === String(code)));
      })
      .catch(() => {
        // 查询失败时按不可见处理，避免越权展示状态
        if (!canceled) setStatusVisible(false);
      });
    return () => {
      canceled = true;
    };
  }, []);

  return statusVisible;
}
