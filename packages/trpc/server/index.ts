import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";
import { fieldsRouter } from "./routes/fields/route";
import { responsesRouter } from "./routes/responses/route";
import { publicRouter } from "./routes/public/route";
import { themesRouter } from "./routes/themes/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  fields: fieldsRouter,
  responses: responsesRouter,
  public: publicRouter,
  themes: themesRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
