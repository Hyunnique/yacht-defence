const Router = require('koa-router');
const router = new Router();
const fs = require('fs').promises;

router.get("/external/socket.io.min.js", async (ctx, next) => {
    ctx.body = await fs.readFile("./node_modules/socket.io/client-dist/socket.io.min.js", 'utf8');
});

router.get("/external/socket.io.min.js.map", async (ctx, next) => {
    ctx.body = await fs.readFile("./node_modules/socket.io/client-dist/socket.io.min.js.map", 'utf8');
});

module.exports = router;