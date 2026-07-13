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
                    label: '部门名称',
                    type: 'string',
                    name: 'deptName',
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
                    label: '签到时间',
                    type: "dateTime",
                    name: 'creationDate',
                },
            ],
            transport: {
                read: () => {
                    if (rfxHeaderId) {
                        return {
                            url: `/marmot/v1/1/marmot-api/jvib0lJUgzkG7gwu1xupoxFOQ4CiaL4wX02rXQ5E0jDLE`,
                            method: 'GET',
                            data: { rfxHeaderId },
                        };

                    }
                },
                submit: () => {
                    return {
                        url: `/marmot/v1/1/marmot-api/jvib0lJUgzkG7gwu1xupoxFOQ4CiaL4wX02rXQ5E0jDLE`,
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
            { name: 'deptName' },
            { name: 'name' },
            { name: 'phone' },
            { name: 'creationDate', editor: false },

        ];

        return columns;
    };


    render() {

        return (
            <Table
                bordered
                dataSet={this.checkDataSet}
                rowKey="checkin"
                columns={this.getColumns()}
                // buttons={[['add', { onClick: () => { this.checkDataSet.create({ rfxHeaderId: this.props.data.rfxHeaderId }); } }], 'save']}
                // buttons={this.renderTableButtons()}
                style={{ maxHeight: 450 }}
            />
        );
    }
}
