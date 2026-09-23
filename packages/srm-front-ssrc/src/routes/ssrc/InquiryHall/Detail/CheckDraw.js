// 评分明细表ds
import intl from 'utils/intl';



// 评分明细表table

import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import querystring from 'querystring';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { fetchOpenBargain } from '@/services/inquiryHallService';
import { getSourceUrlConfig } from '@/routes/ssrc/scux/BidEvaluationManagement/api';

export default class CheckIn extends Component {
    constructor(props) {
        super(props);

        if (props?.onRef) {
            props.onRef(this);
        }
        const { data } = this.props;
        const { rfxHeaderId } = data || {};
        // const { current } = rfxInfoDS || {};
        // const rfxHeaderId = current ? current?.get('rfxHeaderId') : null;
        this.checkDataSet = new DataSet(this.checkInDs(rfxHeaderId));
    }


    checkInDs = (rfxHeaderId) => {
        return {
            autoQuery: true,
            selection: false,
            fields: [
                {
                    label: '序号',
                    type: 'string',
                    name: 'lineNum',
                },
                {
                    label: '供应商名称',
                    type: 'string',
                    name: 'supplierName',
                },
                {
                    label: '联系人',
                    name: 'contactPerson',
                },
                {
                    label: intl.get('ssrc.inquiryHall.model.inquiryHall.rfxPhone').d('联系电话'),
                    name: 'phone',
                },
                {
                    label: '电子邮件',
                    name: 'email',
                }, {
                    label: '开标顺序',
                    name: 'openTenderOrder',
                },
                {
                    label: '技术标状态',
                    name: 'techBid',
                    // type: 'dateTime',
                },
                {
                    label: '技术开标时间',
                    type: 'dateTime',
                    name: 'techOpenTime',
                },
                {
                    label: '商务标状态',
                    name: 'businessBid',
                    // type: 'dateTime',
                },
                {
                    label: '商务开标时间',
                    name: 'businessOpenTime',
                    // type: 'dateTime',
                },
                {
                    label: '价格标状态',
                    name: 'priceBid',
                    // type: 'dateTime',
                }, {
                    label: '价格开标时间',
                    name: 'priceOpenTime',
                    // type: 'dateTime',
                },
                {
                    label: '商务谈判',
                    name: 'businessBattle',
                    // type: 'dateTime',
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


    componentDidMount() { }

    /**
     * 跳转到商务谈判
     *
     * 原实现直接读 this.props.history，但父级 OpenBid 从未把 history 下发下来（见 OpenBid 的 listProps），
     * 点击必然抛 TypeError，后面的 push 不执行，表现为「点了没反应」；且原来把 query 拼在 pathname 里，
     * 进的也始终是 rfxHeaderId（报价单 id 应为行上的 quotationHeaderId），也没有先发起议价。
     * 这里改成与二开版一致的写法：
     * routes/ssrc/scux/OrganizeBidOpening/components/OpenBidList.js、
     * routes/ssrc/scux/BidEvaluationManagement/Detail/components/Header.tsx
     */
    handleBusinessBattle = async (record) => {
        const { history, data = {} } = this.props;
        const { rfxHeaderId, bargainOfflineFlag, sourceType } = data;
        const quotationHeaderId = record.get('quotationHeaderId');
        if (!rfxHeaderId || !quotationHeaderId) {
            notification.warning({
                message: intl.get('ssrc.inquiryHall.view.message.businessBattle.missingQuotation').d('缺少报价单信息，无法进入商务谈判'),
            });
            return;
        }
        // 议价未发起时先发起，否则议价页拿不到议价单
        const res = await getSourceUrlConfig({ sourceHeaderId: rfxHeaderId });
        if (getResponse(res) && res.bargainStatus === 'INITIATE') {
            await fetchOpenBargain({
                organizationId: getCurrentOrganizationId(),
                rfxHeaderId,
                bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : sourceType,
            });
        }
        history.push({
            pathname: `/ssrc/new-bid-hall/new-rfx-bargain/${rfxHeaderId}`,
            search: querystring.stringify({
                sourceStatus: 'checkPrice',
                quotationHeaderId,
            }),
        });
    };

    // 价格标已开启才展示「商务谈判」入口
    renderBusinessBattle = ({ record }) => {
        if (record.get('priceBid') !== '已开启') return null;
        return <a onClick={() => this.handleBusinessBattle(record)}>商务谈判</a>;
    };

    // table columns
    getColumns = () => {


        const columns = [
            {
                width: 80,
                name: 'lineNum',
            },
            { name: 'supplierName' },
            { name: 'contactPerson' },
            { name: 'phone' },
            { name: 'email' },
            { name: 'openTenderOrder' },
            { name: 'techBid' },
            { name: 'techOpenTime' },
            { name: 'businessBid' },
            { name: 'businessOpenTime' },
            {
                label: '价格标状态',
                name: 'priceBid',
                // type: 'dateTime',
            }, {
                label: '价格开标时间',
                name: 'priceOpenTime',
                // type: 'dateTime',
            },
            {
                name: 'businessBattle',
                renderer: this.renderBusinessBattle,
                // type: 'dateTime',
            },

        ];

        return columns;
    };



    render() {

        return (
            <Table
                bordered
                pagination={false}
                dataSet={this.checkDataSet}

                // rowKey="checkin"
                columns={this.getColumns()}
                // buttons={this.renderTableButtons()}
                style={{ maxHeight: 450 }}
            />
        );
    }
}
