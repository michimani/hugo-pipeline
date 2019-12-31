#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { HugoPiplineStack } from '../lib/hugo-pipline-stack';
import * as Config from '../lib/Config';

const app = new cdk.App();

const stackConfig = new Config.StackConfig();
new HugoPiplineStack(app, 'HugoPiplineStack', stackConfig, {
  env: {
    region: stackConfig.common.region
  },
});
