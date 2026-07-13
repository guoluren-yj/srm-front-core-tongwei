// 评分明细表ds
import intl from 'utils/intl';



// 评分明细表table

import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

export default class CheckIn extends Component {
    constructor(props) {
        super(props);

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
                    label: '公司名称',
                    type: 'string',
                    name: 'companyName',
                },
                {
                    label: '姓名',
                    name: 'name',
                },
                {
                    label: intl.get('ssrc.inquiryHall.model.inquiryHall.rfxPhone').d('联系电话'),
                    name: 'phone',
                },
                {
                    label: '身份证号',
                    name: 'idCard',
                }, {
                    label: '职务',
                    name: 'position',
                },
                {
                    label: '入职时间',
                    name: 'entryTime',
                    type: 'dateTime',
                },
                {
                    label: '签到时间',
                    name: 'creationDate',
                },

            ],
            transport: {
                read: () => {
                    if (rfxHeaderId) {
                        return {
                            url: `/marmot/v1/1/marmot-api/jvib0lJUgzkG7gwu1xupoxFro2racqVXZph0h4qpS7ia8`,
                            method: 'GET',
                            data: { rfxHeaderId },
                        };
                    }
                },
                submit: () => {
                    return {
                        url: `/marmot/v1/1/marmot-api/jvib0lJUgzkG7gwu1xupoxFro2racqVXZph0h4qpS7ia8`,
                        method: 'POST',
                    };
                },

            },
        };
    };


    componentDidMount() { }

    // table columns
    getColumns = () => {


        const columns = [
            { name: 'lineNum' },
            { name: 'companyName', editor: false },
            { name: 'name', editor: false },
            { name: 'phone', editor: false },
            { name: 'idCard', editor: false },
            { name: 'position', editor: false },
            { name: 'entryTime', editor: false },
            { name: 'creationDate' },

        ]

        return columns;
    };



    render() {

        return (
            <Table
                bordered
                dataSet={this.checkDataSet}
                columns={this.getColumns()}
                // buttons={[['add', { onClick: () => { this.checkDataSet.create({ rfxHeaderId: this.props.data.rfxHeaderId }); } }], 'save']}
                // buttons={this.renderTableButtons()}
                style={{ maxHeight: 450 }}
            />
        );
    }
}
