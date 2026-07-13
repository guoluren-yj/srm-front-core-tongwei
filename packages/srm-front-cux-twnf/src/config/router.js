import { getCurrentTenant, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { registerEvent } from 'srm-front-cuz/lib/utils';
import oldRouters from './routers';
import reRouters from './reDevelopRouter';
import sqamCust from '../routes/sqam/custEventBtns';

function traversal(item, isSupplier = false) {
  const res = { ...item };
  if (isSupplier && item.FilterSupplier) return false;
  if (item.components !== undefined) {
    res.priority = -1;
    res.components = res.components.map((i) => traversal(i, isSupplier)).filter(Boolean);
  }
  if (item.component) {
    res.priority = 1000;
  }
  if (item.coverPath) {
    res.path = item.coverPath;
  }
  return res;
}

const getMsRouters = () => {
  const { tenantNum } = getCurrentTenant();
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId();
  let routerConfig = [];
  if (RegExp(`(^|,)${tenantNum}(,|$)`).test(reRouters.tenantNum)) {
    routerConfig = [
      ...oldRouters.map((route) => traversal(route, isSupplier)),
      ...reRouters.routers.map((route) => traversal(route, isSupplier)),
    ];
  }
  return routerConfig.filter(Boolean);
};

registerEvent({
  ...sqamCust,
});

console.log('getMsRouters', sqamCust);

export default getMsRouters;
