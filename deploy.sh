# Script to deploy app

echo "deployment started"

# set deployment directory
deployment_dir="/var/deployments"

# switch to root user to give administartor previledges
sudo su root

# check if directory exists, remove existing dir and contents
if [ -d "$deployment_dir" ]; then
    rm -r deployment_dir
fi

# check if container is running and rm
if [ ! $(docker ps | grep -w $2) ]; then
    docker container rm $2 -f
fi

# check if image exists and rm
if [ ! $(docker image ls | grep -w $2) ]; then
    docker image rm $2 -f
fi

# create directory
mkdir -p $deployment_dir

# move to deploment dir
cd $deployment_dir

# clone repository
git clone $1

# move to cloned dir
cd $2

# checkout to main branch
git checkout main

# copy dockerfile to cloned folder
cp -r /github-bot/docker/Dockerfile.py $deployment_dir/Dockerfile

# run docker build
docker build --tag $2 .

# create the docker container of the build
docker run -d --name=$2 -p 5000:5000 $2

# check that container is running
if [ $(docker ps | grep -w $2) ]; then
    echo "deployment complete"
fi