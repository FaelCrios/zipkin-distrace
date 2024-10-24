/*
 * Copyright The OpenZipkin Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    Box,
    Theme,
    createStyles,
    makeStyles, Button,
} from '@material-ui/core';

import React, {useCallback} from 'react';
import { useDispatch} from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";
import { Trans, useTranslation } from 'react-i18next';
import {Header} from "../TracePage/Header";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchWrapper: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
      flex: '0 0',
      borderBottom: `1px solid ${theme.palette.divider}`,
    }
  }),
);

type DistracePageProps = RouteComponentProps;


const DistracePageImpl: React.FC<DistracePageProps> = ({
  history,
  location,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <Box
      width="100%"
      height="calc(100vh - 64px)"
      display="flex"
      flexDirection="column"
    >
        <Box display="flex" justifyContent="center" alignItems="center">
            <Box display="inline-block" justifyContent="alignContent" mr={0.5} alignItems="center">
            <h1>Distrace</h1>
              <h2>Um software sobre observabilidade</h2>
            </Box>
            <Button
                color="primary"
                variant="contained"
                onClick={() => console.log("Ola")}
                data-testid="search-button"
                startIcon={<FontAwesomeIcon icon={faSync} />}
            >
                <Trans t={t}>Run Query</Trans>

                </Button>
        </Box>
        <Box flex="1 1" bgcolor="background.paper" overflow="hidden">
        </Box>
        </Box>
  );
};

export default withRouter(DistracePageImpl);
