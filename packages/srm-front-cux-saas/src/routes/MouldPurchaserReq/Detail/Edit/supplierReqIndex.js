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

  const mouldReqId = params.id || params.mouldReqId || modalMouldReqId;
  const headerUnitCode = 'SIEC.MOULD_REQ_SUP_DETAIL.BASE';
  const itemUnitCode = 'SIEC.MOULD_REQ_SUP_DETAIL.ITEM_LIST';
  const linkUnitCode = 'SIEC.MOULD_REQ_SUP_DETAIL.EXPAND_LIST';
  const buttonUnit = 'SIEC.MOULD_REQ_SUP_DETAIL.BTN';
  const attachUnit = 'SIEC.MOULD_REQ_SUP_DETAIL.ATTACHINFO';

  return (
    <StoreProvider
      {...{
        source: 'create',
        ...props,
        mouldReqId,
        headerUnitCode,
        itemUnitCode,
        linkUnitCode,
        buttonUnit,
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
      'SIEC.MOULD_REQ_SUP_DETAIL.BASE',
      'SIEC.MOULD_REQ_SUP_DETAIL.EXPAND_LIST',
      'SIEC.MOULD_REQ_SUP_DETAIL.ITEM_LIST',
      'SIEC.MOULD_REQ_SUP_DETAIL.BTN',
      'SIEC.MOULD_REQ_SUP_DETAIL.ATTACHINFO',
    ],
  })(Index)
);
