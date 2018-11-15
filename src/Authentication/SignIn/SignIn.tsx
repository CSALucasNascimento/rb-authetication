import * as React from 'react';
import './SignIn.scss';
import { Auth, Logger, JS } from 'aws-amplify';
import { withFederated }  from 'aws-amplify-react';

const logger = new Logger('Sign In');

// const FederatedButtons = (props) => (
//   <Row>
//     <Col>
//       <Button className={s.facebook} onClick={props.facebookSignIn}>Facebook</Button>
//       <Button className={s.google} onClick={props.googleSignIn}>Google</Button>
//       <Button className={s.twitter} onClick={props.twitterSignIn}>Twitter</Button>
//     </Col>
//   </Row>
// );

// const Federated = withFederated(FederatedButtons);

const federated_data = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};


export interface Props {
  user: any,
  authState: any,
  authData: any,
  username: string,
  password: string,
  title: string
}

interface State {
  error: string,
  username: string,
  password: string
}


class SignIn extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = this.getInitialState()
  }

  getInitialState = () => ({
    error: '',
    username: '',
    password: ''
  })

  signIn = (username: string, password?: string) => {
    logger.info('sign in with ' + username);
    Auth.signIn(username, password)
      .then(user => this.signInSuccess(user))
      .catch(err => this.signInError(err.message));
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

  handleChange = (field:any, event:any) => {
    const { target: { value } } = event;
    this.setState({ [field]: value });
  }
  

  checkContact(user: any) {
    Auth.verifiedContact(user)
      .then(data => {
        if (!JS.isEmpty(data.verified)) {
          this.changeState('signedIn', user);
        } else {
          user = Object.assign(user, data);
          this.changeState('verifyContact', user);
        }
      });
  }

  render() {

    const { authState, authData, title } = this.props;
    if (!['signIn'].includes(authState)) { return null; }
    
    const { error, username, password } = this.state;

    return (
      <div className={`root`}>
        <div className={`container`}>
          <h1>{title}</h1>
          <p className={`lead`}>
            Log in with your username or company email address.
          </p>
          {/* <Federated federated={federated_data} onStateChange={this.changeState} /> */}
          <strong className={`lineThrough`}>OR</strong>
          <form>
            <div className={`formGroup form-group`}>
              <label className={`label`}>Username or email address</label>
              <input className={`input form-control`} type="text" placeholder="Username or email address" defaultValue={authData || '' } onChange={() => this.handleChange(this, `username`)}  autoFocus />
            </div>
            <div className={`formGroup form-group`}>
              <label className={`label`}>Password</label>
              <input className={`input form-control`} type="password" placeholder="Password" onChange={() => this.handleChange(this, `password`)} autoFocus />
            </div>
            <button className={`button`} onClick={() => this.signIn}>
              Sign in
            </button>
            { error && <div className={`alert alert-danger`} role="alert">{error}</div>}
          </form>
        </div>
      </div>
    );
  }
}

export default (SignIn);
