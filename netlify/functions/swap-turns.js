const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

exports.handler = async function (event, context) {
  // @todo: optimize #calls
  let client = new Redis(process.env.REDIS_KEY);

  const body = JSON.parse(event.body);

  const toc = await client.get(`${body.group_name}:time`);
  const allMembers = await client.lrange(body.group_name, 0, -1);

  const daysPassed = Math.floor((Date.now() - toc) / 86400000);
  const whoseTurn = allMembers[daysPassed % allMembers.length];
  const whoFilled = body.whoFilled;

  for (let i = 0; i < allMembers.length; ++i) {
    if (allMembers[i] === whoseTurn) allMembers[i] = whoFilled;
    else if (allMembers[i] === whoFilled) allMembers[i] = whoseTurn;
  }

  client.del(body.group_name);
  allMembers.reverse();
  client.lpush(body.group_name, allMembers);

  return {
    statusCode: 200,
  };
};
