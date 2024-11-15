import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  LinearProgress,
} from "@material-ui/core";

export default class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlist: [],  // All songs will be stored here
      isLoading: true,
    };
  }

  componentDidMount() {
    // Fetch the playlist data when the component mounts
    this.fetchPlaylist();
  }

  fetchPlaylist = () => {
    this.setState({ isLoading: true });

    fetch("/spotify/playlist") // Assuming this is the endpoint for fetching the playlist
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          playlist: data, // Store all the songs
          isLoading: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching playlist:", error);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const { playlist, isLoading } = this.state;

    if (isLoading) {
      return <LinearProgress />; // Show loading indicator while fetching playlist
    }

    return (
      <Grid container justifyContent="center" style={{ minHeight: "100vh", overflowY: "auto" }}>
        {/* Center container */}
        {playlist.length > 0 ? (
          playlist.map((song) => (
            <Grid item xs={12} md={7} lg={7} key={song.id} justifyContent="center" style={{ paddingBottom: "10px" }}>
              {/* Song item */}
              <Card style={{ margin: "0 10px" }}>
                {/* Card margin */}
                <Grid container alignItems="center">
                  <Grid item xs={4} align="center">
                    <img
                      src={song.image_url}
                      height="80px" // Reduced image size
                      width="80px"  // Reduced image size
                      alt={song.title}
                    />
                  </Grid>
                  <Grid item xs={8} align="center">
                    <Typography component="h6" variant="h6">
                      {song.title}
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle1">
                      {song.artist}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No songs in the playlist.
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  }
}
