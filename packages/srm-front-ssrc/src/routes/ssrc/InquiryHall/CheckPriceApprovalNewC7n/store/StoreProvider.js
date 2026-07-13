import React, { createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import querystring from 'querystring';
import { fetchHeaderInfo } from '@/services/checkPriceOverviewServices';
import { queryCheckPriceUiDisplayConfig } from '@/services/commonService';
import { BID, INQUIRY, getQuotationName } from '@/utils/globalVariable';
import {
  headerDS,
  basicDS,
  tableAttachmentDS,
  itemTableDS,
  supplierTableDS,
  attachmentDS,
  expertScoreDataSet,
  expertScoreHeadDataSet,
} from './storeDS';

const StoreContext = createContext({});
const organizationId = getCurrentOrganizationId();

function StoreProvider(props = {}) {
  const {
    history,
    children,
    location = {},
    sourceKey = INQUIRY,
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    match: { params = {}, path = '' },
    customizeCommon,
    queryTemplateConfig,
    doubleUnitFlag = false,
    queryUnitConfig,
    remote,
    onLoad,
  } = props;
  const rfxHeaderId = useMemo(() => params?.rfxId, [params?.rfxId]);

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // sourceKey不同入口的值不同，INQUIRY询价   BID招标
  const bidFlag = useMemo(() => sourceKey === BID, [sourceKey]); // 是否新招标
  // 问号后rfxHeaderIds字段值为所有标段的id，仅有一个标段时也有值
  const rfxHeaderIdArr = useMemo(() => routerParams?.rfxHeaderIds?.split(','), [routerParams]);
  const isSection = useMemo(() => rfxHeaderIdArr?.length > 1, [rfxHeaderIdArr]);
  const rfxHeaderIds = useMemo(() => routerParams?.rfxHeaderIds, [routerParams]);
  // templateCode=NEW&templateVersion=1&stageCode=INQUIRY_CHECK&pageCode=DEFAULT 审批表单路由上带的信息
  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode,
      cuszTplPageCode: routerParams?.pageCode,
    };
  }, [routerParams]);
  const quotationName = getQuotationName(bidFlag);

  // 是否是审批表单
  const pubFlag = useMemo(() => path?.indexOf('/pub') > -1, []);
  const [headerInfo, setHeaderInfo] = useState({});
  const [currentHeaderId, setCurrentHeaderId] = useState(rfxHeaderId);
  const [contentLoading, setContentLoading] = useState(true);
  const [checkPriceUiIsNew, setCheckPriceUiIsNew] = useState(false);

  let CurrentHeaderDS = headerDS(bidFlag);
  CurrentHeaderDS = remote
    ? remote.process('SSRC_CHECK_PRICE_APPROVAL_OVERVIEW_PROCESS_HEADERDS', CurrentHeaderDS, {
        rfxHeaderId,
        bidFlag,
        pubFlag,
      })
    : CurrentHeaderDS;

  const headerDs = useDataSet(() => CurrentHeaderDS, []);
  const basicDs = useDataSet(() => basicDS(bidFlag), []);
  const tableAttachmentDs = useDataSet(() => tableAttachmentDS(), []);

  const supplierTableDs = useDataSet(() => supplierTableDS(sourceKey), []);

  const itemTableDs = useDataSet(() => itemTableDS(sourceKey), []);
  const attachmentDs = useDataSet(() => attachmentDS(sourceKey), []);
  const expertScoreHeadDS = useDataSet(() => expertScoreHeadDataSet(), []);
  const expertScoreDS = useDataSet(() => expertScoreDataSet(), []);

  useEffect(() => {
    // 查询是否开启了新核价
    queryCheckPriceUiDisplayConfig().then((res) => {
      if (getResponse(res)) {
        setCheckPriceUiIsNew(Boolean(res?.length));
      }
    });
    supplierTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    itemTableDs.setState('doubleUnitFlag', doubleUnitFlag);
  }, [doubleUnitFlag]);

  // 我们的核价和定标使用同一个单据，同一个阶段，用不同的页面pageCode区分
  useEffect(() => {
    initFetchService();
  }, [rfxHeaderId, bidFlag, supplierTableDs, itemTableDs, templateInfo]);

  const initFetchService = useCallback(async () => {
    setContentLoading(true);
    supplierTableDs.setQueryParameter('templateInfo', templateInfo);
    itemTableDs.setQueryParameter('templateInfo', templateInfo);
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    if (
      templateInfo?.cuszTplTemplateCode &&
      templateInfo?.cuszTplVersion &&
      templateInfo?.cuszTplStageCode &&
      templateInfo?.cuszTplPageCode
    ) {
      await queryTemplateConfig(queryParams, {
        // 阶段编码，页面编码
        stageCode: templateInfo?.cuszTplStageCode,
        pageCode: templateInfo?.cuszTplPageCode,
      });
    } else {
      const unitCode = [
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_BUTTONS`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_APPROVAL_BUTTONS`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_BASIC`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_EXTRA`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_AF_EXTRA`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_TABLES`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_AF_EXTRA`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_TABLES`,
        `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.TABLE_ATTACHMENT`,
      ];
      queryUnitConfig(undefined, undefined, unitCode);
    }
    queryHeaderInfo();
  }, [rfxHeaderId, bidFlag, supplierTableDs, itemTableDs, templateInfo]);

  // queryParams切换标段时会传新的rfxHeaderId进来
  const queryHeaderInfo = useCallback(
    (queryParams = {}) => {
      if (queryParams?.rfxHeaderId && queryParams?.rfxHeaderId !== currentHeaderId) {
        setCurrentHeaderId(queryParams.rfxHeaderId);
      }
      setContentLoading(true);
      const headerParams = {
        rfxHeaderId: currentHeaderId,
        organizationId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_BUTTONS
        ,SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_APPROVAL_BUTTONS,
        SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_BASIC,
        SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_EXTRA,
        SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT`,
        ...templateInfo,
        ...queryParams,
      };
      fetchHeaderInfo(headerParams)
        .then((res) => {
          if (getResponse(res)) {
            setHeaderInfo(res);
            headerDs.loadData([res]);
            basicDs.loadData([res]);
            attachmentDs.loadData([res]);
            basicDs.setState('headerInfo', res);
          }
        })
        .finally(() => {
          setContentLoading(false);
        });
    },
    [currentHeaderId, templateInfo]
  );

  const value = useMemo(
    () => ({
      sourceKey,
      isSection,
      organizationId,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      doubleUnitFlag,
      commonDs: {
        headerDs,
        basicDs,
        tableAttachmentDs,
        supplierTableDs,
        itemTableDs,
        attachmentDs,
        expertScoreDS,
        expertScoreHeadDS,
      },
      rfxHeaderId: currentHeaderId,
      pubFlag,
      customizeCommon,
      headerInfo,
      queryHeaderInfo,
      contentLoading,
      checkPriceUiIsNew,
      bidFlag,
      rfxHeaderIds,
      templateInfo,
      remote,
      quotationName,
      history,
      location,
      onLoad,
    }),
    [
      history,
      location,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      headerDs,
      basicDs,
      tableAttachmentDs,
      supplierTableDs,
      itemTableDs,
      attachmentDs,
      doubleUnitFlag,
      pubFlag,
      customizeCommon,
      headerInfo,
      currentHeaderId,
      contentLoading,
      checkPriceUiIsNew,
      bidFlag,
      rfxHeaderIds,
      templateInfo,
      remote,
      expertScoreDS,
      onLoad,
    ]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;
export { StoreContext };
