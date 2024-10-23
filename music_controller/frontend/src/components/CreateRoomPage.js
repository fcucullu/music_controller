import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@material-ui/core";

export default class CreateRoomPage extends Component {
  defaultVotes = 2;

  constructor(props) {
    super(props);
    this.state = {
      guestCanPause: true,
      votesToSkip: this.defaultVotes,
    };

    this._handleRoomButtonPressed = this._handleRoomButtonPressed.bind(this);
    this._handleVotesChange = this._handleVotesChange.bind(this);
    this._handleGuestCanPauseChange =
      this._handleGuestCanPauseChange.bind(this);
  }

  _handleVotesChange(e) {
    this.setState({
      votesToSkip: e.target.value,
    });
  }

  _handleGuestCanPauseChange(e) {
    this.setState({
      guestCanPause: e.target.value === "true" ? true : false,
    });
  }

  _handleRoomButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
      }),
    };
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.history.push("/room/" + data.code));
  }

  render() {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <Typography component="h4" variant="h4">
            Create A Room
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormHelperText>
              <span align="center">Guest control of playback state</span>
            </FormHelperText>
            <RadioGroup
              row
              defaultValue="true"
              onChange={this._handleGuestCanPauseChange}
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
        <Grid item xs={12}>
          <FormControl>
            <TextField
              required={true}
              type="number"
              onChange={this._handleVotesChange}
              defaultValue={this.defaultVotes}
              inputProps={{ min: 1, style: { textAlign: "center" } }}
            />
            <FormHelperText>
              <span>Votes required to skip song</span>
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            onClick={this._handleRoomButtonPressed}
          >
            Create a room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}
