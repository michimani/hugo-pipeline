hugo-pipeline
===

This is a sample project for TypeScript development with CDK.  
You can create build pipeline of HUGO site using this project.

# Usase

0. prepare

    ```console
    $ npm install
    $ cdk bootstrap
    ```

1. create config file

    ```console
    $ cp stack-config.yml.sample stack-config.yml
    ```

    Set environment variables in the following yaml format.

    ```yaml
    common:
      hugo_version: 0.62.0
      region: <deploy-target-region> #eg: ap-northeast-1

    route53:
      zone_name: <existed-hosted-zone-name> #eg: example.com
      zone_id: <existed-hosted-zone-id> #eg: ABCD123467890
      subdomain_host: <hostname-of-sub-domain (optional)> #eg: hugo (if you want to host this site as "hugo.example.com")

    codepipeline:
      branch: master
    ```

    You can check the values ​​of `route53.zone` and `route53.zone_id` in the Route 53 management console.

2. test

    ```
    $ npm run test
    ```

3. build

    ```console
    $ cdk synth
    ```

4. deploy

    ```console
    $ cdk deploy
    ```

5. add remote repository URL

    Get generated repository info,
  
    ```
    $ aws codecommit get-repository --repository-name <generated codecommit repo name> --region <specified region>
    ```
    
    and repository URL to your HUGO project. (`git remote add`)

6. check

    Access the domain you set up (rg: `hugo.example.com`), and check if the web page is displayed correctly.
