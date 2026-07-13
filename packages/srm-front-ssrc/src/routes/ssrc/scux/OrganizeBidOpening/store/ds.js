import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

export const prefix = 'scux.organizeBidOpening';
// 基础信息ds
export const baseInfoDS = ({ rfxHeaderId }) => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'companyName',
        label: intl.get(`${prefix}.model.twnf.companyName`).d('公司'),
      },
      {
        name: 'attributeLongtext20',
        label: intl.get(`${prefix}.model.twnf.openingOrder`).d('开标顺序'),
      },
      {
        name: 'scoreWay',
        label: intl.get(`${prefix}.model.twnf.scoreWay`).d('评分方式'),
        lookupCode: 'SCUX.TWNF_BID_SCORE_WAY',
      },
    ],
    transport: {
      read: () => {
        return {
          method: 'GET',
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/simple/${rfxHeaderId}`,
          data: {
            permissionFilterFlag: 0,
          },
        };
      },
    },
  };
};

// 开标列表ds
export const openBidListDS = ({ rfxHeaderId }) => {
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`${prefix}.model.twnf.lineNum`).d('序号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        label: intl.get(`${prefix}.model.twnf.supplierName`).d('供应商名称'),
        type: 'string',
        name: 'supplierName',
      },
      {
        label: intl.get(`${prefix}.model.twnf.contactPerson`).d('联系人'),
        name: 'contactPerson',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rfxPhone').d('联系电话'),
        name: 'phone',
      },
      {
        label: intl.get(`${prefix}.model.twnf.email`).d('电子邮件'),
        name: 'email',
      },
      {
        label: intl.get(`${prefix}.model.twnf.openTenderOrder`).d('开标顺序'),
        name: 'openTenderOrder',
      },
      {
        label: intl.get(`${prefix}.model.twnf.techBid`).d('技术标状态'),
        name: 'techBid',
      },
      {
        label: intl.get(`${prefix}.model.twnf.techOpenTime`).d('技术开标时间'),
        type: 'dateTime',
        name: 'techOpenTime',
      },
      {
        label: intl.get(`${prefix}.model.twnf.businessBid`).d('商务标状态'),
        name: 'businessBid',
      },
      {
        label: intl.get(`${prefix}.model.twnf.businessOpenTime`).d('商务开标时间'),
        name: 'businessOpenTime',
        type: 'dateTime',
      },
      {
        label: intl.get(`${prefix}.model.twnf.priceBid`).d('价格标状态'),
        name: 'priceBid',
      },
      {
        label: intl.get(`${prefix}.model.twnf.priceOpenTime`).d('价格开标时间'),
        name: 'priceOpenTime',
        type: 'dateTime',
      },
      {
        label: intl.get(`${prefix}.model.twnf.businessBattle`).d('商务谈判'),
        name: 'businessBattle',
      },
    ],
    transport: {
      read: () => {
        if (rfxHeaderId) {
          return {
            url: `/marmot/v1/1/marmot-api/jvib0lJUgzkG7gwu1xupoxNlcZU3d8FXXbQGNuulSV8A`,
            method: 'GET',
            data: { rfxHeaderId },
          };
        }
      },
    },
  };
};
