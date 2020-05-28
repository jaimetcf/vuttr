import React           from 'react';

import Button          from '../common/Button';
import ListItem        from '../common/ListItem';
import './ToolItem.css';


const ToolItem = (props) => {

  // ---------------------------- RENDERING -------------------------------
  return (
    <div className="tool-item">
      <ListItem className="tool-item__content">
        <div className="tool-item__info">
          <Button size='big' background='transparent' color='blue' href={props.link}>{props.title}</Button>
          <Button background='transparent' 
                  size='small'
                  float='right'
                  color='black' 
                  onClick={ () => { props.onRemove(props.id, props.title); } }
          >
            X remove
          </Button>
          <p></p>
          <div style={{padding: '1rem'}}>
            <h3>{props.description}</h3>
            <h4>
              {props.tags.map( (tag) => {
                return(<p style={{display: 'inline'}}>{'  ' + tag}</p>)
              })}
            </h4>
          </div>
        </div>
      </ListItem>
    </div>
  );
};

export default ToolItem;
