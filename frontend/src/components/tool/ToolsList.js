import React, { useContext, useState, useEffect } from 'react';

import { AppContext }  from '../../AppContext';
import Panel           from '../common/Panel';
import Button          from '../common/Button';
import WaitingSpinner  from '../common/WaitingSpinner';
import AddTool         from './AddTool';
import ErrorModal      from '../common/ErrorModal';
import DeleteModal     from '../common/DeleteModal';
import ToolItem        from './ToolItem';
import './ToolsList.css';


const ToolsList = props => {
  
  // Needed for recovering domain name and user id
  const appContext = useContext(AppContext);

  // ------------------------------ STATE ---------------------------------
  // This state goes true whenever a request was sent to the 
  // backend and the response was not received yet
  const [ waiting, setWaiting ] = useState(false);

  // This state saves any error ocurred when communicating with the backend
  const [ error, setError ] = useState('');

  // This state saves the content typed in the tag_input
  const [ tag, setTag ] = useState('');

  // This state saves true if tag must be used for filtering tools, or false otherwise
  const [ usetag, setUsetag ] = useState(false);

  // This state saves the tools list read from the database
  const [ tools, setTools ] = useState([]);

  // This state saves the tool id to be removed
  const [ removeId, setRemoveId ] = useState('');

  // This state saves the tool title to be removed
  const [ removeTitle, setRemoveTitle ] = useState('');

  // This state goes true if AddTool form is being edited
  const [ addTool, setAddTool ] = useState(false);


  // ---------------------------- FUNCTIONS -------------------------------
  // Calls getAllTools when the component is loaded       
  useEffect( () => { getUserAllTools(); }, [] );

  // Called whenever tag_input values changes
  const treatTagInputChange = async (event) => { setTag(event.target.value); }

  // Called whenever the check mark changes on the checkbox element
  // If the mark is checked, calls getToolsById to read all the tools
  // from the database that have the specified tag, if any.
  // Else, just reads all tools from the database
  const treatUseTagChange = async (event) => {
    const checked = event.target.checked;
    setUsetag(checked);
    if(checked && (tag !== '')) { getUserToolsByTag(tag); }  // If check mark was checked, filters tools by tag
    else                        { getUserAllTools();      }  // Else, reads all tools
  }

  // Fetches the backend for all tools in the database       
  const getUserAllTools = async () => {

    setWaiting(true); // Shows waiting spinner on screen

    // Sends GET request to backend
    fetch( appContext.backendDomain + '/tools/all/' + appContext.userId, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + appContext.token }
    }
    ).then( async (res) => {   // Received a response 2xx, 4xx, or 5xx

        const response = await res.json(); 

        if( res.ok ) {  // status code = 2xx
          setWaiting(false);        // Hides waiting spinner
          setTools(response);       // Saves tools list in ToolsList state
        }
        else {          // status code IS NOT 2xx

          // Forwards error message comming from backend
          // to be treated in the catch block, below
          throw new Error(response.message);
        }
    }
    ).catch( (err) => {  // Communication error or response status is not 2xx
        setWaiting(false);      // Hides waiting spinner
        setError(err.message);  // Shows error modal with error msg on screen  
    });

  }
  
  // Reads all tools that have the specified tag from database, if any
  // Considers parameter tag was already validated
  const getUserToolsByTag = async (tag) => {

    setWaiting(true); // Shows waiting spinner on screen

    // Sends GET request to backend
    fetch( 
        appContext.backendDomain + '/tools?tag=' + tag + '&userId=' + appContext.userId, { 
        method: 'GET',
        headers: { Authorization: 'Bearer ' + appContext.token }
    }
    ).then( async (res) => {   // Received a response 2xx, 4xx, or 5xx

        const response = await res.json(); // Converts string to json object

        if(res.ok) {   // Status = 2xx
          setWaiting(false);      // Hides waiting spinner
          setTools(response);     // Saves tools list in ToolsList state
        }
        else {         // Status IS NOT 2xx

          // Forwards error message comming from backend
          // to be treated in the catch block, below
          throw new Error(response.message);
        }
    }
    ).catch( (err) => {  // Communication error or response status is not 2xx
        setWaiting(false);      // Hides waiting spinner
        setError(err.message);  // Shows error modal with error msg on screen  
    });
  }

  // This function is passed as parameter to each ToolItem to return 
  // the tool id and title, when the user clicks the 'x remove' button
  const getToolData = (id, title) => {
    // The following code sets react to rerender page and show remove Modal
    setRemoveId(id);
    setRemoveTitle(title);
  }

  const removeTool = async (id) => {

    setWaiting(true); // Shows waiting spinner on screen

    // Sends GET request to backend
    fetch( appContext.backendDomain + '/tools/' + id, {
        method: 'DELETE', 
        headers: { Authorization: 'Bearer ' + appContext.token }
    }
    ).then( async (res) => {   // Received a response 2xx, 4xx, or 5xx

        if(res.ok) {   // Status = 2xx
          const toolsList = tools;
          const toolIndexToRemove = toolsList.findIndex( (tool) => { return(tool.id === id)} );
          delete toolsList[toolIndexToRemove];
          setTools(toolsList);

          setWaiting(false);   // Hides waiting spinner
        }
        else {         // Status IS NOT 2xx

          const response = await res.json(); // Converts string to json object
          // Forwards error message comming from backend
          // to be treated in the catch block, below
          throw new Error(response.message);
        }
    }
    ).catch( (err) => {  // Communication error or response status is not 2xx
        setWaiting(false);      // Hides waiting spinner
        setError(err.message);  // Shows error modal with error msg on screen  
    });
  }  

  // Clears the error modal
  const clearError = () => {
    setError('');
  };    

  // Clears the remove modal
  const clearRemove = () => {
    setRemoveId('');
    setRemoveTitle('');
  };    

  // Clears the AddTool modal
  const clearAddTool = () => {
    setAddTool(false);
  };    


  // ---------------------------- RENDERING -------------------------------
  return (
    <React.Fragment>
      <DeleteModal   // Shows the modal that asks for removal confirmation
        header='Remove Tool!'
        name={removeTitle} 
        onCancel={clearRemove} 
        onConfirm={() => { 
          // clearRemove deletes removeId, but has to be called before removeTool
          // This assignment ensures the toolId is passed correctly to removeTool
          const toolId = removeId;  
          clearRemove();
          removeTool(toolId); 
        }} 
      />
      <ErrorModal    // Shows the Error modal
        error={error} 
        onClear={clearError}
      />
      {addTool && (  // Shows the Add Tool component 
        <AddTool
          onCancel={clearAddTool} 
          onConfirm={ (newTool) => {
            if(!!newTool) {
              const toolsList = tools;
              toolsList.push(newTool);
              setTools(toolsList);
              setAddTool(false);
            }
          }}
        />
      )}
      {waiting && (  // Shows the waiting spinner
        <div className="center">
          <WaitingSpinner asOverlay='true'/>
        </div>
      )}
      { // Renders the content of the ToolsList component
        !removeId && !waiting && !addTool && (   
        <div>
          <div className='tools-list-header'>
            <br></br>
            <h1>VUTTR</h1>
            <h2>Very Useful Tools to Remember</h2>
          </div>
          <Panel>
            <input 
              id='tag_input'
              style={{fontSize:'16px'}}
              value={tag} 
              onChange={treatTagInputChange}
            />
            <div className='use-tag-div'>
              <input 
                id='use_tag' 
                type='checkbox' 
                name='use_tag' 
                checked={usetag} 
                onChange={treatUseTagChange}
              />
              <label style={{color:'black'}} htmlFor='use_tag'> 
                Search in tags only
              </label>
            </div>
            <Button size='small' float='right' onClick={ () => { setAddTool(true); }}>+ Add</Button>
          </Panel>
          {(tools.length>0) && (
            <div  className='tools-list'>
              {tools.map( tool => {
                return(
                  <ToolItem
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    link={tool.link}
                    description={tool.description}
                    tags={tool.tags}
                    onRemove={getToolData}
                  />
                )
              })}
            </div>
          )}
          {(tools.length===0) && (
            <div style={{textAlign: 'center'}}>
              <br></br>
              <h4>No tools to show</h4>
            </div>  
          )}
        </div>
      )}
    </React.Fragment>
  );
};


export default ToolsList;
