/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2023-04-23 21:21:36
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import querystring from 'querystring';

import Detail from './Detail.js';
import StoreProvider from '../store.js';

const Index = props => {
  const { match = {}, history = {}, onLoad } = props;
  const href = history?.location?.search || '';
  const modalSearch = href.substr(href.indexOf('?'), href.length);
  const { maHeaderId: modalMouldHeaderId, pageAction } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};
  const maHeaderId = params.id || params.maHeaderId || modalMouldHeaderId;
  const headerUnitCode =
    'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO,SIEC.MOULD_PLATFORM.APPROVE.HEADER';
  const itemUnitCode = 'SIEC.MOULD_PLATFORM.DETAIL.LIST';
  const linkUnitCode = 'SIEC.MOULD_PLATFORM.APPROVE.EXPAND_LINE';

  return (
    <StoreProvider
      {...{
        ...props,
        pageForm: pageAction,
        maHeaderId,
        headerUnitCode,
        itemUnitCode,
        linkUnitCode,
      }}
    >
      <Detail onLoad={onLoad} />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'entity.supplier',
    'sprm.common',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'entity.item',
    'ssrc.tenderPlan',
    'entity.order',
    'siec.mould',
    'sprm.purchaseRequest',
    'sprm.common',
    'sprm.project',
  ],
})(
  withCustomize({
    unitCode: [
      'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO',
      'SIEC.MOULD_PLATFORM.APPROVE.HEADER',
      'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      'SIEC.MOULD_PLATFORM.APPROVE.EXPAND_LINE',
      'SIEC.MOULD_PLATFORM.APPROVE.READATTACH',
    ],
  })(Index)
);
