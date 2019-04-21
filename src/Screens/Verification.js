/* eslint-disable react/no-unused-state */
/* eslint-disable no-console */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { parse } from 'query-string';
import {
  Grid, withStyles, CircularProgress, Snackbar, SnackbarContent,
} from '@material-ui/core';
import * as Promise from 'bluebird';
import api from 'Services/Api';

import { AuthContext } from 'Authentication/AuthContext';

import { verifyEmail } from 'Services/RegistrationAPI';

import CenterPaper from 'components/layout/CenterPaper';

const styles = theme => ({
  root: {
    padding: '10vh 10vw',
    marginTop: '15vh',
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
  danger: {
    backgroundColor: 'hsl(355, 70%, 46%)',
  },
});

class Verification extends Component {
  static propTypes = {
    classes: PropTypes.shape({
      root: PropTypes.string.isRequired,
      progress: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextType = AuthContext;

  state = {
    isRequesting: true,
    isRedirecting: false,
    gotProfileToken: false,
    gotProfileId: false,
    firstToken: '',
    error: '',
  };

  async componentDidMount() {
    const { location } = this.props;
    const parsed = parse(location.search);
    const { token, user_id } = parsed;
    this.setState({ firstToken: token });

    const { setProfileToken, setUserId } = this.context;

    await api.urlencodedInstance();
    const result = await verifyEmail(user_id, token);

    if (result.status === 200) {
      this.setState({
        isRequesting: false,
      });
      api.authInstance(result.data.token);
      await Promise.delay(4000);
      this.setState({
        gotProfileId: true,
      });
      setUserId(user_id);
      await Promise.delay(7000);
      this.setState({
        gotProfileToken: true,
      });
      setProfileToken(result.data.token);
      await Promise.delay(10000);
      this.setState({
        isRedirecting: true,
      });
    } else {
      this.setState({ error: result });
    }
  }

  render() {
    const {
      isRedirecting, gotProfileToken, gotProfileId, firstToken, error,
    } = this.state;
    const { classes } = this.props;

    let loading;

    if (!isRedirecting) {
      loading = 'Please wait while we verify your email.';
    }

    if (gotProfileId) {
      loading = 'Retrieving email information. Please wait.';
    }

    if (gotProfileToken) {
      loading = 'Email processed. Redirecting you in a moment.';
    }

    if (isRedirecting) {
      return <Redirect to={`/confirm-password/${firstToken}`} />;
    }

    return (
      <CenterPaper>
        <Grid item>
          <div>
            <h3>{loading}</h3>
            <div style={{ margin: 'auto', width: '74px' }}>
              <CircularProgress
                className={classes.progress}
                color="secondary"
              />
            </div>
          </div>
        </Grid>
        {
          error
            ? (
              <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open
                ContentProps={{
                  'aria-describedby': 'message-id',
                }}
              >
                <SnackbarContent
                  className={classes.danger}
                  message={<span id="message-id">{error}</span>}
                />
              </Snackbar>
            )
            : null
        }
      </CenterPaper>
    );
  }
}

export default withStyles(styles)(Verification);
