## zipkin-ui Docker image

The `zipkin-ui` testing image contains the static parts of the Zipkin UI served directly with NGINX.

Besides norms defined in [docker-alpine](https://github.com/openzipkin/docker-alpine), this accepts the
following environment variables:

* `ZIPKIN_BASE_URL`: The proxied zipkin base URL. Defaults to http://zipkin:9411

To build `openzipkin/zipkin-ui:test`, from the top-level of the repository, run:
```bash
$ DOCKER_FILE=docker/test-images/zipkin-ui/Dockerfile build-bin/docker/docker_build openzipkin/zipkin-ui:test
```
