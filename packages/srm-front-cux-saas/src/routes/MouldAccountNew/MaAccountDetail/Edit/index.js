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
  const { match = {}, href = '', onLoad } = props;
  const modalSearch = href.substr(href.indexOf('?'), href.length);
  const { maHeaderId: modalMouldHeaderId, pageForm } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};

  const maHeaderId = params.id || params.maHeaderId || modalMouldHeaderId;
  const headerUnitCode =
    'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO,SIEC.MOULD_PLATFORM.DETAIL.HEADER';
  const itemUnitCode = 'SIEC.MOULD_PLATFORM.DETAIL.LIST';
  const linkUnitCode = 'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE';

  return (
    <StoreProvider
      {...{
        ...props,
        maHeaderId,
        pageForm,
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
    'siec.mould',
    'entity.supplier',
    'entity.organization',
    'entity.item',
    'ssrc.tenderPlan',
    'entity.order',
    'sprm.purchaseRequest',
    'sprm.common',
    'sprm.project',
    'si',
  ],
})(
  withCustomize({
    unitCode: [
      'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO',
      'SIEC.MOULD_PLATFORM.DETAIL.HEADER',
      'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
    ],
  })(Index)
);
