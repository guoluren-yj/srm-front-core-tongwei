import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Collapse } from 'choerodon-ui';
import { DataSet, Attachment } from 'choerodon-ui/pro';

import { observer } from 'mobx-react-lite';
import { Header } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { parse } from 'querystring';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';

import FormPro from '@/components/FormPro';
import { formDataSet, intlPrompt } from './initialDs';
import styles from './index.less';
import request from 'hzero-front/lib/utils/request';

const { Panel } = Collapse

const Detail = ({ location, history }) => {
  const params = parse(location.search.substring(1));
  const readOnly = useMemo(() => params.readOnly === 'true', [params]); // 只读标识
  const [id, setId] = useState(params.id);
  const [editFlag] = useState(!readOnly);
  const backPath = useMemo(() => `/scux/complaint-workbench/list`, []);

  const formDs = useMemo(() => new DataSet(formDataSet(id)), [id]);

  useEffect(() => {
    if (!!id) { // 查询数据
      fetchData()
    } else {
      fetchDefaultData();
    }
  }, [id]);

  const fetchData = async () => {
    await formDs.query();
  }

  const fetchDefaultData = async () => {
    const response = await request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/zVXNV9QyW5yBoNom2sOzgau3fLeib0zaVU2N18JFjzx0`, {
      method: 'POST',
      query: { methodCode: 'create'}
    })
    if(getResponse(response)) {
      const { mobile, companyId, ouId, companyName, ouName} = response || {};
      formDs.loadData([{
        complainMobile: mobile,
        companyId,
        companyName,
        ouId,
        ouName,
        status: 'NEW'
      }]);
    }
  }
  // 保存 / 提交
  const handleSave = useCallback(
    async type => {
      const flag = await formDs.validate();
      if (!flag) {
        return;
      }
      const formData = formDs.current?.toJSONData();
      const response = await request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/2TSQwG8AA3OnXvD77gIUo39BCSYAMngfO3YDgibKIsDE`, {
        method: 'POST',
        query: { methodCode: type },
        body: formData,
      })
      if (getResponse(response)) {
        notification.success({});
        if (type === 'submit') {
          history.push({
            pathname: backPath,
          });
        } else if (response.complaintReqId) {
          setId(response.complaintReqId);
        } else {
          formDs.query();
        }
      }
    },
    [formDs, id, backPath]
  );

  const fields = useMemo(
    () => [
      {
        name: 'complaintReqNum',
        _type: 'TextField',
        disabled: true,
      },
      {
        name: 'complainRealName',
        _type: 'TextField',
        disabled: true,
      },
      {
        name: 'creationDate',
        _type: 'DateTimePicker',
        disabled: true,
      },
      {
        name: 'companyLov',
        _type: 'Lov',
      },
      {
        name: 'ouLov',
        _type: 'Lov',
      },
      {
        name: 'complainMobile',
        _type: 'TextField',
      },
      {
        name: 'complaintSubType',
        _type: 'Select',
      },
      {
        name: 'employeeLov',
        _type: 'Lov',
      },
      {
        name: 'supplierLov',
        _type: 'Lov',
      },
      {
        name: 'complainType',
        _type: 'Select',
      },
      {
        name: 'reqNum',
        _type: 'TextField',
      },
      {
        name: 'status',
        _type: 'Select',
        disabled: true,
      },
      {
        name: 'complainContent',
        _type: 'TextArea',
        colSpan: 2,
        rowSpan: 2,
      },
      {
        name: 'empty',
        _type: 'empty',
      },
      {
        name: 'empty',
        _type: 'empty',
      },
      {
        name: 'complaintDemand',
        _type: 'TextArea',
        colSpan: 2,
        rowSpan: 2,
      },
      {
        name: 'empty',
        _type: 'empty',
      },
      {
        name: 'empty',
        _type: 'empty',
      },
      {
        name: 'attachmentUuid',
        FormField: Attachment
      }
    ].filter(Boolean),
    [formDs]
  );

  const replyFields = useMemo(() => [
    {
      name: 'preOperateRealName',
      _type: 'TextField',
      disabled: true,
    },
    {
      name: 'distributeTime',
      _type: 'DateTimePicker',
      disabled: true,
    },
    {
      name: 'unitName',
      _type: 'TextField',
      disabled: true,
    },
    {
      name: 'operatedRealName',
      _type: 'TextField',
      disabled: true,
    },
    {
      name: 'operatedTime',
      _type: 'DateTimePicker',
      disabled: true,
    },
    {
      name: 'operatedMobile',
      _type: 'TextField',
      disabled: true,
    },
    {
      name: 'operatedContent',
      _type: 'TextArea',
      colSpan: 2,
      rowSpan: 2,
      disabled: true,
    }
  ], []);


  const Buttons = useMemo(
    () =>
      observer(({ dataSet }: { dataSet: DataSet }) => {
        const headerBtnLoading = dataSet.status !== 'ready';

        const buttons = [
          {
            name: 'submit',
            hidden: dataSet.current?.get('status') !== 'NEW',
            child: intl.get('hzero.common.button.sumbit').d('提交'),
            btnProps: {
              icon: 'check',
              color: 'primary',
              headerBtnLoading,
              onClick: () => handleSave('submit'),
            },
          },
          {
            name: 'save',
            hidden: dataSet.current?.get('status') !== 'NEW',
            child: intl.get('hzero.common.button.save').d('保存'),
            btnProps: {
              icon: 'save',
              funcType: 'flat',
              headerBtnLoading,
              onClick: () => handleSave('create'),
            },
          }
        ];

        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [editFlag, id]
  )

  return (
    <>
      <Header
        title={intl.get(`${intlPrompt}.view.detailTitle`).d('投诉单详情')}
        backPath={backPath}
      >
        <Buttons dataSet={formDs} />
      </Header>
      <div className={styles['detail-container']}>
        <Collapse
          ghost
          expandIconPosition="text-right"
          defaultActiveKey={['baseInfo', 'itemInfo']}
        >
          <Panel
            key="baseInfo"
            header={intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
          >
            <FormPro dataSet={formDs} columns={3} fields={fields} readOnly={!editFlag} />
          </Panel>
          {!editFlag && <Panel
            key="itemInfo"
            header={intl.get(`${intlPrompt}.view.title.replyInfo`).d('回复信息')}
          >
            <FormPro dataSet={formDs} columns={3} fields={replyFields} readOnly={!editFlag} />
          </Panel>}
        </Collapse>
      </div>
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(Detail)
);
