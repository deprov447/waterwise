const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();

exports.handler = async function (event, context) {
  let client = new Redis(process.env.REDIS_KEY);

  const body = JSON.parse(event.body);
  const toc = await client.get(`${body.group_name}:time`);
  const daysPassed = Math.floor((Date.now() - toc) / 86400000);

  const allMembers = await client.lrange(body.group_name, 0, -1);
  console.log(allMembers, daysPassed);
  
  return {
    statusCode: 200,
    body: JSON.stringify(allMembers[daysPassed % allMembers.length]),
  };
};
