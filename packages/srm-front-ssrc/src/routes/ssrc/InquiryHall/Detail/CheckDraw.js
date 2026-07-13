// 评分明细表ds
import intl from 'utils/intl';



// 评分明细表table

import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

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
                renderer: ({ record }) => (
                    record.get('priceBid') === '已开启' && <a onClick={() => {
                        this.props.history.push({
                            pathname: `/ssrc/new-bid-hall/new-rfx-bargain/${record.get('rfxHeaderId')}?sourceStatus=checkPrice&current=&quotationHeaderId=${record.get('rfxHeaderId')}`,
                        });
                    }}
                    > 商务谈判
                    </a>
                ),
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
