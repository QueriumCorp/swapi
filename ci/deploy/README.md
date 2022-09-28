# Deployment Environments

Follow these general guidelines to create and configure a new Swapi run-time environment. Note that while not technically required, it is generally assumed that your run-time environment will be hosted on a sub-domain of qq-stepwise-api.querium.com. There **could** be source code in this repository that implicitly assumes that this is the case.
## Required manifests

*These are located in the k8s folder inside of each deployment environment.*

- **certificate.yml**: creates and manages the ssl/tls certificate for the sub-domain
- **cluster-issuer.yml**: maps Letsencrypt service to the AWS Hosted Zone for the sub-domain
- **deployment.yml**: maps the Docker container registry, port assignment and environment variables
- **ingress**: maps the sub-domain host name to the Kubernetes service name
- **service**: maps the ingress to the individual pods of the deployment

## Optional manifests

- **horizontal-pod-autoscaler.yml**: defines the parameters for horizontal scaling of the Kubernets service
- **vertical-pod-autoscaler.yml**: defines the parameters for vertical scaling of the individual pods.

## Checklist for creating a new deployment environment

- create an AWS Route53 Hosted Zone in the Stepwise Math AWS account
- you **might** have to manually copy the A record for this hosted zone, using a value of the AWS ELB of the form *dualstack.ac4a465e0ae414b7a993c3aba9f7f944-2032672476.us-east-2.elb.amazonaws.com*
- add an NS record in the Querium AWS Route53 querium.com hosted zone
- copy-paste an existing ci/deploy/environment in this repo
- in your new environment, set the HostedZoneId in cluster-issuer.yml
- search-replace the environment name
- edit the environment variables in deployment.yml
- create and run a new Deployment Github Workflow in .github/workflows
- use k9s to verify that the Kubernetes Letsencrypt service issued the ssl certificate