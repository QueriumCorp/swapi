#------------------------------------------------------------------------------
# written by:   Lawrence McDaniel
# date:         sep-2022
#
# usage:        Ubuntu bash prototype of Github Action for build.
#               - build Docker container
#               - tag container
#               - push to AWS ECR
#------------------------------------------------------------------------------
GITHUB_PAT="SET-ME-PLEASE"          # see: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
AWS_ACCOUNT_NUMBER="320713933456"   # AWS account for Stepwise Math
AWS_REGION="us-east-2"              # Region where AWS ECR repository is located
SWAPI_ENVIRONMENT="dev"             # dev or prod

# fundamentals for creating AWS ECR URI
AWS_ECR_REGISTRY_SWAPI="${AWS_ACCOUNT_NUMBER}.dkr.ecr.${AWS_REGION}.amazonaws.com"
AWS_ECR_REPOSITORY_SWAPI="querium/swapi-${SWAPI_ENVIRONMENT}"
REPOSITORY_TAG_SWAPI="$(date +%Y%m%d%H%M)"
DOCKER_TAGGED_IMAGE=${AWS_ECR_REPOSITORY_SWAPI}:${REPOSITORY_TAG_SWAPI}


sudo rm -r /home/ubuntu/swapi

# clone the latest
git clone https://${GITHUB_PAT}@github.com/QueriumCorp/swapi.git
cd swapi
git checkout dev-service


# This is an aws cli helper command that facilitates a seamless a Docker push to AWS ECR.
# aws ecr get-login-password returns the private ssh key for the AWS ECR repository
# which is automatically stored in ~/.docker/config.json
#
# see: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html
# -------------------------------------
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 320713933456.dkr.ecr.us-east-2.amazonaws.com

# build the Docker image
docker build . -t ${DOCKER_TAGGED_IMAGE}

# tag and push the image to AWS ECR
#docker tag ${DOCKER_TAGGED_IMAGE} ${AWS_ECR_REGISTRY_SWAPI}/${DOCKER_TAGGED_IMAGE}
docker tag ${DOCKER_TAGGED_IMAGE} ${AWS_ECR_REGISTRY_SWAPI}/${AWS_ECR_REPOSITORY_SWAPI}:latest
docker push ${AWS_ECR_REGISTRY_SWAPI}/${AWS_ECR_REPOSITORY_SWAPI}:latest

