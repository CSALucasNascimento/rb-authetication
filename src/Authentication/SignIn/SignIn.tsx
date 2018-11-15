import * as React from 'react';
import './SignIn.scss';
import { Auth, Logger, JS } from 'aws-amplify';
import { withFederated }  from 'aws-amplify-react';

const logger = new Logger('Sign In');

// const federated_data = {
//     google_client_id: '',
//     facebook_app_id: '',
//     amazon_client_id: ''
// };

interface State {
  error: string | null,
  username: string,
  password: string
}


class SignIn extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = this.getInitialState()
  }

  getInitialState = () => ({
    error: '',
    username: '',
    password: ''
  })

  public signIn = (event: any) : void => {
    
    event.preventDefault();

    logger.info('sign in with ' + this.state.username);
    Auth.signIn(this.state.username, this.state.password)
      .then(user => {
        console.log(user)
        this.signInSuccess(user)
      })
      .catch(err => {
        console.log(err)
        this.signInError(err.message)
      });
  }
  
  signInSuccess = (user: any) => {
    logger.info('sign in success', user);
    this.setState({ error: '' });
    // if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
    //   this.changeState('confirmSignIn', user);
    // } else {
    //   this.checkContact(user);
    // }
  }

  signInError = (err: string) => {
    logger.info('sign in error', err);
    this.setState({ error: err || err });
  }

  public handleChange = (event: any) => {    
    const { target: { value, name } } = event;
    this.setState({ ...this.state, [name]: value });
  }
  

  checkContact(user: any) {
    Auth.verifiedContact(user)
      .then(data => {
        if (!JS.isEmpty(data.verified)) {
          console.log(user)
          //this.changeState('signedIn', user);
        } else {
          user = Object.assign(user, data);
          console.log(user)
          //this.changeState('verifyContact', user);
        }
      });
  }

  render() {
    
    const { error } = this.state;

    return (
      <div className={`root`}>
        <div className={`container`}>
          <h1>Login Component</h1>
          <p className={`lead`}>
            Log in with your username or company email address.
          </p>
          {/* <Federated federated={federated_data} onStateChange={this.changeState} /> */}
          <strong className={`lineThrough`}>OR</strong>
            <div className={`formGroup form-group`}>
              <label className={`label`}>Username or email address</label>
              <input className={`input form-control`} type="text" name={`username`} placeholder="Username or email address" onChange={e => this.handleChange(e)}  autoFocus />
            </div>
            <div className={`formGroup form-group`}>
              <label className={`label`}>Password</label>
              <input className={`input form-control`} type="password" name={`password`} placeholder="Password" onChange={e => this.handleChange(e)} autoFocus />
            </div>
            <button className={`button`} onClick={e => this.signIn(e) }>
              Sign in
            </button>
            { error && <div className={`alert alert-danger`} role="alert">{error}</div>}
        </div>
      </div>
    );
  }
}

export default SignIn
