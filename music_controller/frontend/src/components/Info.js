import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

import { Link } from "react-router-dom";

const pages = { JOIN: "pages.join", CREATE: "pages.create" };

export default function Info(props) {
  const [page, setPage] = useState(pages.JOIN);

  function joinInfo() {
    return "Join page";
  }

  function createInfo() {
    return "Create page";
  }

  /* This is replace  the componentDidMount and componentWillUnmount in Functional Components */
  useEffect(() => {
    {
      /* This section the componentDidMount*/
    }
    return () => {
      /* This section the componentWillUnmount*/
    };
  });

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          What's this app?
        </Typography>
      </Grid>

      <Grid item xs={12} align="center">
        <Typography variant="body1">
          {page === pages.JOIN ? joinInfo() : createInfo()}
        </Typography>
      </Grid>

      <Grid item xs={12} align="center">
        <IconButton
          onClick={() => {
            page === pages.CREATE ? setPage(pages.JOIN) : setPage(pages.CREATE);
          }}
        >
          {page === pages.CREATE ? (
            <NavigateBeforeIcon />
          ) : (
            <NavigateNextIcon />
          )}
        </IconButton>
      </Grid>

      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" to="/" component={Link}>
          Take me Home!
        </Button>
      </Grid>
    </Grid>
  );
}
