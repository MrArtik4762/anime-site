FROM fluent/fluentd:v1.16-1

# Установка плагинов
RUN gem install fluent-plugin-elasticsearch fluent-plugin-kubernetes_metadata fluent-plugin-rewrite-tag-filter

# Копирование конфигурации
COPY ./conf/fluent.conf /fluentd/etc/