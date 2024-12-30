import uuid
import asyncio
import json

import aiormq

from app import models, utils, db_helper, views

from settings import settings


async def async_check_token_callback(message):
    token = json.loads(message.body.decode())
    try:
        with db_helper.session_factory() as session:
            user: models.User = utils.get_user_by_token(token["token"], session, token["token_type"])
            session.close()
        reply_data = json.dumps({
            "id": user.id,
            "email": user.email,
            "isAdmin": user.isAdmin,
            "isActivated": user.isActivated
        })
    except Exception:
        reply_data = "0"

    await message.channel.basic_publish(
        exchange="",
        routing_key=message.header.properties.reply_to,
        body=reply_data.encode(),
    )
    await message.channel.basic_ack(delivery_tag=message.delivery.delivery_tag)


async def async_send_profiles_by_emails(message):
    members_array = json.loads(message.body.decode())
    try:
        with db_helper.session_factory() as session:
            for member in members_array:
                fail = True
                user: models.User = views.get_user_by_email(session, member["email"])
                if user:
                    profile: models.Profile = views.get_profile(session, user.id)
                    if profile:
                        fail = False
                        member["profile_id"] = profile.id
                        member["name"]  = profile.name
                        member["isActivated"] = True
                if fail:
                    member["profile_id"] = -1
                    member["name"] = member["email"]
                    member["isActivated"] = False
            session.close()
        reply_data = json.dumps(members_array)
    except Exception as e:
        print(e)
        reply_data = "0"

    await message.channel.basic_publish(
        exchange="",
        routing_key=message.header.properties.reply_to,
        body=reply_data.encode(),
    )
    await message.channel.basic_ack(delivery_tag=message.delivery.delivery_tag)


class AsyncBroker:
    def __init__(self):
        self.host = settings.mq_host
        self.port = settings.mq_port
        self.connection = None
        self.consume_channel = None


    async def get_connection(self):
        self.connection = await aiormq.connect(
            f"amqp://{self.host}:{self.port}/"
        )
        self.consume_channel = await self.connection.channel()

        await self.consume_channel.queue_declare("token_check")
        await self.consume_channel.queue_declare("email_check")

        await self.consume_channel.basic_consume(
            queue="token_check",
            consumer_callback=async_check_token_callback,
        )

        await self.consume_channel.basic_consume(
            queue="email_check",
            consumer_callback=async_send_profiles_by_emails,
        )

        print(0)

    async def close_connection(self):
        await self.consume_channel.close()
        await self.connection.close()



    async def check_club_user_message(self, email):
        message_body = json.dumps(email)

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

        await channel.queue_declare(queue="user_in_club_check")

        await channel.basic_publish(
            exchange="",
            routing_key="user_in_club_check",
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

            return False

rabbitAsync = AsyncBroker()