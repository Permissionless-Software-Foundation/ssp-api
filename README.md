# ipfs-service-provider

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is a node.js application for creating a REST API web server based on Koa. It also has a Mongo database.  It's forked from [ipfs-service-provider](https://github.com/Permissionless-Software-Foundation/ipfs-service-provider) boilerplate.

This app is intended to be run on the same machine as the [`ssp` branch of psf-slp-indexer](https://github.com/Permissionless-Software-Foundation/psf-slp-indexer/tree/ssp). The `ssp` branch of psf-slp-indexer tracks Group tokens that follow the [Simple Store Protocol](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps006-simple-store-protocol.md). When a SSP token is detected, the webhook will send the token data from psf-slp-indexer to this app.

This REST API and database provide endpoints that can be queried by a front end application like [LocalTradeList.com](https://localtradelist.com)

## Requirements

- node **^14.18.2**
- npm **^8.3.0**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## License

[MIT](./LICENSE.md)
