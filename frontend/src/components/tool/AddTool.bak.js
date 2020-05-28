import React, { useRef, useContext, useState, useReducer, useCallback } from 'react';
import { Link }                from 'react-router-dom';

import { AppContext }          from '../../AppContext';
import Input                   from '../common/Input';
import { validateMinLength, 
         validateMaxLength }   from '../common/InputValidation';
import Button                  from '../common/Button';
import WaitingSpinner          from '../common/WaitingSpinner';
import ErrorModal              from '../common/ErrorModal';

import './Tool.css'


// Executes the AddTool form validation
const formReducer = (state, action) => {
    switch(action.type) {
        
        case 'CHANGE':
            let formIsValid = true;
            for( const inputId in state.inputs) {
                if(inputId === action.inputId) {
                    formIsValid = formIsValid && action.isValid
                }
                else {
                    formIsValid = formIsValid && state.inputs[inputId].isValid;
                }
            }
            return {
                ...state,
                inputs: {
                    ...state.inputs,
                    [action.inputId]: {
                        value: action.value,
                        isValid: action.isValid
                    }
                },
                formValid: formIsValid
            };
        default:
            return state;
    }
};

const AddTool = (props) => {

    // Needed for recovering domain name and for changing app context
    // from user logout into user logged in
    const appContext = useContext(AppContext);

    // ------------------------------ STATE ---------------------------------
    // This state goes true whenever a request was sent to the 
    // backend and the response was not received yet
    const [ waiting, setWaiting ] = useState(false);

    // This state saves any error ocurred when communicating with the backend
    const [ error, setError ] = useState(null);

    // This state saves the form data (user inputs)
    const [ formState, dispatch ] = useReducer( formReducer, {
        inputs: {
            title: {
                value: '',
                isValid: false
            },
            link: {
                value: '',
                isValid: false
            },
            description: {
                value: '',
                isValid: false
            },
            tags: {
                value: '',
                isValid: false
            }
        },
        formValid: false
    });

    // Enables navigation back to '/tools/list', after Add tool is successful
    const backToToolsList = useRef();


    // ---------------------------- FUNCTIONS -------------------------------
    // This function is called by each Input component in the Signin form, as each
    // respective Input value changes, so that this value can be passed back to
    // this Signin component. 
    const getInputState = useCallback( (id, value, isValid) => {
        // Receives the parameters from each Input, as calls formReducer,
        // define above, with these parameters
        dispatch({ 
            type: 'CHANGE', 
            inputId: id, 
            value: value, 
            isValid: isValid
        });
    }, [] );

    // Function called when the user clicks the form Add tool button
    // It sends the tool inputed information to the backend
    const postAddTool = async (event) => {
        
        event.preventDefault();  // Prevents browser from reloading the page
        setWaiting(true);        // Shows waiting spinner on screen

        // converts tags field into a list of strings
        const tags = formState.inputs.tags.value.split(' ');

        // Sends POST request to the backend
        fetch( appContext.backendDomain + '/tools', {
            method: 'POST',
            headers:  { 'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + appContext.token 
                      },
            body: JSON.stringify({
                    userId:         appContext.userId,
                    title:          formState.inputs.title.value,
                    link:           formState.inputs.link.value,
                    description:    formState.inputs.description.value,
                    tags:           tags
                  }),
        }
        ).then( async (res) => {   // Received a response 2xx, 4xx, or 5xx

            const response = await res.json(); // Converts string to json object
    
            if(res.ok) {   // Status = 2xx
              
              setWaiting(false);      // Hides waiting spinner
              console.log('Added tool => ' + response );
              backToToolsList.current.click(); 
            }
            else {         // Status IS NOT 2xx

              // Forwards error message comming from backend
              // to be treated in the catch block, below
              throw new Error(response.message);
            }
        }
        ).catch( (err) => {  // Communication error or response status is not 2xx
            setWaiting(false);      // Hides waiting spinner
            console.log(err.message);
            setError(err.message);  // Shows error modal with error msg on screen  
        });

    }

    // Updates component error state
    const clearError = () => {
        setError(null);
    };
    

    // ---------------------------- RENDERING -------------------------------
    return(
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            {waiting && <WaitingSpinner asOverlay/>}
            {!waiting && (
            <form className='tool-form' onSubmit={postAddTool}>
                <h2>+ Add new tool</h2>
                <hr />
                <Input
                    id='title' 
                    element='input' 
                    type='text' 
                    label='Tool name'
                    validationList={[ validateMinLength(1) ]}
                    errorMsg='The tool name is invalid. Please, type a valid name.'
                    getState={getInputState}
                />
                <Input
                    id='link' 
                    element='input' 
                    type='text' 
                    label='Tool link'
                    validationList={[ validateMinLength(5) ]}
                    errorMsg='The tool link is invalid. Please, type a valid link.'
                    getState={getInputState}
                />
                <Input
                    id='description' 
                    element='textarea'
                    rows={7}
                    type='text' 
                    label='Tool description'
                    validationList={[ validateMinLength(1), validateMaxLength(1024) ]}
                    errorMsg='The tool description is invalid. Please, type a valid description.'
                    getState={getInputState}
                />
                <Input
                    id='tags'
                    element='input' 
                    type='text' 
                    label='Tags'
                    validationList={[ validateMinLength(1) ]}
                    errorMsg='The tool tag(s) is(are) invalid. Please, type a valid tag(s).'
                    getState={getInputState}
                />
                <Button type='submit' size='small' disabled={!formState.formValid}>
                    Add tool
                </Button>
                <Button 
                    to='/tools/list' 
                    type='button'
                    size='small'
                >
                    Cancel
                </Button>
                <Link     // This link is invisible and used to navigate back to /teachapp screen
                    to='/tools/list'
                    ref={backToToolsList}>
                </Link>
            </form>
            )}
        </React.Fragment>
    );
}


export default  AddTool;