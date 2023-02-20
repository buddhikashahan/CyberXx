FROM aquabotwa/sanuwa-official:md-beta

RUN git clone https://github.com/edm-official/CyberXx /root/CyberXx
WORKDIR /root/CyberXx/
ENV TZ=Europe/Istanbul
RUN yarn add supervisor -g
RUN yarn install --no-audit

CMD ["node", "index.js"]

