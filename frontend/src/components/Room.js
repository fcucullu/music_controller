import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import Playlist from "./Playlist";
import AddSong from "./AddSong"

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      showPlaylist: false,
      showAddSong: false,
      spotifyAuthenticated: false,
      song: {},
    };
    this.roomCode = this.props.match.params.roomCode;
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.addSongButtonPressed = this.addSongButtonPressed.bind(this);
    this.playlistButtonPressed = this.playlistButtonPressed.bind(this);

    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.updateShowPlaylist = this.updateShowPlaylist.bind(this);
    this.updateShowAddSong = this.updateShowAddSong.bind(this);

    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);

    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
    this.getRoomDetails();
  }

  componentDidMount() {
    this.interval = setInterval(this.getCurrentSong, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    return fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ song: data });
      });
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      this.props.leaveRoomCallback();
      this.props.history.push("/");
    });
  }


  //############### ADDSONG SECTION ##########################
  addSongButtonPressed() {
    this.updateShowAddSong(true);
  }

  renderAddSong() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Room Code: {this.roomCode}
          </Typography>
        </Grid>
        <MusicPlayer {...this.state.song} />

        <AddSong />

        <Grid
          item
          xs={12}
          style={{
            display: "flex", // Apply flex here to the Grid container
            justifyContent: "center", // Center the buttons
            gap: "10px", // Space between buttons
            paddingBottom: '10px'
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowAddSong(false)}
          >
            Go back
          </Button>

          <Button
            variant="contained"
            color="primary"
            //onClick=()
          >
            Search
          </Button>
        </Grid>
      </Grid>
    );
  }

  updateShowAddSong(value) {
    this.setState({
      showAddSong: value,
    });
  }

  //############### PLAYLIST SECTION ##########################
  playlistButtonPressed() {
    this.updateShowPlaylist(true);
  }

  renderPlaylist() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Room Code: {this.roomCode}
          </Typography>
        </Grid>
        <MusicPlayer {...this.state.song} />

        <Grid
          item
          xs={12}
          style={{
            display: "flex", // Apply flex here to the Grid container
            justifyContent: "center", // Center the buttons
            gap: "10px", // Space between buttons
            paddingBottom: "10px",
            paddingTop: "10px",
          }}
        >
          <Button
            variant="contained"
            style={{ backgroundColor: "#23A6D5", color: "#fff" }}
            onClick={() => this.updateShowPlaylist(false)} // Close Playlist
          >
            Close Playlist
          </Button>

          <Button
            variant="contained"
            style={{ backgroundColor: "#23D5AB", color: "#fff" }}
            onClick={this.addSongButtonPressed}
          >
            Add song
          </Button>
        </Grid>

        <Playlist {...this.state.queue} />

        <Grid
          item
          xs={12}
          style={{
            display: "flex", // Apply flex here to the Grid container
            justifyContent: "center", // Center the buttons
            gap: "10px", // Space between buttons
            paddingBottom: '10px'
          }}
        >
          {this.state.isHost ? this.renderSettingsButton() : null}

          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }

  updateShowPlaylist(value) {
    this.setState({
      showPlaylist: value,
    });
  }

  //#####################################   SETTINGS SECTION   #####################################
  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={() => {
              this.getRoomDetails(); // Get room details
              this.updateShowSettings(false); // Close settings
            }}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => this.updateShowSettings(true)}
      >
        Settings
      </Button>
    );
  }

  //#####################################   RENDER SECTION   #####################################
  render() {
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    if (this.state.showPlaylist) {
      return this.renderPlaylist();
    }
    if (this.state.showAddSong) {
      return this.renderAddSong();
    }
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Room Code: {this.roomCode}
          </Typography>
        </Grid>
        <MusicPlayer {...this.state.song} />

        <Grid
          item
          xs={12}
          style={{
            display: "flex", // Apply flex here to the Grid container
            justifyContent: "center", // Center the buttons
            gap: "10px", // Space between buttons
            paddingBottom: "10px",
            paddingTop: "10px",
          }}
        >
          <Button
            variant="contained"
            style={{ backgroundColor: "#23A6D5", color: "#fff" }}
            onClick={this.playlistButtonPressed}
          >
            See Playlist
          </Button>

          <Button
            variant="contained"
            style={{ backgroundColor: "#23D5AB", color: "#fff" }}
            onClick={this.addSongButtonPressed}
          >
            Add song
          </Button>
        </Grid>

        <Grid
          item
          xs={12}
          style={{
            display: "flex", // Apply flex here to the Grid container
            justifyContent: "center", // Center the buttons
            gap: "10px", // Space between buttons
          }}
        >
          {this.state.isHost ? this.renderSettingsButton() : null}

          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
