import * as React from 'react'
import * as ReactDOM from "react-dom"

import Amplify, { Auth, Analytics } from 'aws-amplify'
import * as awsconfig from './aws-exports'

Auth.configure(awsconfig);
Analytics.configure(awsconfig);
Amplify.configure(awsconfig);

import {  SignIn } from './Authentication'

ReactDOM.render(<SignIn />, document.getElementById('root'))