import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {
  constructor(props) {
    super(props);
  }

  pauseSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions);
  }

  playSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions);
  }

  skipSong() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip", requestOptions);
  }

  render() {
    const songProgress = (this.props.time / this.props.duration) * 100;

    return (
      <Grid container justifyContent="center">
        {" "}
        {/* Center container */}
        <Grid item xs={12} md={6} lg={6}>
          {" "}
          {/* Half-width on larger screens */}
          <Card style={{ margin: "0 10px" }}>
            {" "}
            {/* Margin for spacing */}
            <Grid container alignItems="center">
              <Grid item xs={4} align="center">
                <img src={this.props.image_url} height="100%" width="100%" />
              </Grid>
              <Grid item xs={8} align="center">
                <Typography component="h6" variant="h6">
                  {this.props.title}
                </Typography>
                <Typography color="textSecondary" variant="subtitle1">
                  {this.props.artist}
                </Typography>
                <div>
                  <IconButton
                    onClick={() => {
                      this.props.is_playing
                        ? this.pauseSong()
                        : this.playSong();
                    }}
                  >
                    {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <IconButton onClick={() => this.skipSong()}>
                    {this.props.votes} / {this.props.votes_required}
                    <SkipNextIcon />
                  </IconButton>
                </div>
              </Grid>
            </Grid>
            <LinearProgress variant="determinate" value={songProgress} />
          </Card>
        </Grid>
      </Grid>
    );
  }
}
