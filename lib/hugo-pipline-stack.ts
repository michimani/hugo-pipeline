import cdk = require('@aws-cdk/core');
import codebuild = require('@aws-cdk/aws-codebuild')
import codecommit = require('@aws-cdk/aws-codecommit');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import route53 = require('@aws-cdk/aws-route53');
import route53targets = require('@aws-cdk/aws-route53-targets');
import yaml = require('js-yaml');
import fs = require('fs')
import * as config from './Config';

export class HugoPiplineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, stackConfig: config.StackConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    const useSubDomain: boolean = (typeof stackConfig.route53.subdomain_host !== 'undefined' && stackConfig.route53.subdomain_host !== '' && stackConfig.route53.subdomain_host !== null);

    // create S3 bucket
    const bucketName: string = (useSubDomain === true) ? `${stackConfig.route53.subdomain_host}.${stackConfig.route53.zone_name}` : stackConfig.route53.zone_name;
    const hugoBucket = new s3.Bucket(this, bucketName, {
      bucketName,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteErrorDocument: '404.html',
      websiteIndexDocument: 'index.html',
    });

    // create Toure 53 alias record
    const myZone: route53.IHostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'MyZone', {
      zoneName: stackConfig.route53.zone_name,
      hostedZoneId: stackConfig.route53.zone_id
    });

    const record: route53.ARecordProps = {
      zone: myZone,
      target: route53.AddressRecordTarget.fromAlias(new route53targets.BucketWebsiteTarget(hugoBucket)),
      recordName: (useSubDomain === true) ? stackConfig.route53.subdomain_host : stackConfig.route53.zone_name
    }

    new route53.ARecord(this, 'StaticWebsiteSampleRecord', record);

    // create CodeCommit repositry
    const repoName = bucketName.replace(/\./g, '-');
    const repo = new codecommit.Repository(this, 'Repositry', {
      repositoryName: repoName,
      description: 'This is a repository of Hugo site.'
    });

    // create CodeBuild project
    const projectName = repoName + '-project';
    const buildspecBase = fs.readFileSync('buildspec_base.yml', {encoding: 'utf-8'});
    const buildspec = buildspecBase.replace(/##HUGO_VERSION##/g, stackConfig.common.hugo_version).replace(/##BUCKET_NAME##/g, hugoBucket.bucketName);

    const buildProject = new codebuild.PipelineProject(this, 'HugoBuildProject', {
      projectName: projectName,
      buildSpec: codebuild.BuildSpec.fromObject(yaml.safeLoad(buildspec))
    });

    buildProject.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        's3:*'
      ],
      resources: ['*']
    }));

    // create pipeline
    const pipelineName = repoName + '-pipeline';
    const souceOutput = new codepipeline.Artifact();

    const soruceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: repo,
      branch: stackConfig.codepipeline.branch,
      output: souceOutput
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "CodeBuild",
      project: buildProject,
      input: souceOutput,
      outputs: [new codepipeline.Artifact()]
    });

    new codepipeline.Pipeline(this, 'HugoPipeline', {
      pipelineName,
      stages: [
        {
          stageName: 'Source',
          actions: [
            soruceAction
          ]
        },
        {
          stageName: "Build",
          actions: [
            buildAction
          ]
        }
      ]
    });

    // output: CodeCommit repositry URL
    const codecommitInfo = `Please run following AWS CLI command to get generated CodeCommit repositry info.\n\n
    \taws codecommit get-repository --repository-name ${repoName} --region ${stackConfig.common.region}\n`;
    fs.writeFileSync('./cdk.out/codecommit_info.txt', codecommitInfo);
  }
}
