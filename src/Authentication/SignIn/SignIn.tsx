/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as React from 'react';
import './SignIn.scss';
import { Button, Row, Col, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { Auth, Logger, JS } from 'aws-amplify';
import { withFederated } from 'aws-amplify-react';

const logger = new Logger('Sign In');

const FederatedButtons = (props) => (
  <Row>
    <Col>
      <Button className={s.facebook} onClick={props.facebookSignIn}>Facebook</Button>
      <Button className={s.google} onClick={props.googleSignIn}>Google</Button>
      <Button className={s.twitter} onClick={props.twitterSignIn}>Twitter</Button>
    </Col>
  </Row>
);

const Federated = withFederated(FederatedButtons);

const federated_data = {
    google_client_id: '',
    facebook_app_id: '',
    amazon_client_id: ''
};

class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.checkContact = this.checkContact.bind(this);
    this.changeState = this.changeState.bind(this);
    this.inputs = {};
    this.state = { error: '' }
  }

  changeState(state, data) {
    const { onStateChange } = this.props;
    if (onStateChange) {
      onStateChange(state, data);
    }
  }

  signIn() {
    const { username, password } = this.inputs;
    logger.info('sign in with ' + username);
    Auth.signIn(username, password)
      .then(user => this.signInSuccess(user))
      .catch(err => this.signInError(err));
  }

  signInSuccess(user) {
    logger.info('sign in success', user);
    this.setState({ error: '' });

    // There are other sign in challenges we don't cover here.
    // SMS_MFA, SOFTWARE_TOKEN_MFA, NEW_PASSWORD_REQUIRED, MFA_SETUP ...
    if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
      this.changeState('confirmSignIn', user);
    } else {
      this.checkContact(user);
    }
  }

  signInError(err) {
    logger.info('sign in error', err);
    /*
      err can be in different structure:
        1) plain text message;
        2) object { code: ..., message: ..., name: ... }
    */
    this.setState({ error: err.message || err });
  }

  checkContact(user) {
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

    const { authState, authData } = this.props;
    if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }
    const { error } = this.state;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{this.props.title}</h1>
          <p className={s.lead}>
            Log in with your username or company email address.
          </p>
          <Federated federated={federated_data} onStateChange={this.changeState} />
          <strong className={s.lineThrough}>OR</strong>
          <Form>
            <FormGroup className={s.formGroup}>
              <Label className={s.label}>Username or email address</Label>
              <Input className={s.input} type="text" placeholder="Username or email address" defaultValue={authData || '' } onChange={event => this.inputs.username = event.target.value} autoFocus />
            </FormGroup>
            <FormGroup className={s.formGroup}>
              <Label className={s.label}>Password</Label>
              <Input className={s.input} type="password" placeholder="Password" onChange={event => this.inputs.password = event.target.value} autoFocus />
            </FormGroup>
            <Row>
              <Col>
                New to us?{' '}
                <Button className={s.button} onClick={() => this.changeState('signUp')}>
                  Sign Up
                </Button>
              </Col>
              <Col>
                <Button className={s.button} onClick={() => this.changeState('forgotPassword')}>
                  Forgot Password
                </Button>
              </Col>
            </Row>
            <Button className={s.button} onClick={this.signIn}>
              Sign in
            </Button>
            { error && <Alert warning text="left" color="danger">{error}</Alert> }
          </Form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(SignIn);
