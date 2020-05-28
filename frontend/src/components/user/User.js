import React, { useContext, useState, useReducer, useCallback } from 'react';

import { AppContext }  from '../../AppContext';
import Input           from '../common/Input';
import {validate,
        validateMinLength, 
        validateEmail} from '../common/InputValidation';
import Button          from '../common/Button';
import WaitingSpinner  from '../common/WaitingSpinner';
import ErrorModal      from '../common/ErrorModal';

import './User.css';


// Executes the Signup form validation
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

const User = (props) => {

    // Needed for recovering domain name and for managing authentication and authorization
    const appContext = useContext(AppContext);

    // ------------------------------ STATE ---------------------------------
    // This state goes true whenever a request was sent to the 
    // backend and the response was not received yet
    const [ waiting, setWaiting ] = useState(false);

    // This state saves any error ocurred when communicating with the backend
    const [ error, setError ] = useState('');

    // true if user will login, false if user will signup
    const [ isLogin, setIsLogin ] = useState(true);

    // This state saves the form data (user inputs)
    const [ formState, dispatch ] = useReducer( formReducer, {
        inputs: {
            name: {
                value: '',
                isValid: true
            },
            email: {
                value: '',
                isValid: false
            },
            password: {
                value: '',
                isValid: false
            }
        },
        formValid: false
    });

    // ---------------------------- FUNCTIONS -------------------------------
    // This function is called by each Input component in the User form, as each
    // respective Input value changes, so that this value can be passed back to
    // this User component. 
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

    // This function sends the /users/login or /users/signup request to the backend
    const postUser = async (event) => {
        
        event.preventDefault();  // Prevents browser from reloading the page
        setWaiting(true);        // Shows waiting spinner on screen

        const body = (isLogin? 
            JSON.stringify({
                email:    formState.inputs.email.value,
                password: formState.inputs.password.value }) : 
            JSON.stringify({
                name:     formState.inputs.name.value,
                email:    formState.inputs.email.value,
                password: formState.inputs.password.value 
            })
        )

        // Sends POST request to the backend
        fetch( appContext.backendDomain + (isLogin? '/users/login' : '/users/signup'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        })
        .then( async (res) => {   // Received a response 2xx, 4xx, or 5xx

            const response = await res.json(); // Converts string to json object
    
            if(res.ok) {   // Status = 2xx
              
              setWaiting(false);      // Hides waiting spinner

              console.log('user id:   ' + response.userId );
              console.log('user name: ' + response.name );
              console.log('user token:' + response.token );

              // Confirms user login and saves user data in appContext
              appContext.loginFun(response.userId, response.name, response.token );
            }
            else {         // Status IS NOT 2xx

              // Forwards error message comming from backend
              // to be treated in the catch block, below
              throw new Error(response.message);
            }
        })
        .catch( (err) => {  // Communication error or response status is not 2xx
            setWaiting(false);      // Hides waiting spinner
            console.log(err.message);
            setError(err.message);  // Shows error modal with error msg on screen  
        });
    }

    // Changes from Login to Sign up, and from it back to Login.
    const toggleMode = () => {
        if(isLogin) {  
            // Changing to Sign up
            dispatch({ 
                type: 'CHANGE', 
                inputId: 'name', 
                value: formState.inputs.name.value, 
                isValid: validate(formState.inputs.name.value, [validateMinLength(1)] )
            });
            setIsLogin(false);
        }
        else {   
            // Changing to login
            dispatch({ 
                type: 'CHANGE', 
                inputId: 'name', 
                value: formState.inputs.name.value, 
                isValid: true
            });
            setIsLogin(true);
        }
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
            <form className='user-form' onSubmit={postUser}>
                <h2>{(isLogin? 'Login required' : 'Sign up required')}</h2>
                <hr />
                {!isLogin && (
                <Input
                    id='name' 
                    element='input' 
                    type='text' 
                    label='Name'
                    validationList={[ validateMinLength(1) ]}
                    errorMsg='Name is empty. Please, type a name.'
                    getState={getInputState}
                />
                )}
                <Input
                    id='email' 
                    element='input' 
                    type='text' 
                    label='E-mail'
                    validationList={[ validateEmail() ]}
                    errorMsg='The e-mail address is invalid. Please, type a valid e-mail address.'
                    getState={getInputState}
                />
                <Input
                    id='password' 
                    element='input' 
                    type='password' 
                    label='Password'
                    validationList={[ validateMinLength(6) ]}
                    errorMsg='The password has less than 6 characteres. Please, type a password with 6 characteres or more.'
                    getState={getInputState}
                />
                <Button type='submit' size='small' disabled={!formState.formValid}>
                    {isLogin ? 'Login' : 'Sign up'}
                </Button>
                <Button type='button' size='small' inverse onClick={toggleMode}>
                    Switch to {isLogin ? 'Sign up' : 'Login'}
                </Button>
            </form>
            )}
        </React.Fragment>
    );
}


export default  User;