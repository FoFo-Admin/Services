import uuid
import asyncio
import json

import aiormq

from settings import settings


class AsyncBroker:
    def __init__(self):
        self.host = settings.mq_host
        self.port = settings.mq_port
        self.connection = None


    async def get_connection(self):
        self.connection = await aiormq.connect(
            f"amqp://{self.host}:{self.port}/"
        )
        print(0)

    async def close_connection(self):
        await self.connection.close()

    async def check_token_message(self, token, token_type):
        message_body = json.dumps({
            'token': token,
            'token_type': token_type
        })

        channel = await self.connection.channel()

        reply_future = asyncio.Future()

        async def async_reply_check_token_callback(message):
            reply_future.set_result(json.loads(message.body.decode()))
            await message.channel.basic_ack(delivery_tag=message.delivery.delivery_tag)

        ###
        reply_queue = await channel.queue_declare(queue="", exclusive=True)
        await channel.basic_consume(
            queue=reply_queue.queue,
            consumer_callback=async_reply_check_token_callback,
        )

        await channel.queue_declare(queue="token_check")

        await channel.basic_publish(
            exchange="",
            routing_key="token_check",
            body=message_body.encode(),
            properties=aiormq.spec.Basic.Properties(
                reply_to=reply_queue.queue,
                correlation_id = str(uuid.uuid4())
            )
        )

        try:
            reply = await asyncio.wait_for(reply_future, timeout=5.0)

            await channel.queue_delete(reply_queue.queue)
            await channel.close()

            return reply
        except asyncio.TimeoutError:
            print("Timeout waiting for reply")

            await channel.queue_delete(reply_queue.queue)
            await channel.close()

            return None

rabbitAsync = AsyncBroker()