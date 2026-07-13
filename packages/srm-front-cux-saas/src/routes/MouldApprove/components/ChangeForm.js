import React from 'react';
import { Form, Lov, TextArea, Select } from 'choerodon-ui/pro';
import styles from '../index.less';

const ChangeForm = ({ maChangeFormDs, type, disabled }) => {
  // const [changeId, setChangeId] = useState();

  // useEffect(() => {
  //   Promise.all([maChangeFormDs.query()]).then(res => {
  //     if (res && res[0] && res[0].changeId) {
  //       setChangeId(res[0].changeId);
  //     }
  //   });
  //   console.log('changeId:', changeId);
  // }, []);

  return (
    <Form
      dataSet={maChangeFormDs}
      columns={2}
      labelLayout="float"
      useColon={false}
      className={styles.changeForm}
    >
      {type === 'transfer' && (
        <>
          <Select colSpan={1} name="supplierFlag" disabled={disabled} />
          <Lov colSpan={1} name="supplierLov" disabled={disabled} />
        </>
      )}
      <TextArea colSpan={2} name="reason" disabled={disabled} />
    </Form>
  );
};

export default ChangeForm;
