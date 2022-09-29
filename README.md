# SWAPI

Swapi now runs on Kubernetes. This involves a simple 2-step process on the developer's part: 1.) Build and 2.) Deploy. Both of these steps are fully automated via Github Actions in this repository.

![Github Actions](/doc/github-actions-swapi.png?raw=true "Github Actions")

## Environment Variables

This code base depends on the following environment variables which can be set either on the command line at run-time, or via a .env file, or via the Kubernetes deployment manifest. each of these does the same thing to the same effect.

| Variable          | Example                                                                                      |
|-------------------|----------------------------------------------------------------------------------------------|
| SWAPI_PORT        | "8000"                                                                                       |
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

## Kubernetes Cheat Sheet

Orginally designed internally by Google but since open-sourced, [Kubernetes](https://kubernetes.io/) is an open-source container orchestration system for automating software deployment, scaling, and management. The following Kubernetes terms are prone to appear sporadically in comments throughout this repo as well as more informally during conversations with [Lawrence McDaniel](https://lawrencemcdaniel.com/) :)

- **Container**: A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another. A Docker container image is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings. The "Build and Push" Github Action workflow in this repository creates a new container and pushes it to the AWS Elastic Container Registry for Stepwise Math.
- **Deployment**: tells Kubernetes how to create or modify instances of the pods that hold a containerized application. Deployments can help to efficiently scale the number of replica pods, enable the rollout of updated code in a controlled manner, or roll back to an earlier deployment version if necessary.
- **Ingress**: An API object that manages external access to the services in a cluster, typically HTTP. Ingress may provide load balancing, SSL termination and name-based virtual hosting. Traffic routing is defined by rules specified on the Ingress resource.
- **Ingress Controller**: receives all of the http request traffic from one external load balancer and then routes each request to an ingress. Ingress controllers are a type of Kubernetes LoadBalancer that eliminate the need to implement an actual external load balancer (aproximately $15 usd per month) per service, which would become pretty expensive pretty quickly. Ingress controllers are not part of the default Kubernetes installation. One has to install and configure this separately. stepwisemath-global-live uses the [NGINX Ingress Controller for Kubernetes](https://www.nginx.com/products/nginx-ingress-controller/), but there are many alternatives from which to choose.
- **k9s**: [k9s](https://k9scli.io/) is a popular ASCII-based UI for kubectl. It is preinstalled on the stepwise bastion.
- **kubectl**: [kubectl](https://kubernetes.io/docs/tasks/tools/) is the official Kubernetes command-line tool. kubectl allows you to run commands against Kubernetes clusters. You can use kubectl to deploy applications, inspect and manage cluster resources, and view logs.
- **load balancer**: an alternative way of exposing a Kubernetes service. There needs to be an external service outside of the K8S cluster to provide the public IP address. In the case of Swapi, this external service is an AWS Elastic Load Balancer (ELB) service.
- **manifest**: is a specification of a Kubernetes API object in YAML format. A manifest specifies the desired state of an object that Kubernetes will maintain when you apply the manifest. Common manifest types include: deployment, ingress, and service.
- **Namespace**: a way to organize clusters into virtual sub-clusters — they can be helpful when different teams or projects share a Kubernetes cluster. Any number of namespaces are supported within a cluster, each logically separated from others but with the ability to communicate with each other.
- **Node**: a worker machine in Kubernetes that may be either a virtual or a physical computer, depending on the cluster. In the case of stepwisemath-global-live, the nodes are AWS EC2 instances. Each Node is managed by the Kubernetes control plane. A Node hosts multiple pods, and the Kubernetes control plane automatically handles scheduling the pods across the Nodes in the cluster in order balance load. Nodes are ephemeral. stepwise-global-live generally uses three or more nodes depending on overall cluster load, and nodes are typically replaced several times a week.
- **Node Port**: an alternative way of exposing a Kubernetes service. Open edX modules like e-commerce are implemented with node ports. Note that Swapi does not use node ports.
- **Order**: pending LetsEncrypt SSL/TLS certificate requests. The order contains the present state of the request. Orders are generally not permanently persisted in the Kubernetes control plane. Instead, these are periodically and automatically purged as orders are processed by LetsEncrypt.
- **Persistent Volume**: a storage (ie drive) volume that has been allocated to the cluster. Persistent Volumes can be assigned to a pod using deployment manifests.
- **Pod**: a collection of one or more "Docker" containers. Pods are the smallest unit of a Kubernetes application. Any given pod can be composed of just a single container (the common use case), or multiple containers (an advanced use case). Pods are stateless and ephemeral, and are prone to being frequently added and removed in response to traffic loads.
- **Secret**: a persisted base-64 encoded freeform text object, typically containing a password, token, key, or a shared configuration value. Such information might otherwise be put directly into a deployment manifest, or directly into a container image. Kubernetes Secret are a shrewd alternative to including confidential data in your application code.
- **Service**: an external interface to a logical set of Pods. Services use a ‘virtual IP address’ local to the cluster, external services would have no way to access these IP addresses without an Ingress.
- **Service Account**: provides an identity to your Pods, which can then be used to authenticate pods to the Kubernetes API server, allowing the pods to read and manipulate Kubernetes API objects. For example, a CI/CD pipeline that deploys applications to your cluster.

Further reading: [Kubernetes Ingress with NGINX Ingress Controller Example](https://spacelift.io/blog/kubernetes-ingress).

## DEPRECATED: Deploy to Heroku

    git push heroku master
