import { connect } from 'dva';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@connect(({ inquiryHallExpert, loading }) => ({
  inquiryHallExpert,
  inquiryHall: inquiryHallExpert,
  modelName: 'inquiryHallExpert',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
