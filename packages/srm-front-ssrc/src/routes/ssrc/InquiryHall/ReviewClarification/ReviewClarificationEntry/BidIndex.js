import { connect } from 'dva';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@connect(({ inquiryHallBid, loading }) => ({
  inquiryHallBid,
  inquiryHall: inquiryHallBid,
  modelName: 'inquiryHallBid',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
