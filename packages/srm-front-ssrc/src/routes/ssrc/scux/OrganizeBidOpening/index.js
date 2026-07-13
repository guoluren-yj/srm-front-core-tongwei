import React, { useEffect, useMemo } from 'react';
import { useDataSet, Modal } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { useObserver, observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';

import { showCheckInCode, cuxOpenBidNew, checkDrawLots } from '@/services/inquiryHallService';

import { openBidListDS, baseInfoDS, prefix } from './store/ds';
import BaseInfo from './components/BaseInfo';
import OpenBidList from './components/OpenBidList';
import CommonLevel from '../components/SecLevelTitle/CommonLevel';
import Style from './index.less';

// 组织开标/开标
const OrganizeBidOpening = (props) => {
  const {
    match: { params },
    history,
  } = props;

  // type为组织开标orgBid\开标bid
  const { rfxHeaderId, type: docType } = params;

  const baseInfoDs = useDataSet(() => baseInfoDS({ rfxHeaderId }), [rfxHeaderId]);
  const openBidListDs = useDataSet(() => openBidListDS({ rfxHeaderId }), [rfxHeaderId]);

  useEffect(() => {
    initData();
  }, [rfxHeaderId]);

  // 初始化数据
  const initData = () => {
    baseInfoDs.query();
    openBidListDs.query();
  };

  const { attributeVarchar20, bidOpenFlag } = useObserver(
    () => baseInfoDs?.current?.get(['attributeVarchar20', 'bidOpenFlag']) || {}
  );

  // 内部签到\供应商签到
  const handleCheckIn = async ({ type }) => {
    const res = await showCheckInCode({ rfxHeaderId, type });
    if (res) {
      const blobURL = window.URL.createObjectURL(res);
      return Modal.open({
        key: Modal.key(),
        title: null,
        footer: null,
        bodyStyle: {
          padding: 0,
        },
        destroyOnClose: true,
        style: { width: '80%' },
        closable: true,
        children: (
          <iframe
            id={`EditOnline${rfxHeaderId}`}
            style={{
              border: '0',
              width: '100%',
              height: `${(document.body.clientHeight - 96) * 0.9}px`,
            }}
            title="Edit Online"
            // eslint-disable-next-line react/no-unknown-property
            src={blobURL}
          />
        ),
      });
    }
  };

  // 抽签
  const handleCheckDrawLots = async () => {
    const rfxNum = baseInfoDs?.current?.get('rfxNum');
    Modal.confirm({
      key: 'scux-ssrc-back-to-check-supplier-modal',
      title: `招标单号：${rfxNum}-标题`,
      children: intl.get(`${prefix}.model.checkDrawLotsTips`).d('请确认是否进行开标顺序抽签'),
      okText: intl.get('hzero.common.button.ok').d('是'),
      cancelText: intl.get('hzero.common.button.cancel').d('否'),
      onOk: async () => {
        const res = getResponse(await checkDrawLots({ rfxHeaderId }));
        if (res) {
          notification.success();
          openBidListDs.query();
        }
        return false;
      },
    });
  };

  // 开标
  const handleCuxOpenBid = async () => {
    const { bidOpenSupplier, bidOpenTeam } =
      baseInfoDs?.current?.get(['bidOpenSupplier', 'bidOpenTeam']) || {};
    const bidRes = await cuxOpenBidNew({
      rfxHeaderId,
      validateFlag: 1, // 值为1时只校验
      bidOpenSupplier,
      bidOpenTeam,
    });
    if (getResponse(bidRes)) {
      /**
       * 点击【开标】后，增加弹框（增加组别的提醒）
        ● 是否开启{$供应商}{$评标组别}标书。
        ● 若同步开标，提示差异----是否开启所有供应商{$评标组别}标书
      */
      await Modal.open({
        title: intl.get(`${prefix}.view.message.button.openingBid`).d('开标'),
        closable: true,
        key: Modal.key(),
        destroyOnClose: true,
        children: bidOpenSupplier
          ? `${intl
              .get(`scux.ssrc.view.message.inquiryHall.twnf.bidOpenFlag`)
              .d('是否开启')}${bidOpenSupplier}${bidOpenTeam}${intl
              .get('scux.ssrc.view.message.inquiryHall.twnf.bidTender')
              .d('标书')}`
          : `${intl
              .get('scux.ssrc.view.message.inquiryHall.twnf.bidAllOpenSupplier')
              .d('是否开启所有供应商')}${bidOpenTeam}${intl
              .get('scux.ssrc.view.message.inquiryHall.twnf.bidTender')
              .d('标书')}`,
        onOk: () => {
          return cuxOpenBidNew({ rfxHeaderId, bidOpenSupplier, bidOpenTeam }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              initData();
            }
          });
        },
      });
    }
  };

  const headerBtns = useMemo(
    () =>
      docType === 'orgBid'
        ? [
            {
              name: 'checkDrawLots',
              btnType: 'c7n-pro',
              child: intl.get(`${prefix}.model.checkDrawLots`).d('抽签'),
              btnProps: {
                icon: 'screen_search_desktop-o',
                funcType: 'flat',
                type: 'c7n-pro',
                onClick: handleCheckDrawLots,
              },
              hidden: attributeVarchar20 === 'SORTITION',
            },
            {
              name: 'supplierCheckIn',
              btnType: 'c7n-pro',
              child: intl.get(`${prefix}.model.supplierCheckIn`).d('供应商签到'),
              btnProps: {
                icon: 'assignment_turned_in-o',
                funcType: 'flat',
                type: 'c7n-pro',
                style: {
                  paddingLeft: 0,
                },
                onClick: () => handleCheckIn({ type: 1 }),
              },
              hidden: attributeVarchar20 === 'SORTITION',
            },
            {
              name: 'internalCheckIn',
              btnType: 'c7n-pro',
              child: intl.get(`${prefix}.model.internalCheckIn`).d('内部签到'),
              btnProps: {
                icon: 'assignment_turned_in-o',
                funcType: 'flat',
                type: 'c7n-pro',
                style: {
                  paddingLeft: 0,
                },
                onClick: () => handleCheckIn({ type: 0 }),
              },
              hidden: attributeVarchar20 === 'SORTITION',
            },
          ]
        : [
            Number(bidOpenFlag) === 1 && {
              name: 'cuxOpenBid',
              btnType: 'c7n-pro',
              child: intl.get(`${prefix}.view.message.button.openingBid`).d('开标'),
              btnProps: {
                wait: 1500,
                funcType: 'flat',
                onClick: handleCuxOpenBid,
              },
            },
          ],
    [docType, bidOpenFlag, attributeVarchar20, handleCheckIn, handleCheckDrawLots, handleCuxOpenBid]
  );

  const commonProps = useMemo(() => {
    return {
      rfxHeaderId,
      history,
    };
  }, [rfxHeaderId]);

  // 头标题
  const headerTitle = useMemo(() => {
    if (docType === 'orgBid') {
      return intl.get(`${prefix}.view.title.organizeBidOpening`).d('组织开标');
    }
    return intl.get(`${prefix}.view.title.bidOpening`).d('开标');
  }, [docType]);

  return (
    <>
      <Header backPath="/ssrc/new-bid-hall/list" title={headerTitle}>
        <DynamicButtons buttons={headerBtns} defaultBtnType="c7n-pro" />
      </Header>
      <Content className={Style['scux-ssrc-bid-opening-content']}>
        <Card title={null} id="cuxBasicInfo" bordered={false}>
          <BaseInfo {...commonProps} baseInfoDs={baseInfoDs} />
        </Card>
        <Card
          title={
            <CommonLevel
              title={intl.get(`${prefix}.view.card.title.openBidListInfo`).d('开标列表')}
            />
          }
          id="cuxOpenBidListInfo"
          bordered={false}
        >
          <OpenBidList {...commonProps} openBidListDs={openBidListDs} />
        </Card>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.ssrc', 'scux.organizeBidOpening'],
})(observer(OrganizeBidOpening));
