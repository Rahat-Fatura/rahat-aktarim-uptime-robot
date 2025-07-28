FROM rabbitmq:3.12-management

# Plugin dosyasını ekle
ADD rabbitmq_delayed_message_exchange-3.12.0.ez /plugins/

# Plugin klasörüne taşı
RUN mv /plugins/rabbitmq_delayed_message_exchange-3.12.0.ez /opt/rabbitmq/plugins/

# Plugin'i etkinleştir
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange
