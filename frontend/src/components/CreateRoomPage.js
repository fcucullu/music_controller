import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Collapse } from "@material-ui/core";
import Alert from "@mui/material/Alert";

export default class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallback: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      errorMsg: "",
      successMsg: "",
    };
  }

  handleVotesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      this.setState({ votesToSkip: value });
    }
  };

  handleGuestCanPauseChange = (e) => {
    this.setState({
      guestCanPause: e.target.value === "true",
    });
  };

  handleRoomButtonPressed = async () => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votes_to_skip: this.state.votesToSkip,
          guest_can_pause: this.state.guestCanPause,
        }),
      };
      const response = await fetch("/api/create-room", requestOptions);
      if (!response.ok) throw new Error("Failed to create room");
      const data = await response.json();
      this.props.history.push("/room/" + data.code);
    } catch (error) {
      this.setState({ errorMsg: error.message, successMsg: "" });
    }
  };

  handleUpdateButtonPressed = async () => {
    try {
      const requestOptions = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votes_to_skip: this.state.votesToSkip,
          guest_can_pause: this.state.guestCanPause,
          code: this.props.roomCode,
        }),
      };
      const response = await fetch("/api/update-room", requestOptions);
      if (!response.ok) throw new Error("Error updating room...");
      this.setState({ successMsg: "Room updated successfully!", errorMsg: "" });
      this.props.updateCallback();
    } catch (error) {
      this.setState({ errorMsg: error.message, successMsg: "" });
    }
  };

  renderAlert() {
    const { errorMsg, successMsg } = this.state;
    if (errorMsg || successMsg) {
      return (
        <Alert
          severity={successMsg ? "success" : "error"}
          onClose={() => this.setState({ errorMsg: "", successMsg: "" })}
        >
          {successMsg || errorMsg}
        </Alert>
      );
    }
    return null;
  }

  renderCreateButtons() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleRoomButtonPressed}
          >
            Create A Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderUpdateButtons() {
    return (
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={this.handleUpdateButtonPressed}
        >
          Update Room
        </Button>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? "Update Room" : "Create a Room";

    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Collapse in={!!this.state.errorMsg || !!this.state.successMsg}>
            <div style={{ width: "50%", margin: "0 auto" }}>
              {this.renderAlert()}
            </div>
          </Collapse>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText style={{ textAlign: "center", fontSize: "18px" }}>
              Guest Control Play/Pause?
            </FormHelperText>

            <RadioGroup
              row
              value={this.state.guestCanPause.toString()}
              onChange={this.handleGuestCanPauseChange}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play/Pause"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
          align="center"
        >
          <FormControl component="fieldset">
            <FormHelperText style={{ textAlign: "center", fontSize: "18px" }}>
              Votes Required To Skip Song
            </FormHelperText>

            <RadioGroup
              row
              value={this.state.votesToSkip.toString()}
              onChange={this.handleVotesChange}
            >
              <FormControlLabel
                value="1"
                control={<Radio color="primary" />}
                label="1"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="2"
                control={<Radio color="primary" />}
                label="2"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="3"
                control={<Radio color="primary" />}
                label="3"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {this.props.update
          ? this.renderUpdateButtons()
          : this.renderCreateButtons()}
      </Grid>
    );
  }
}
