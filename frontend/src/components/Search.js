import React, { Component } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  LinearProgress,
  Snackbar,
} from "@material-ui/core";
import { SnackbarContent } from "@material-ui/core";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "", // Search query
      searchResults: [], // Search results
      isLoading: false, // Loading state
      successMessage: "", // Success message to be displayed
    };
  }

  handleSearchChange = (event) => {
    this.setState({ query: event.target.value });
  };

  handleSearchSubmit = () => {
    if (this.state.query.trim() === "") return;

    this.setState({ isLoading: true });

    // Call backend to search for songs/artists
    fetch(
      `/spotify/search?q=${encodeURIComponent(
        this.state.query
      )}&type=artist%2Ctrack`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.tracks && data.tracks.items) {
          this.setState({
            searchResults: data.tracks.items, // Update state with results
            isLoading: false,
          });
        } else {
          // Handle case where no items are found or the structure is different
          this.setState({
            searchResults: [],
            isLoading: false,
          });
          console.error(
            "No items found or unexpected response structure:",
            data
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        this.setState({ isLoading: false });
      });
  };

  handleAddSong = (song) => {
    const songUri = song.uri || "Unknown uri";

    fetch(`/spotify/add-song?uri=${encodeURIComponent(songUri)}`, {
      method: "POST", // Use POST to match the backend endpoint
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status !== 204) {
          // Since the API returns a 204 No Content on success
          throw new Error("Failed to add song");
        }
        const songName = song.name || "Unknown Song";
        this.setState({
          successMessage: `"${songName}" was added to the playlist`,
        });
        // Clear the success message after a delay
        setTimeout(() => {
          this.setState({ successMessage: "" });
        }, 1000);
      })
      .catch((error) => {
        console.error("Error adding song:", error);
      });
  };

  render() {
    const { searchResults, isLoading, query, successMessage } = this.state;

    return (
      <Grid
        container
        justifyContent="center"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <Grid item xs={12} md={6} style={{ padding: "20px" }}>
          <TextField
            label="Search for Songs or Artists"
            variant="outlined"
            //className="custom-textfield"
            fullWidth
            value={query}
            onChange={this.handleSearchChange}
            style={{ marginBottom: "20px" }}
          />

          <Grid
            item
            xs={12}
            style={{
              display: "flex", // Apply flex here to the Grid container
              justifyContent: "center", // Center the buttons
              gap: "10px", // Space between buttons
              paddingBottom: "10px",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.updateShowSearch(false)}
            >
              Go back
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSearchSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </Grid>

          {isLoading && <LinearProgress style={{ marginTop: "20px" }} />}

          {searchResults.length > 0 && (
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              {searchResults.map((song) => (
                <Grid item xs={12} key={song.id} style={{ width: "100%" }}>
                  <Card
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      width: "100%", // Ensure it takes full width of the container
                    }}
                    onClick={() => this.handleAddSong(song)} // Handle song click
                  >
                    <Grid container alignItems="center">
                      <Grid item xs={4} align="center">
                        <img
                          src={song.album.images[0]?.url}
                          height="80px"
                          width="80px"
                          alt={song.name}
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="h6">{song.name}</Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                          {song.artists.map((artist) => artist.name).join(", ")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Success Message */}
          {successMessage && (
            <Snackbar open={true} autoHideDuration={1000}>
              <SnackbarContent
                style={{
                  backgroundColor: "#4caf50", // Green color for success
                  color: "#fff", // White text
                }}
                message={successMessage}
              />
            </Snackbar>
          )}
        </Grid>
      </Grid>
    );
  }
}
