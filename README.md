# SWAPI

Swapi now runs on Kubernetes. This involves a simple 2-step process on the developer's part: 1.) Build and 2.) Deploy. Both of these steps are fully automated via Github Actions in this repository.

![Github Actions](/doc/github-actions-swapi.png?raw=true "Github Actions")

## Environment Variables

This code base depends on the following environment variables which can be set either on the command line at run-time, or via a .env file, or via the Kubernetes deployment manifest. each of these does the same thing to the same effect.

| Variable          |  Example                                                                                     |
|-------------------|----------------------------------------------------------------------------------------------|
| SWAPI_ENVIRONMENT | prod                                                                                         |
| SWAPI_HOST        | qq-stepwise-api.querium.com                                                                  |
| SWAPI_POLICY      | "$A8$"                                                                                       |
| SWAPI_SWSERVER    | https://stepwise00.querium.com/webMathematica/api/                                           |
| SWAPI_AISERVERS   | '[{"name":"ai00","url":"https://stepwiseai00.querium.com/webMathematica/api/","power":1}]'   |
| SWAPI_LOGFILE     | '/home/ubuntu/.pm2/logs/swapi_log.json'                                                      |

## Build

Kubernetes is a generic compute platform and Docker container orchestrator. To leverage this technology it is necessary to bundle Swapi into a Container and then archive this container is a cloud registry that is programatically available to Github Actions. The Github Actions "Build" work flow does both these things for you. The Build work flow does the following:

1. initializes the Github Actions runner (see details below)
2. if necessary, creates an AWS Elastic Container Registry (ECR) repository for you
3. runs Docker build using [this Dockerfile](./Dockerfile) located in the root of this repository
4. runs Docker tag in order to tag the new build as "latest"
5. pushes the new Docker container to AWS ECR to [this AWS ECR repository](https://us-east-2.console.aws.amazon.com/ecr/repositories/private/320713933456/querium/swapi?region=us-east-2)

Note that there is an alternative bash script implementation of this same procedure, [located here](swapi-build.sh) that you can run from the stepwise bastion command line.

![Github Actions - Build](/doc/github-actions-build.png?raw=true "Github Actions - Build")

## Deploy

The Github Actions Deploy workflow will deploy the latest Swapi build to the [stepwisemath-global-live Kubernetes cluster](https://us-east-2.console.aws.amazon.com/eks/home?region=us-east-2#/clusters/stepwisemath-global-live) running on AWS Elastic Kubernetes Service. The Deploy workflow does the following:

1. initializes the Github Actions runner (see details below)
2. if necessary, creates a "querium-swapi" namespace in the Kubernetes cluster
3. runs the Kubernetes manifests located [here, in this repository](ci/deploy/environments/aktiv/k8s/). Kubernetes manifests are written in yaml and are generally intuitive to read and edit.

Note that there is an alternative bash script implementation of this same procedure, [located here](swapi-deploy.sh) that you can run from the stepwise bastion command line.

![kubernetes deployment](/doc/kubernetes-flow-diagram.png?raw=true "kubernetes deployment")

The stepwise bastion server is the most convenient environment to view the state of the Kubernetes cluster. This small AWS EC2 Ubuntu instance is automatically configured with all necessary software and credentials, and it includes "getting started" help in the login banner. If that's still not enough for your needs then contact Lawrence McDaniel (lawrence@querium.com).

![k9s swapi](/doc/k9s-swapi.png?raw=true "k9s swapi")

## About Github Actions & Swapi

Github Actions is a mostly-free devops and CI automation service. It uses "runners", a floating pool of small compute nodes presumably running in Azure (since Github is owned by Microsoft). Runners are ephemeral virtual compute nodes. When you initiate a Github Actions workflow, a random runner is assigned, whereupon in our case you should note the following:

- our Github Actions workflows are located [in this repo](.github/workflows). Workflows are coded in yaml.
- Github Actions Workflows are a codified collection of Github Actions.
- Github Actions, in turn, are discrete automation steps that can be coded in a variety languages. Our work flows generally are coded in either bash or using the [proprietary commands](https://docs.github.com/en/actions/quickstart) provided by Github Actions.
- Workflows can call Github Actions stored locally inside this repository as well as third party Github Actions that are written and maintained by other organizations. Our work flows make use of both. Some example 3rd Actions that we leverage in our workflows include: [Open edX Tutor k9s init](https://github.com/marketplace/actions/open-edx-tutor-k8s-init), [Configure AWS Credentials](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions), and [Docker Setup Buildx](https://github.com/marketplace/actions/docker-setup-buildx).
- we initialize the runner with Ubuntu-latest, regardless of the nature of the work flow.
- we install and configure ALL software that is necessary for performing the workflow. Generally this includes the AWS command-line interface as well as kubectl. Both of these require some minimal amount of configuration, which is done for you.
- Authorizations to all AWS services in these work flows is based entirely on the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY key pair [located here:](https://github.com/QueriumCorp/swapi/settings/secrets/actions).
- the AWS key pair (above) is also used in the Stepwise Bastion server, located in /home/ubuntu/.aws/credentials. This key pair originates from this [AWS IAM user](https://us-east-1.console.aws.amazon.com/iam/home#/users/stepwisemath-global-live-bastion?section=security_credentials) in the Stepwise Math AWS account.
- the state of the runner is wiped clean upon workflow completion, hence the ephemeral nature of Github Actions.


## DEPRECATED: Deploy to Heroku

    git push heroku master
