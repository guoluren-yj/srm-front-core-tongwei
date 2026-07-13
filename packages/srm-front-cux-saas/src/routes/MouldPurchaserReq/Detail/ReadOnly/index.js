import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import querystring from 'querystring';

import Detail from './Detail.js';
import StoreProvider from '../Store/store.js';

const Index = props => {
  const { match = {}, href = '', onLoad } = props;
  const modalSearch = href.substr(href.indexOf('?'), href.length);
  const { maHeaderId: modalMouldReqId } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};
  const pubPathFlag = !(match?.path?.includes('/pub/scux/') || href.includes('/pub/scux/'));
  const mouldReqId = params.id || params.mouldReqId || modalMouldReqId;
  const headerUnitCode = 'SIEC.MOULD_REQ_DETAIL.READ.BASE';
  const itemUnitCode = 'SIEC.MOULD_REQ_DETAIL.READ.ITEM_LIST';
  const linkUnitCode = 'SIEC.MOULD_REQ_DETAIL.READ.EXPEND_LIST';
  const buttonUnit = 'SIEC.MOULD_REQ_DETAIL.READ.BTN';
  const attachUnit = 'SIEC.MOULD_REQ_DETAIL.READ.ATTACHINFO';

  return (
    <StoreProvider
      {...{
        ...props,
        pubPathFlag,
        buttonUnit,
        mouldReqId,
        headerUnitCode,
        itemUnitCode,
        linkUnitCode,
        attachUnit,
      }}
    >
      <Detail onLoad={onLoad} />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'siec.mould', 'hzero.common', 'sprm.project'],
})(
  withCustomize({
    unitCode: [
      'SIEC.MOULD_REQ_DETAIL.READ.BASE',
      'SIEC.MOULD_REQ_DETAIL.READ.EXPEND_LIST',
      'SIEC.MOULD_REQ_DETAIL.READ.ITEM_LIST',
      'SIEC.MOULD_REQ_DETAIL.READ.BTN',
      'SIEC.MOULD_REQ_DETAIL.READ.ATTACHINFO',
    ],
  })(Index)
);
