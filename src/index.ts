/*
 * @Author: gzq
 * @Date: 2018-12-13 13:48:28
 * @Last Modified by: gzq
 * @Last Modified time: 2018-12-13 15:14:50
 */

import * as Koa from 'koa';
import { Pool, PoolConfig } from 'pg';

/**
 * @key ctx.path
 * @value '*' or list of ctx.method
 */
export interface IUrlList {
  [path: string]: string[] | '*';
}

export interface IKoaPg {
  pool: Pool;
  url: IUrlList;
  mod: 'white' | 'black';
}

export class KoaPg {
  /**
   * 默认所有url均可使用
   * @param app 传入application对象
   * @param config 传入pg的PoolConfig
   * @param url 传入使用或禁止使用数据库的url
   * @param mode 白名单或黑名单, 默认值白名单
   */
  constructor(
    app: Koa,
    config: PoolConfig,
    url?: IUrlList,
    mode: 'white' | 'black' = 'white',
  ) {
    const koaPg = {} as IKoaPg;
    koaPg.pool = new Pool(config);
    koaPg.url = url;
    koaPg.mod = mode;
    app.context.koaPg = koaPg;
  }

  /**
   * 判断使用db
   * @param mw 使用时调用
   */
  public usedb(mw: Koa.Middleware): Koa.Middleware {
    return async function(ctx, next) {
      if (
        ctx.koaPg.url === undefined ||
        (ctx.koaPg.mod === 'white' &&
          ctx.path in ctx.koaPg.url &&
          (ctx.koaPg.url[ctx.path] === '*' ||
            ctx.koaPg.url[ctx.path].includes(ctx.method))) ||
        (ctx.koaPg.mod === 'black' &&
          !(
            ctx.path in ctx.koaPg.url &&
            (ctx.koaPg.url[ctx.path] === '*' ||
              ctx.koaPg.url[ctx.path].includes(ctx.method))
          ))
      ) {
        console.log(ctx.koaPg.mod);
        await mw.call(this, ctx, next);
      } else {
        await next();
      }
    };
  }

  /**
   * 中间件
   */
  public middleware(): Koa.Middleware {
    return this.usedb(async (ctx, next) => {
      /**
       * 获得connect
       */
      ctx.conn = await ctx.koaPg.pool.connect();
      try {
        await ctx.conn.query('BEGIN');
        await next();
        await ctx.conn.query('COMMIT');
      } catch (e) {
        await ctx.conn.query('ROLLBACK');
        throw e;
      } finally {
        /**
         * 释放connect
         */
        ctx.conn.release();
      }
    });
  }
}
