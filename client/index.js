#!/usr/bin/env node

const open = require('amqplib').connect('amqp://192.168.99.100');
const args = process.argv.slice(2);
const uuid = require('uuid');

if (args.length === 0) {
  console.log('Usage: rpc_client.js num');
  process.exit(1);
}

open.then((connection) => {
  return connection.createChannel();
}).then((channel) => {
  channel.assertQueue('', { exclusive: true }).then((q) => {
    const correlationId = uuid.v4();
    const num = parseInt(args[0]);

    console.log(' [x] Requesting rnorm(%d)', num);

    channel.consume(q.queue, (msg) => {
      if (msg.properties.correlationId === correlationId) {
        console.log(' [.] Got [%s]: %s', typeof msg.content, msg.content.toString());

        setTimeout(function () {
          process.exit(0);
        }, 0);
      }
    }, { noAck: true });

    channel.sendToQueue(
      'beast_queue',
      new Buffer(num.toString()),
      { correlationId, replyTo: q.queue }
    );
  });
}).catch(console.error);

