import { connect } from 'dva';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@connect(({ inquiryHallNew, loading }) => ({
  inquiryHallNew,
  inquiryHall: inquiryHallNew,
  modelName: 'inquiryHallNew',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
