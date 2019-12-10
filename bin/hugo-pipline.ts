#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { HugoPiplineStack } from '../lib/hugo-pipline-stack';

const app = new cdk.App();
new HugoPiplineStack(app, 'HugoPiplineStack');
