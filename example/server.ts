/*
 * @Author: gzq
 * @Date: 2018-12-13 14:52:11
 * @Last Modified by: gzq
 * @Last Modified time: 2018-12-13 15:17:23
 */

import * as Koa from 'koa';
import { KoaPg } from '../src/index';

const app = new Koa();
const conf = {
  database: 'database',
  host: 'host',
  password: 'password',
  port: 5432,
  user: 'user',
};

/** 全部使用数据库（不推荐） */
// const koaPg = new KoaPg(app, conf);

/** 白名单模式（推荐） */
const koaPg = new KoaPg(app, conf, { '/get': '*', '/post': ['PUT', 'POST'] });

/** 黑名单模式（不推荐） */
// const koaPg = new KoaPg(app, conf, { '/get': ['POST'], '/all': '*' }, 'black');

app
  .use(koaPg.middleware())
  .use(async ctx => {
    if (ctx.path === '/get') {
      ctx.body = JSON.stringify(await ctx.conn.query(`SELECT * FROM t_user`));
      console.log(ctx.body);
    } else {
      ctx.body = `conn: ${ctx.conn}`;
    }
  })
  .listen(8080);
