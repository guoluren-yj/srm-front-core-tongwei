/**
 * 专家评分节点 - 询价单
 */
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { INQUIRY_HALL } from '@/utils/globalVariable';
import ExpertScoringNew from './ExpertScoringNew';

const withStandardCompEnhancer = (Comp) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${INQUIRY_HALL}_DETAIL.EXPERT_SCORE_BASEINFO`,
      `SSRC.${INQUIRY_HALL}_DETAIL.HEADER_RFX`,
    ],
  })(Comp);
};

export default withStandardCompEnhancer(ExpertScoringNew);
export { withStandardCompEnhancer, ExpertScoringNew };
