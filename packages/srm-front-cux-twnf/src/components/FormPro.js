import React from 'react';
import {
  Form,
  Lov,
  Output,
  Select,
  Switch,
  TextArea,
  TextField,
  DatePicker,
  DateTimePicker,
  NumberField,
  Attachment,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const fieldMap = {
  Lov,
  Select,
  Switch,
  TextArea,
  TextField,
  DatePicker,
  DateTimePicker,
  NumberField,
  Attachment,
};

function FormPro(props) {
  const {
    readOnly,
    customizeCode,
    customizeForm,
    customizeOptions = {},
    fields = [],
    ...formProps
  } = props;
  const form = (
    <Form
      key={`form-${readOnly}`} // 解决readOnly改变后，表单渲染不生效的问题
      labelLayout={readOnly ? 'vertical' : 'float'}
      className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
      {...formProps}
    >
      {fields.reduce((mapFields, curField) => {
        const {
          show,
          _type,
          name,
          label,
          rowSpan,
          colSpan,
          modalTitle,
          FormField,
          renderer,
          ...editorProps
        } = curField;

        // 动态控制字段显示隐藏
        const dynamicShow =
          typeof show === 'function'
            ? show({ record: formProps.dataSet.current, dataSet: formProps.dataSet })
            : show;
        // 不存在show属性或结果为true时渲染该表单字段
        if (!('show' in curField) || dynamicShow) {
          const formFieldProps = {
            name,
            rowSpan,
            colSpan,
          };
          if ('label' in curField) formFieldProps.label = label;
          if (_type === 'empty') {
            mapFields.push(<Output style={{ display: 'none' }} />);
          } else {
            const ResField = FormField || fieldMap[_type] || TextField;
            const jsxRender = readOnly ? (
              <Output {...formFieldProps} renderer={renderer} />
            ) : (
              <ResField
                {...formFieldProps}
                {...editorProps}
                modalProps={{ title: modalTitle || label }}
              />
            );
            mapFields.push(jsxRender);
          }
        }
        return mapFields;
      }, [])}
    </Form>
  );
  return customizeForm && customizeCode
    ? customizeForm({ code: customizeCode, enableEmpty: true, ...customizeOptions }, form)
    : form;
}

export default observer(FormPro);
