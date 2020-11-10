FROM redis:6

COPY redis.conf /usr/local/etc/redis/redis.conf

RUN mkdir -p /usr/local/etc/certs

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
