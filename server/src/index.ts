
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createInvestmentInputSchema, 
  updateInvestmentInputSchema,
  deleteInvestmentInputSchema 
} from './schema';
import { createInvestment } from './handlers/create_investment';
import { getInvestments } from './handlers/get_investments';
import { getInvestmentById } from './handlers/get_investment_by_id';
import { updateInvestment } from './handlers/update_investment';
import { deleteInvestment } from './handlers/delete_investment';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  createInvestment: publicProcedure
    .input(createInvestmentInputSchema)
    .mutation(({ input }) => createInvestment(input)),
    
  getInvestments: publicProcedure
    .query(() => getInvestments()),
    
  getInvestmentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getInvestmentById(input.id)),
    
  updateInvestment: publicProcedure
    .input(updateInvestmentInputSchema)
    .mutation(({ input }) => updateInvestment(input)),
    
  deleteInvestment: publicProcedure
    .input(deleteInvestmentInputSchema)
    .mutation(({ input }) => deleteInvestment(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
