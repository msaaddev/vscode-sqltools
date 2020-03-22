import React from 'react';
import { NSDatabase } from '@sqltools/types';
import QueryResult from './QueryResult';
import getVscode from '@sqltools/plugins/connection-manager/ui/lib/vscode';
import QueryResultsState from './State';
import '@sqltools/plugins/connection-manager/ui/sass/results.scss';
import { Tabs, Tab, Typography } from '@material-ui/core';
import logger from '@sqltools/util/log';
import { IWebviewMessage } from '@sqltools/plugins/connection-manager/ui/interfaces';

const log = logger.extend('results');
const defaultPageSize = 50;

export default class ResultsScreen extends React.Component<{}, QueryResultsState> {
  state: QueryResultsState = {
    connId: null,
    resultMap: {},
    queries: [],
    error: null,
    activeTab: null,
    pageSize: defaultPageSize,
    loading: true,
  };

  constructor(props) {
    super(props);
    window.addEventListener('message', ev => this.messagesHandler(ev.data as IWebviewMessage));
  }

  saveState = (data, cb = () => {}) => {
    this.setState(data, () => {
      cb();
      getVscode().setState(this.state);
    });
  };

  componentDidMount() {
    getVscode().postMessage({ action: 'viewReady', payload: true });
  }

  toggle(queryIndex: number) {
    this.saveState({
      activeTab: queryIndex,
    });
  }

  messagesHandler = ({ action, payload }: IWebviewMessage<any>) => {
    if (!action) return;
    log(`Message received: %s %O`, action, payload || 'NO_PAYLOAD');
    switch (action) {
      case 'queryResults':
        const results: NSDatabase.IResult[] = payload;
        const queries = [];
        const resultMap = {};
        let connId: string;
        (Array.isArray(results) ? results : [results]).forEach(r => {
          connId = r.connId;
          queries.push(r.query);
          resultMap[r.query] = r;
        });
        this.saveState({
          connId,
          queries,
          resultMap,
          error: null,
          activeTab: 0,
          loading: false,
        });
        break;
      case 'reset':
        this.saveState({ connId: null, resultMap: {}, queries: [], loading: true });
        break;

      case 'getState':
        getVscode().postMessage({ action: 'receivedState', payload: this.state });
        break;
      default:
        log.extend('warn')(`No handler set for %s`, action);
        break;
    }
  };

  onCurrentPageChange = ({ queryType, queryParams, page, pageSize }) => {
    if (!queryType) return;
    this.setState({ loading: true }, () => {
      getVscode().postMessage({
        action: 'call',
        payload: {
          command: `${process.env.EXT_NAMESPACE}.${queryType}`,
          args: [queryParams, page, pageSize],
        },
      });
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>Query errored. Check the logs.</h2>
          <h4>{this.state.error.toString()}</h4>
        </div>
      );
    }
    let tabs = null;
    const currentQuery = this.state.queries[this.state.activeTab];
    const result = this.state.resultMap[currentQuery];
    if (this.state.queries.length > 1) {
      tabs = (
        <Tabs
          value={this.state.activeTab}
          onChange={(_e, index) => this.toggle(index)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {this.state.queries.map((query: string, index: number) => (
            <Tab
              disableFocusRipple
              disableRipple
              key={index}
              label={
                <Typography variant="inherit" noWrap style={{ width: '100%', textTransform: 'initial' }}>
                  {(this.state.resultMap[query] && this.state.resultMap[query].label) || query}
                </Typography>
              }
            />
          ))}
        </Tabs>
      );
    }
    return (
      <div className="query-results-container fullscreen-container">
        {tabs}
        <QueryResult loading={this.state.loading} onCurrentPageChange={this.onCurrentPageChange} result={result} />
      </div>
    );
  }
}