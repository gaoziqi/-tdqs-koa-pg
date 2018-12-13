/*
 * @Author: gzq
 * @Date: 2018-12-13 14:06:53
 * @Last Modified by: gzq
 * @Last Modified time: 2018-12-13 15:02:43
 */

import 'koa';
import { Pool, PoolClient } from 'pg';

declare module 'koa' {
  interface BaseContext {
    koaPg: {
      pool: Pool;
      url: { [path: string]: string[] | '*' };
      mod: 'white' | 'black';
    };
  }

  interface Context {
    conn: PoolClient;
  }
}
