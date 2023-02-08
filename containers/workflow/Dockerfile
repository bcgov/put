      FROM n8nio/n8n:0.195.0

      RUN apk add shadow-uidmap imagemagick curl tar
      RUN curl https://downloads-openshift-console.apps.gold.devops.gov.bc.ca/amd64/linux/oc.tar --output oc.tar
      RUN tar xC /bin -f oc.tar
      CMD ["n8n"]
