# Node 22 LTS on UBI9 so globalThis.File is present
FROM registry.access.redhat.com/ubi9/nodejs-22

ENV HOME=/opt/app-root/src \
      TZ=America/Vancouver \
      NPM_CONFIG_PREFIX=$HOME/.npm-global \
      PATH=$HOME/.npm-global/bin:$PATH \
      N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

USER 0

RUN dnf -y install \
      imagemagick \
      gcc-c++ \
      make \
      jq \
      python3 \
      && dnf clean all

RUN curl -fsSL https://downloads-openshift-console.apps.gold.devops.gov.bc.ca/amd64/linux/oc.tar -o /tmp/oc.tar && \
      tar -xf /tmp/oc.tar -C /tmp && \
      mv /tmp/oc /usr/bin/oc && \
      rm -f /tmp/oc.tar

RUN npm install -g npm && npm install -g n8n

# ---- OpenShift-friendly writable dirs ----
RUN mkdir -p /data $HOME/.n8n && \
      chgrp -R 0 /data $HOME && \
      chmod -R g+rwX /data $HOME

WORKDIR /data
EXPOSE 5678/tcp
CMD ["n8n"]
