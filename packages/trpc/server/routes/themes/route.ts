import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { getThemeList } from "@repo/services/theme";

const TAGS = ["Themes"];
const getPath = generatePath("/themes");

const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  primaryColor: z.string(),
  backgroundColor: z.string(),
  cardColor: z.string(),
  textColor: z.string(),
  mutedTextColor: z.string(),
  accentColor: z.string(),
  borderColor: z.string(),
  inputBackground: z.string(),
  fontFamily: z.string(),
  emoji: z.string(),
});

export const themesRouter = router({
  list: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(themeSchema))
    .query(() => getThemeList()),
});
