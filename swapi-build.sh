#------------------------------------------------------------------------------
# written by:   Lawrence McDaniel
# date:         sep-2022
#
# usage:        Ubuntu bash prototype of Github Action for build.
#               - build Docker container
#               - tag container
#               - push to AWS ECR
#
# requires:     * note that the stepwise bastion server satisfies all requirements
#               - aws cli + AWS IAM key pair with sufficient privileges
#               
#------------------------------------------------------------------------------
GITHUB_PAT="SET-ME-PLEASE"          # see: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
AWS_ACCOUNT_NUMBER="320713933456"   # AWS account for Stepwise Math
AWS_REGION="us-east-2"              # Region where AWS ECR repository is located
SWAPI_ENVIRONMENT="prod"             # dev or prod

# fundamentals for creating AWS ECR URI
AWS_ECR_REGISTRY="${AWS_ACCOUNT_NUMBER}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CONTAINER_NAME="querium/swapi-${SWAPI_ENVIRONMENT}"
DATE_TAG="$(date +%Y%m%d%H%M)"
DOCKER_TAGGED_IMAGE=${CONTAINER_NAME}:${DATE_TAG}

# if we find a .env file in the home folder then load it.
# In production environments this is usually where the
# value of GITHUB_PAT is stored
if [ -f "/home/ubuntu/.env" ]; then
    export $(grep -v '^#' /home/ubuntu/.env | xargs)
fi

sudo rm -r /home/ubuntu/swapi

# clone the latest, make extra sure we're on the master branch.
git clone https://${GITHUB_PAT}@github.com/QueriumCorp/swapi.git
cd swapi
git checkout master


# This is an aws cli helper command that facilitates a seamless a Docker push to AWS ECR.
# aws ecr get-login-password returns the private ssh key for the AWS ECR repository
# which is automatically stored in ~/.docker/config.json
#
# see: https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html
# -------------------------------------
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ECR_REGISTRY}

# build the Docker image
docker build . -t ${DOCKER_TAGGED_IMAGE}

# tag and push the image to AWS ECR
docker tag ${DOCKER_TAGGED_IMAGE} ${AWS_ECR_REGISTRY}/${CONTAINER_NAME}:latest
docker push ${AWS_ECR_REGISTRY}/${CONTAINER_NAME}:latest

