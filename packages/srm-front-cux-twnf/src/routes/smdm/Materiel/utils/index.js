import React from 'react';
import { DataSet, Modal, DateTimePicker, Form } from 'choerodon-ui/pro';
import moment from 'moment';
import { omit } from 'lodash';
import { SRM_MARMOT } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

export const openMdmModal = (props = {}) => {
  const { onQueryList } = props;
  const formDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'startDate',
        type: 'dateTime',
        label: intl.get('smdm.materiel.scux.model.view.datetimeFrom').d('开始时间'),
        required: true,
        max: 'endDate',
        defaultValue: moment().subtract(1, 'days'),
      },
      {
        name: 'endDate',
        type: 'dateTime',
        label: intl.get('smdm.materiel.scux.model.view.datetimeTo').d('结束时间'),
        required: true,
        min: 'startDate',
        defaultValue: moment(),
        // dynamicProps: {
        //   max: ({ record }) => {
        //     const startDate = record.get('startDate');
        //     if (startDate) {
        //       return moment(startDate).add(30, 'day');
        //     }
        //   },
        // },
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/jyj5ibrF8gexOia0oNoBlHdlnRy1jEibM4K7SCJYqwD6Eg`,
          method: 'POST',
          data: omit(data[0], '__id', '_status'),
        };
      },
    },
  });
  Modal.open({
    key: Modal.key(),
    title: intl.get('smdm.materiel.scux.title.getMdmMaterial').d('获取MDM物料'),
    destroyOnClose: true,
    drawer: true,
    children: (
      <Form labelLayout="float" dataSet={formDs} columns={2}>
        <DateTimePicker name="startDate" />
        <DateTimePicker name="endDate" />
      </Form>
    ),
    onOk: async () => {
      if (await formDs.validate()) {
        await formDs.submit();
        if(onQueryList){
          onQueryList();
        }
        return true;
      }
      return false; // 阻止默认关闭行为
    },
  });
};