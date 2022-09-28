# Kubernetes Deployment Manifests

## Required manifests

- **certificate.yml**: creates and manages the ssl/tls certificate for the sub-domain
- **cluster-issuer.yml**: maps Letsencrypt service to the AWS Hosted Zone for the sub-domain
- **deployment.yml**: maps the Docker container registry, port assignment and environment variables
- **ingress**: maps the sub-domain host name to the Kubernetes service name
- **service**: maps the ingress to the individual pods of the deployment

## Optional manifests

- **horizontal-pod-autoscaler.yml**: defines the parameters for horizontal scaling of the Kubernets service
- **vertical-pod-autoscaler.yml**: defines the parameters for vertical scaling of the individual pods.

## Checklist for creating a new environment

- create an AWS Route53 Hosted Zone in the Stepwise Math AWS account
- add an NS record in the Querium AWS Route53 querium.com hosted zone
- copy-paste an existing ci/deploy/environment in this repo
- in your new environment, set the HostedZoneId in cluster-issuer.yml
- search-replace the environment name
- edit the environment variables in deployment.yml
- create and run a new Deployment Github Workflow in .github/workflows
- use k9s to verify that the Kubernetes Letsencrypt service issued the ssl certificate