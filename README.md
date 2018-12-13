# **@tdqs/koa-pg**

The MIT License (MIT)

@tdqs/koa-pg koa middleware based on pg.

### Table of Contents

**[Installation](#installation)**  
**[API documentation](#api-documentation)**  
**[Example](#example)**

## **Installation**

```
    $ npm install @tdqs/koa-pg
```

## **API documentation**

This is a simple code overview of how to use **@tdqs/koa-pg**.

#### KoaPg.constructor

| Param name | Description                                                                   | Mandatory |
| ---------- | ----------------------------------------------------------------------------- | --------- |
| app        | Instance object of koa.Application                                            | **YES**   |
| config     | object which Implementation PoolConfig                                        | **YES**   |
| url        | object which Implementation IKoaPg for allow or prohibit the use of databases | **NO**    |
| mode       | White List or Black List Default white                                        | **NO**    |

#### code simplification

```ts
import { KoaPg } from '@tdqs/koa-pg';
import * as Koa from 'koa';

const conf = {
  database: 'database',
  host: 'host',
  password: 'password',
  port: 5432,
  user: 'user',
};

const app = new Koa();
const koaPg = new KoaPg(app, conf, { '/get': '*', '/sleep': ['get'] });

app.use(koaPg.middleware());
app.use(async ctx => {
  if (ctx.path === '/get') {
    ctx.body = JSON.stringify(await ctx.conn.query('SELECT 123'));
  } else if (ctx.path === '/sleep') {
    ctx.body = JSON.stringify(
      await ctx.conn.query(`SELECT pg_sleep(${ctx.query.time})`),
    );
  } else {
    ctx.body = `conn: ${ctx.conn}`; // undefined
  }
});

app.listen(8080);
```

#### add typings/index.d.ts for hints

```ts
import { IKoaPg } from '@tdqs/koa-pg';
import 'koa';
import { Pool, PoolClient } from 'pg';

declare module 'koa' {
  interface BaseContext {
    koaPg: IKoaPg;
  }

  interface Context {
    conn: PoolClient;
  }
}
```

## **Example**

Following example could be found inside `/example` directory.
