/**
 * 专家评分节点 - 新招标
 */
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { INQUIRY_BID } from '@/utils/globalVariable';
import ExpertScoringNew from './ExpertScoringNew';

const withStandardCompEnhancer = (Comp) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${INQUIRY_BID}_DETAIL.EXPERT_SCORE_BASEINFO`,
      `SSRC.${INQUIRY_BID}_DETAIL.HEADER_RFX`,
    ],
  })(Comp);
};

export default withStandardCompEnhancer(ExpertScoringNew);
export { withStandardCompEnhancer, ExpertScoringNew };
