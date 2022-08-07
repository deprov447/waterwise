const Redis = require("ioredis");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const dotenv = require("dotenv");
dotenv.config();

exports.handler = async function (event, context) {
  //  event = {
  //     "path": "Path parameter (original URL encoding)",
  //     "httpMethod": "Incoming request’s method name",
  //     "headers": {Incoming request headers},
  //     "queryStringParameters": {Query string parameters},
  //     "body": "A JSON string of the request payload",
  //     "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encoded"
  //   }

  // return {
  //     "isBase64Encoded": true|false,
  //     "statusCode": httpStatusCode,
  //     "headers": { "headerName": "headerValue", ... },
  //     "multiValueHeaders": { "headerName": ["headerValue", "headerValue2", ...], ... },
  //     "body": "..."
  //   }

  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });

  let client = new Redis(process.env.REDIS_KEY);

  const body = JSON.parse(event.body);
  client.lpush(randomName, body.group_members);
  client.set(`${randomName}:time`, Date.now());

  const members = await client.lrange(randomName, 0, -1);

  return {
    statusCode: 200,
    body: JSON.stringify({ group_name: randomName, group_members: members }),
  };
};
