import React from 'react';

import Modal  from './Modal';
import Button from './Button';


const DeleteModal = props => {
  return (
    <Modal
      onCancel={props.onCancel}
      header={props.header}
      show={!!props.name}
      footer={
        <div>
            <Button inverse onClick={props.onCancel}>Cancel</Button>
            <Button danger onClick={props.onConfirm}>Yes, remove</Button>
        </div>
      }
    >
      <p>{'Are you sure you want to remove ' + props.name + '?'}</p>
    </Modal>
  );
};


export default  DeleteModal;