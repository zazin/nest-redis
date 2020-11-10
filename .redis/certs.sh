#!/bin/bash

export BASE_DIR=/tmp/redis/
export IP_ADDRESS=192.168.18.60
export DNS_ADDRESS=redis

mkdir -p ${BASE_DIR}

cd ~ || exit

sed "/^RANDFILE.*$ENV::HOME\/\.rnd/d" -i /etc/ssl/openssl.cnf

openssl genrsa -out rootCA.key 4096
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.crt
openssl genrsa -out server.key 4096
openssl req -new -sha256 -key server.key -subj "/C=ID/ST=CA/O=MyOrg, Inc./CN=${DNS_ADDRESS}" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "\n[SAN]\nsubjectAltName=DNS:${DNS_ADDRESS},IP:${IP_ADDRESS}")) -out server.csr

openssl req -in server.csr -noout -text

openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -extfile <(printf "\n[SAN]\nsubjectAltName=DNS:${DNS_ADDRESS},IP:${IP_ADDRESS}") -days 500 -sha256 -ext SAN -extensions SAN

openssl x509 -in server.crt -text -noout
openssl dhparam -out dhparam.pem 4096

mv server.crt ${BASE_DIR}
mv server.key ${BASE_DIR}
mv dhparam.pem ${BASE_DIR}
cp rootCA.crt ${BASE_DIR}
chown -R redis:redis ${BASE_DIR}

cd ~ || exit
rm server.csr
