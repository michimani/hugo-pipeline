import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import HugoPipline = require('../lib/hugo-pipline-stack');
import * as Config from '../lib/Config';

test('Empty Stack', () => {
  const app = new cdk.App();
  const stackConfig = new Config.StackConfig();
  const stack = new HugoPipline.HugoPiplineStack(app, 'TestStack', stackConfig, {
    env: {
      region: stackConfig.common.region
    },
  });
  expectCDK(stack).notTo(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});