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

kubectl create namespace querium-swapi --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f "./ci/deploy/environments/dev/k8s"
