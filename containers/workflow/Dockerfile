      FROM registry.access.redhat.com/ubi8/nodejs-16:latest
      ENV HOME=/opt/app-root/src \
            TZ=America/Vancouver

      USER root

      RUN rpm -ivh https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

      RUN yum update -y

      RUN yum install -y GraphicsMagick gcc-c++ make jq python3

      RUN yum clean all

      RUN curl https://downloads-openshift-console.apps.gold.devops.gov.bc.ca/amd64/linux/oc.tar --output oc.tar
      RUN tar -xvf oc.tar
      RUN cp oc /usr/bin
      RUN rm oc.tar oc

      RUN npm install -g npm

      RUN mkdir -p $HOME

      WORKDIR $HOME

      ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

      RUN npm install -g n8n

      WORKDIR /data

      EXPOSE 5678/tcp

      CMD "n8n"