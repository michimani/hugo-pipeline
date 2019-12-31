import yaml = require('js-yaml');
import fs = require('fs');

export interface CommonConfig {
  region: string;
  hugo_version: string;
}

export interface Route53Config {
  zone_name: string;
  zone_id: string;
  subdomain_host?: string;
}

export interface CodePipelineConfig {
  branch: string;
}

export interface StackConfig {
  common: CommonConfig,
  route53: Route53Config
  codepipeline: CodePipelineConfig,
}

export class StackConfig {
  constructor() {
    const stackConfig = yaml.safeLoad(fs.readFileSync('stack-config.yml', {encoding: 'utf-8'}));

    return stackConfig;
  }
}
