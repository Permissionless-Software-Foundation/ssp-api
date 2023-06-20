# ipfs-service-provider

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is a node.js application that creates a REST API. This software acts as middleware between the [ssp branch of psf-slp-indexer](https://github.com/Permissionless-Software-Foundation/psf-slp-indexer/tree/ssp) and the [localtradelist.com web app](https://github.com/christroutner/localtradelist.com). Details information is available at [docs.LocalTradeList.com](https://docs.localtradelist.com).

When the SLP indexer software detects a new token or [Claim](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps008-claims.md) that follows the [Simple Store protocol](), it triggers a webhook that feeds the data into this software. The [LocalTradeList.com web app](https://localtradelist.com) then queries the REST API of this software to retrieve and display data about stores.


## Requirements

- node **^14.18.2**
- npm **^8.3.0**
- Docker **^20.10.8**
- Docker Compose **^1.27.4**

## Installation and Usage

This app is intended to be operated using Docker and Docker Compose an an Ubuntu 18.04 or 20.04 operating system.

- `cd production/docker`
- `docker-compose pull`
- `docker-compose build`
- `docker-compose up -d`
- `docker logs --tail 20 -f ssp-api`

## License

[MIT](./LICENSE.md)
