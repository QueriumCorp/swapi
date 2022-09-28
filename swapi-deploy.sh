#------------------------------------------------------------------------------
# written by:   Lawrence McDaniel
# date:         sep-2022
#
# usage:        Ubuntu bash prototype of Github Action for deploy.
#
# requires:     * note that the stepwise bastion server satisfies all requirements
#               - fully configured kubectl with an IAM username that has 
#                 been added to the Kubernetes cluster.
#
# see:          https://github.com/StepwiseMath/openedx_devops#v-add-more-kubernetes-admins
#------------------------------------------------------------------------------

if [ $# == 1 ]; then
    echo "deploying $1 environment to Kubernetes cluster stepwisemath-global-live in namespace querium-swapi"

    # create the querium-swapi namespace if it doesn't exist
    kubectl create namespace querium-swapi --dry-run=client -o yaml | kubectl apply -f -

    # apply all Kubernetes manifests for the environment
    kubectl apply -f "./ci/deploy/environments/$1/k8s"
else
    echo "Usage: ./swapi-deploy.sh ENVIRONMENT where ENVIRONMENT is prod, dev, aktiv, etcetera"
    exit 1
fi
