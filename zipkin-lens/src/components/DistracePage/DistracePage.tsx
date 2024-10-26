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

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faProjectDiagram, faSync} from "@fortawesome/free-solid-svg-icons";
import { Trans, useTranslation } from 'react-i18next';
import {Header} from "../TracePage/Header";
import moment from "moment/moment";
import {clearDependencies, loadDependencies} from "../../slices/dependenciesSlice";
import {RootState} from "../../store";
import {clearAlert, setAlert} from "../App/slice";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";
import {LoadingIndicator} from "../common/LoadingIndicator";
import DependenciesGraph from "../DependenciesPage/DependenciesGraph";
import ExplainBox from "../common/ExplainBox";
import {KeyboardDateTimePicker} from "@material-ui/pickers";
import DistraceGraph from "./DistraceGraph";
import {faTable} from "@fortawesome/free-solid-svg-icons/faTable";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchWrapper: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
      flex: '0 0',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dateTimePicker: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
);

type DistracePageProps = RouteComponentProps;

const useTimeRange = (history: any, location: any) => {
  const setTimeRange = useCallback(
    (timeRange: { startTime: moment.Moment; endTime: moment.Moment }) => {
      const ps = new URLSearchParams(location.search);
      ps.set('startTime', timeRange.startTime.valueOf().toString());
      ps.set('endTime', timeRange.endTime.valueOf().toString());
      history.push({
        pathname: location.pathname,
        search: ps.toString(),
      });
    },
    [history, location.pathname, location.search],
  );

  const timeRange = useMemo(() => {
    const ps = new URLSearchParams(location.search);
    const startTimeStr = ps.get('startTime');
    let startTime;
    if (startTimeStr) {
      startTime = moment(parseInt(startTimeStr, 10));
    }

    const endTimeStr = ps.get('endTime');
    let endTime;
    if (endTimeStr) {
      endTime = moment(parseInt(endTimeStr, 10));
    }

    return {
      startTime,
      endTime,
    };
  }, [location.search]);

  return { timeRange, setTimeRange };
};

const useFetchDependencies = (timeRange: {
  startTime?: moment.Moment;
  endTime?: moment.Moment;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!timeRange.startTime || !timeRange.endTime) {
      dispatch(clearDependencies());
      return;
    }
    const lookback = timeRange.endTime.diff(timeRange.startTime);
    dispatch(
      loadDependencies({ lookback, endTs: timeRange.endTime.valueOf() }),
    );
  }, [dispatch, timeRange.endTime, timeRange.startTime]);
};


const DistracePageImpl: React.FC<DistracePageProps> = ({
  history,
  location,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();


  const { timeRange, setTimeRange } = useTimeRange(history, location);
  const [tempTimeRange, setTempTimeRange] = useState({
    startTime: timeRange.startTime
      ? timeRange.startTime
      : moment().subtract({ days: 1 }),
    endTime: timeRange.endTime ? timeRange.endTime : moment(),
  });
  useFetchDependencies(timeRange);

  const { isLoading, dependencies, error } = useSelector(
    (state: RootState) => state.dependencies,
  );

  useEffect(() => {
    if (error) {
      dispatch(
        setAlert({
          message: 'Failed to load dependencies...',
          severity: 'error',
        }),
      );
    } else {
      dispatch(clearAlert());
    }
  }, [error, dispatch]);

  const handleStartTimeChange = useCallback(
    (startTime: MaterialUiPickersDate) => {
      if (startTime) {
        setTempTimeRange({ ...tempTimeRange, startTime });
      }
    },
    [tempTimeRange],
  );

  const handleEndTimeChange = useCallback(
    (endTime: MaterialUiPickersDate) => {
      if (endTime) {
        setTempTimeRange({ ...tempTimeRange, endTime });
      }
    },
    [tempTimeRange],
  );

  const handleSearchButtonClick = useCallback(() => {
    setTimeRange(tempTimeRange);
  }, [setTimeRange, tempTimeRange]);

  useEffect(() => {
    return () => {
      dispatch(clearDependencies());
    };
  }, [dispatch]);

  let content: JSX.Element;
  if (isLoading) {
    content = <LoadingIndicator />;
  } else if (dependencies.length > 0) {
    content = <DistraceGraph distrace={dependencies}/>;
  } else {
    content = (
      <ExplainBox
        icon={faTable}
        headerText={<Trans t={t}>Criar a visualização do sistema</Trans>}
        text={
          <Trans t={t}>
            Por favor, selecionar a data de inicio e de fim e então apertar o botão para pesquisar.
          </Trans>
        }
      />
    );
  }


  return (
    <Box
      width="100%"
      height="calc(100vh - 64px)"
      display="flex"
      flexDirection="column"
    >
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box flex="1 1" bgcolor="background.paper" overflow="hidden">
            <Box
              width="100%"
              height="calc(100vh - 64px)"
              display="flex"
              flexDirection="column"
            >
              <Box className={classes.searchWrapper}>
                <Box display="flex" justifyContent="center" mr={0.5} alignItems="center">
                  <h2>Distrace: um software sobre observabilidade</h2>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Box display="flex" mr={0.5} alignItems="center">
                    <KeyboardDateTimePicker
                      label={t(`Data de início`)}
                      inputVariant="outlined"
                      value={tempTimeRange.startTime}
                      onChange={handleStartTimeChange}
                      format="MM/DD/YYYY HH:mm:ss"
                      className={classes.dateTimePicker}
                      size="small"
                    />
                    -
                    <KeyboardDateTimePicker
                      label={t(`Data de fim`)}
                      inputVariant="outlined"
                      value={tempTimeRange.endTime}
                      onChange={handleEndTimeChange}
                      format="MM/DD/YYYY HH:mm:ss"
                      className={classes.dateTimePicker}
                      size="small"
                    />
                  </Box>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={handleSearchButtonClick}
                    data-testid="search-button"
                    startIcon={<FontAwesomeIcon icon={faSync} />}
                  >
                    <Trans t={t}>Pesquisar</Trans>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1" bgcolor="background.paper" overflow="hidden">
                {content}
              </Box>
            </Box>
          </Box>
        </Box>
        </Box>

  );
};

export default withRouter(DistracePageImpl);
